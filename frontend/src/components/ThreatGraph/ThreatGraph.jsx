import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MOCK_GRAPH_DATA } from '../../data/mockData';

const GROUP_COLORS = {
  external:   '#ff2d55',
  network:    '#00d4ff',
  compute:    '#7c3aed',
  data:       '#ffd60a',
  messaging:  '#ff6b35',
  serverless: '#00ff88',
  security:   '#ff6b35',
  sentinel:   '#00d4ff',
};

const THREAT_COLORS = {
  CRITICAL: '#ff2d55',
  HIGH:     '#ff6b35',
  MEDIUM:   '#ffd60a',
};

export default function ThreatGraph({ threats = [] }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const nodesRef  = useRef([]);
  const linksRef  = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Build threat lookup
    const threatMap = {};
    threats.forEach((t) => {
      t.affected_resources?.forEach((r) => {
        const key = r.split('/').pop();
        threatMap[key] = t.severity;
      });
    });

    // Merge threat data into graph
    const graphData = {
      nodes: MOCK_GRAPH_DATA.nodes.map((n) => {
        const key = n.id.replace(/-/g, '').toLowerCase();
        const match = Object.keys(threatMap).find((k) => k.toLowerCase().includes(key) || key.includes(k.toLowerCase()));
        return { ...n, threat: match ? threatMap[match] : n.threat };
      }),
      links: MOCK_GRAPH_DATA.links,
    };

    // Initialize node physics
    nodesRef.current = graphData.nodes.map((n) => ({
      ...n,
      x: canvas.width * 0.1 + Math.random() * canvas.width * 0.8,
      y: canvas.height * 0.1 + Math.random() * canvas.height * 0.8,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 6 + (n.val || 4) * 1.2,
    }));
    linksRef.current = graphData.links.map((l) => ({ ...l }));

    let t = 0;

    function resolveNode(id) {
      return nodesRef.current.find((n) => n.id === id);
    }

    function draw() {
      t += 0.008;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background gradient
      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      bg.addColorStop(0, 'rgba(13,20,38,1)');
      bg.addColorStop(1, 'rgba(10,14,26,1)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // ── Simple force simulation ──
      const nodes = nodesRef.current;
      nodes.forEach((a) => {
        // repulsion
        nodes.forEach((b) => {
          if (a === b) return;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 1800 / (dist * dist);
          a.vx += (dx / dist) * force * 0.0005;
          a.vy += (dy / dist) * force * 0.0005;
        });
        // center gravity
        a.vx += (w / 2 - a.x) * 0.0001;
        a.vy += (h / 2 - a.y) * 0.0001;
        // damping
        a.vx *= 0.96;
        a.vy *= 0.96;
        a.x += a.vx;
        a.y += a.vy;
        // bounds
        a.x = Math.max(a.radius, Math.min(w - a.radius, a.x));
        a.y = Math.max(a.radius, Math.min(h - a.radius, a.y));
      });

      // link attraction
      linksRef.current.forEach((link) => {
        const s = resolveNode(link.source);
        const tgt = resolveNode(link.target);
        if (!s || !tgt) return;
        const dx = tgt.x - s.x;
        const dy = tgt.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 120) * 0.00015;
        s.vx += dx * force;
        s.vy += dy * force;
        tgt.vx -= dx * force;
        tgt.vy -= dy * force;
      });

      // ── Draw links ──
      linksRef.current.forEach((link) => {
        const s = resolveNode(link.source);
        const tgt = resolveNode(link.target);
        if (!s || !tgt) return;

        const hasThreat = s.threat || tgt.threat;
        const linkColor = hasThreat ? (THREAT_COLORS[s.threat || tgt.threat] || '#00d4ff') : '#1a2744';

        // Animated data-flow particle
        const progress = (Math.sin(t * 1.5 + s.x * 0.01) + 1) / 2;
        const px = s.x + (tgt.x - s.x) * progress;
        const py = s.y + (tgt.y - s.y) * progress;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = hasThreat ? linkColor + '55' : '#1a274455';
        ctx.lineWidth = hasThreat ? 1.5 : 0.8;
        ctx.stroke();

        // particle
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = hasThreat ? linkColor : '#00d4ff88';
        ctx.fill();
      });

      // ── Draw nodes ──
      nodes.forEach((node) => {
        const color = node.threat ? THREAT_COLORS[node.threat] : (GROUP_COLORS[node.group] || '#00d4ff');
        const r = node.radius;

        // Outer pulse ring (threat nodes)
        if (node.threat) {
          const pulse = Math.abs(Math.sin(t * 2.5));
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 6 + pulse * 8, 0, Math.PI * 2);
          ctx.strokeStyle = color + Math.round(pulse * 120 + 40).toString(16).padStart(2, '0');
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Glow
        const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 2.5);
        grd.addColorStop(0, color + 'CC');
        grd.addColorStop(1, color + '00');
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = node.id === 'sentinel-ai'
          ? 'rgba(0,212,255,0.9)'
          : color + 'CC';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.font = node.id === 'sentinel-ai'
          ? 'bold 10px "Orbitron", sans-serif'
          : '9px "Inter", sans-serif';
        ctx.fillStyle = node.threat ? color : '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + r + 14);
      });

      animRef.current = requestAnimationFrame(draw);
    }

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [threats]);

  return (
    <div className="relative w-full h-full">
      {/* Overlay label */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
        <span className="font-mono text-xs text-cyber-cyan opacity-70 tracking-widest">
          LIVE NETWORK TOPOLOGY
        </span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1">
        {[
          { label: 'CRITICAL', color: '#ff2d55' },
          { label: 'HIGH',     color: '#ff6b35' },
          { label: 'SECURE',   color: '#00d4ff' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="font-mono text-xs opacity-60" style={{ color }}>{label}</span>
          </div>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
}

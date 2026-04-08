import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SEV_CONFIG = {
  CRITICAL: { color: '#ff2d55', bg: 'rgba(255,45,85,0.08)',  label: 'CRITICAL', dot: 'animate-pulse-red' },
  HIGH:     { color: '#ff6b35', bg: 'rgba(255,107,53,0.08)', label: 'HIGH',     dot: '' },
  MEDIUM:   { color: '#ffd60a', bg: 'rgba(255,214,10,0.08)', label: 'MEDIUM',   dot: '' },
  LOW:      { color: '#00ff88', bg: 'rgba(0,255,136,0.07)',  label: 'LOW',      dot: '' },
};

const STATUS_COLOR = {
  REMEDIATED:   '#00ff88',
  INVESTIGATING:'#ffd60a',
  PENDING:      '#ff6b35',
};

function timeAgo(ts) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

export default function ThreatFeed({ threats = [], onSelect }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-border flex-shrink-0">
        <span className="font-mono text-xs text-cyber-cyan tracking-widest opacity-70">
          THREAT FEED
        </span>
        <span className="badge badge-critical">{threats.filter(t => t.severity === 'CRITICAL').length} CRITICAL</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-cyber-border">
        <AnimatePresence initial={false}>
          {threats.map((threat, i) => {
            const cfg = SEV_CONFIG[threat.severity] || SEV_CONFIG.LOW;
            return (
              <motion.button
                key={threat.id}
                className="w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors"
                style={{ background: i === 0 && threat.severity === 'CRITICAL' ? cfg.bg : undefined }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect?.(threat)}
              >
                <div className="flex items-start gap-2.5">
                  {/* Severity dot */}
                  <div className="mt-1 flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${cfg.dot}`}
                      style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="font-mono text-xs font-semibold"
                        style={{ color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      <span className="font-mono text-xs text-slate-500">{threat.id}</span>
                    </div>

                    <div className="font-sans text-xs text-slate-200 font-medium truncate">
                      {threat.threat_type}
                    </div>

                    <div className="font-mono text-xs text-slate-500 mt-1 truncate">
                      {threat.affected_resources?.[0]}
                    </div>

                    <div className="flex items-center gap-3 mt-1.5">
                      <span
                        className="font-mono text-xs"
                        style={{ color: STATUS_COLOR[threat.status] || '#94a3b8' }}
                      >
                        {threat.status}
                      </span>
                      <span className="font-mono text-xs text-slate-600">
                        {timeAgo(threat.timestamp)}
                      </span>
                      <span className="ml-auto font-mono text-xs text-slate-500">
                        {Math.round((threat.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

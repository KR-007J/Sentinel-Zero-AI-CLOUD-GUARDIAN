import React from 'react';
import { motion } from 'framer-motion';

const card = (title, value, unit, sub, color, icon) => ({ title, value, unit, sub, color, icon });

export default function MetricCards({ metrics }) {
  const cards = [
    card('Threats Blocked', metrics.threatsBlocked.toLocaleString(), '', 'All time', '#00ff88', '🛡️'),
    card('Avg MTTR', metrics.avgMTTR.toFixed(2), 's', 'Mean time to remediate', '#00d4ff', '⚡'),
    card('Active Threats', metrics.activeThreats, '', 'Requires attention', metrics.activeThreats > 2 ? '#ff2d55' : '#ffd60a', '🔴'),
    card('AI Confidence', (metrics.aiConfidence * 100).toFixed(1), '%', 'Gemini 1.5 Pro', '#7c3aed', '🤖'),
    card('Events / Day', metrics.eventsProcessed.toLocaleString(), '', 'Pub/Sub ingested', '#ff6b35', '📡'),
    card('Uptime', metrics.uptime.toFixed(2), '%', 'System availability', '#00ff88', '✅'),
  ];

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.title}
          className="metric-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          style={{ '--accent': c.color }}
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-lg">{c.icon}</span>
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: c.color }}
            />
          </div>
          <div className="flex items-end gap-1">
            <span
              className="font-display text-2xl font-bold leading-none"
              style={{ color: c.color, textShadow: `0 0 12px ${c.color}55` }}
            >
              {c.value}
            </span>
            {c.unit && (
              <span className="font-mono text-xs mb-0.5" style={{ color: c.color + '99' }}>
                {c.unit}
              </span>
            )}
          </div>
          <div className="mt-1.5">
            <div className="font-sans text-xs text-slate-300 font-medium">{c.title}</div>
            <div className="font-mono text-xs text-slate-500 mt-0.5">{c.sub}</div>
          </div>
          {/* Bottom accent line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px opacity-30"
            style={{ background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }}
          />
        </motion.div>
      ))}
    </div>
  );
}

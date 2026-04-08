import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const SEV_COLOR = {
  CRITICAL: '#ff2d55',
  HIGH:     '#ff6b35',
  MEDIUM:   '#ffd60a',
  LOW:      '#00ff88',
};

export default function AlertPanel({ threat, onClose }) {
  if (!threat) return null;
  const color = SEV_COLOR[threat.severity] || '#00d4ff';

  return (
    <AnimatePresence>
      <motion.div
        key={threat.id}
        className="fixed inset-y-0 right-0 w-full max-w-md z-50 flex flex-col"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          background: 'rgba(10,14,26,0.97)',
          borderLeft: `1px solid ${color}44`,
          backdropFilter: 'blur(20px)',
          boxShadow: `-8px 0 40px ${color}22`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4 border-b"
          style={{ borderColor: color + '33' }}
        >
          <div
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ background: color, boxShadow: `0 0 10px ${color}` }}
          />
          <span
            className="font-display text-sm font-bold tracking-wider"
            style={{ color }}
          >
            {threat.severity} THREAT
          </span>
          <span className="font-mono text-xs text-slate-500 ml-auto">{threat.id}</span>
          <button
            onClick={onClose}
            className="btn-cyber btn-cyber-ghost p-1.5 ml-2"
            aria-label="Close panel"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Threat type */}
          <div>
            <div className="font-mono text-xs text-slate-500 mb-1 tracking-wider">THREAT TYPE</div>
            <div
              className="font-sans text-lg font-semibold"
              style={{ color }}
            >
              {threat.threat_type}
            </div>
          </div>

          {/* Summary */}
          <div className="glass p-4">
            <div className="font-mono text-xs text-slate-500 mb-2 tracking-wider">AI ANALYSIS</div>
            <p className="font-sans text-sm text-slate-300 leading-relaxed">{threat.summary}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Confidence', value: `${Math.round((threat.confidence||0)*100)}%`, icon: Zap },
              { label: 'Status',     value: threat.status,                                icon: threat.status === 'REMEDIATED' ? CheckCircle : Clock },
              { label: 'Auto-Fix',   value: threat.auto_remediate ? 'YES' : 'NO',         icon: Shield },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="glass p-3 text-center">
                <Icon size={14} className="mx-auto mb-1" style={{ color }} />
                <div className="font-mono text-xs text-slate-500">{label}</div>
                <div className="font-mono text-sm mt-0.5" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Affected resources */}
          <div>
            <div className="font-mono text-xs text-slate-500 mb-2 tracking-wider">AFFECTED RESOURCES</div>
            <div className="space-y-1.5">
              {threat.affected_resources?.map((r) => (
                <div key={r} className="flex items-center gap-2 glass px-3 py-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                  <span className="font-mono text-xs text-slate-300">{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Remediation actions */}
          <div>
            <div className="font-mono text-xs text-slate-500 mb-2 tracking-wider">
              REMEDIATION ACTIONS
            </div>
            <div className="space-y-2">
              {threat.remediation_actions?.map((action, i) => (
                <motion.div
                  key={i}
                  className="glass p-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-xs font-semibold"
                      style={{ color: '#00ff88' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-xs text-cyber-cyan">{action.action}</span>
                  </div>
                  <div className="font-mono text-xs text-slate-500 mt-1 ml-6">
                    → {action.resource}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Impact */}
          <div
            className="glass p-4 border"
            style={{ borderColor: color + '44' }}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" style={{ color }} />
              <div>
                <div className="font-mono text-xs text-slate-500 mb-1">ESTIMATED IMPACT</div>
                <p className="font-sans text-sm text-slate-300">{threat.estimated_impact}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-cyber-border">
          <div className="flex gap-3">
            <button className="btn-cyber btn-cyber-primary flex-1 justify-center">
              <Zap size={13} /> FORCE REMEDIATE
            </button>
            <button className="btn-cyber btn-cyber-ghost" onClick={onClose}>
              DISMISS
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

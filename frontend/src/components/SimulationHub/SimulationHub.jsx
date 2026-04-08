import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldAlert, Database, ShieldCheck, Play } from 'lucide-react';

const ATTACKS = [
  { id: 'brute_force_ssh', label: 'SSH Brute Force', icon: Zap, color: '#ff2d55', desc: 'Simulate 1.2k failed logins from external IP' },
  { id: 'iam_escalation',  label: 'IAM Escalation',  icon: ShieldAlert, color: '#ff6b35', desc: 'Unauthorized roles/owner grant to service account' },
  { id: 'data_exfil',      label: 'Data Exfiltration', icon: Database, color: '#ffd60a', desc: 'Large egress spike from GCS prod bucket' },
  { id: 'api_flood',       label: 'API Flood',       icon: Play, color: '#00d4ff', desc: 'Anomalous traffic spike on /admin endpoint' },
];

export default function SimulationHub({ onTrigger, isSimulating }) {
  return (
    <div className="p-4 border-b border-cyber-border">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-cyber-green" />
        <span className="font-display text-xs tracking-widest text-cyber-green">
          THREAT SIMULATION HUB
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {ATTACKS.map((attack) => (
          <motion.button
            key={attack.id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSimulating}
            onClick={() => onTrigger(attack.id)}
            className="flex items-center gap-3 p-3 bg-black/20 hover:bg-black/40 border border-cyber-border hover:border-cyber-cyan/50 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div 
              className="p-2 rounded bg-cyber-bg border border-cyber-border group-hover:border-cyber-cyan/30 transition-colors"
              style={{ color: attack.color }}
            >
              <attack.icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wider">{attack.label}</div>
              <div className="font-sans text-[10px] text-slate-500 truncate">{attack.desc}</div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Zap size={12} className="text-cyber-cyan animate-pulse" />
            </div>
          </motion.button>
        ))}
      </div>
      
      {isSimulating && (
        <div className="mt-4 p-2 bg-cyber-red/10 border border-cyber-red/30 rounded flex items-center gap-2 text-[10px] font-mono text-cyber-red overflow-hidden">
          <div className="w-1.5 h-1.5 rounded-full bg-cyber-red animate-ping shrink-0" />
          <span className="animate-pulse">SIMULATION IN PROGRESS: PIPELINE ACTIVE</span>
        </div>
      )}
    </div>
  );
}

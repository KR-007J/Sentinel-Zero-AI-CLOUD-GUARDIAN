import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Wifi, WifiOff, Zap, Activity } from 'lucide-react';

export default function TopBar({ metrics, connected, onSimulate, isSimulating }) {
  return (
    <header className="topbar glass border-b border-cyber-border flex items-center px-6 gap-6 z-10">
      {/* Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative">
          <Shield
            size={24}
            className="text-cyber-cyan"
            style={{ filter: 'drop-shadow(0 0 8px #00d4ff)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
          </div>
        </div>
        <div>
          <div
            className="font-display font-bold text-sm tracking-widest text-cyber-cyan"
            style={{ textShadow: '0 0 12px #00d4ff88' }}
          >
            SENTINEL
            <span className="text-white">-ZERO</span>
          </div>
          <div className="font-mono text-xs text-slate-500 tracking-wider">AI CLOUD GUARDIAN</div>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex items-center gap-3 ml-2">
        <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
          <span className="font-mono text-xs text-cyber-green">SYSTEM ONLINE</span>
        </div>
        <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
          <Activity size={11} className="text-cyber-cyan" />
          <span className="font-mono text-xs text-cyber-cyan">
            {metrics.eventsProcessed.toLocaleString()} events
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="flex-1" />

      {/* Connection status */}
      <div className="flex items-center gap-2">
        {connected ? (
          <Wifi size={14} className="text-cyber-green" />
        ) : (
          <WifiOff size={14} className="text-cyber-red" />
        )}
        <span className={`font-mono text-xs ${connected ? 'text-cyber-green' : 'text-cyber-red'}`}>
          {connected ? 'FIRESTORE LIVE' : 'OFFLINE — MOCK'}
        </span>
      </div>

      {/* Active threats badge */}
      {metrics.activeThreats > 0 && (
        <motion.div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,45,85,0.12)',
            border: '1px solid rgba(255,45,85,0.4)',
          }}
          animate={{ boxShadow: ['0 0 4px #ff2d5566', '0 0 12px #ff2d5599', '0 0 4px #ff2d5566'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-cyber-red animate-pulse" />
          <span className="font-mono text-xs text-cyber-red font-semibold">
            {metrics.activeThreats} ACTIVE
          </span>
        </motion.div>
      )}

      {/* Simulate attack button */}
      <button
        onClick={onSimulate}
        disabled={isSimulating}
        className="btn-cyber btn-cyber-danger flex items-center gap-2"
        id="btn-simulate-attack"
      >
        <Zap size={13} />
        {isSimulating ? 'SIMULATING...' : 'SIMULATE ATTACK'}
      </button>

      {/* Google Solution Challenge badge */}
      <div className="hidden lg:flex items-center gap-2 glass px-3 py-1.5 rounded-full flex-shrink-0">
        <span className="text-xs">🏆</span>
        <span className="font-mono text-xs text-slate-400">GSC 2026</span>
      </div>
    </header>
  );
}

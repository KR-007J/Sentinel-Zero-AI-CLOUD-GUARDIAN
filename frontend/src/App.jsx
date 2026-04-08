import React, { useState } from 'react';
import TopBar from './components/TopBar/TopBar';
import ThreatGraph from './components/ThreatGraph/ThreatGraph';
import Terminal from './components/Terminal/Terminal';
import ThreatFeed from './components/ThreatFeed/ThreatFeed';
import AlertPanel from './components/AlertPanel/AlertPanel';
import MetricCards from './components/MetricCards/MetricCards';
import SimulationHub from './components/SimulationHub/SimulationHub';
import { useThreats, useMetrics, useTerminalFeed, useSimulatedAttack, useConnectionStatus } from './hooks/useSentinel';

export default function App() {
  const { threats }            = useThreats();
  const metrics                = useMetrics();
  const { lines, addLine }     = useTerminalFeed();
  const connected              = useConnectionStatus();
  const { simulate, isSimulating } = useSimulatedAttack(addLine);
  const [selectedThreat, setSelectedThreat] = useState(null);

  return (
    <div className="war-room-grid relative">
      {/* Immersive effects */}
      <div className="absolute inset-0 pointer-events-none z-[100] vignette opacity-40" />
      <div className="absolute inset-0 pointer-events-none z-[101] bg-noise opacity-[0.03]" />

      {/* ── TOP BAR ── */}
      <TopBar
        metrics={metrics}
        connected={connected}
        onSimulate={() => simulate('brute_force_ssh')}
        isSimulating={isSimulating}
      />

      {/* ── LEFT SIDEBAR — Simulation Hub + Threat Feed ── */}
      <aside className="sidebar-left border-r border-cyber-border flex flex-col bg-cyber-bg/50">
        <SimulationHub onTrigger={simulate} isSimulating={isSimulating} />
        <div className="flex-1 min-h-0 border-t border-cyber-border">
          <ThreatFeed threats={threats} onSelect={setSelectedThreat} />
        </div>
      </aside>

      {/* ── MAIN — 3D Graph + Terminal + Metrics ── */}
      <main className="main-canvas flex flex-col bg-cyber-bg">
        {/* Top metrics row in main canvas for "wowed" look */}
        <div className="grid grid-cols-6 gap-2 p-3 pb-0">
          <MetricCards metrics={metrics} />
        </div>

        {/* 3D Network Graph */}
        <div className="flex-1 relative glass-bright m-3 mb-1.5 overflow-hidden">
          <ThreatGraph threats={threats} />
        </div>

        {/* Live Terminal */}
        <div className="h-56 glass-bright m-3 mt-1.5 overflow-hidden">
          <Terminal lines={lines} />
        </div>
      </main>

      {/* ── RIGHT SIDEBAR — Gemini AI panel ── */}
      <aside className="sidebar-right border-l border-cyber-border flex flex-col bg-cyber-bg/50">
        {/* Gemini AI Header */}
        <div className="p-4 border-b border-cyber-border flex-shrink-0">
          <div className="glass-bright p-4 rounded-lg bg-gradient-to-br from-violet-500/10 to-cyber-cyan/10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_#8b5cf6]" />
              <span className="font-display text-xs tracking-widest text-violet-400">
                GEMINI 1.5 PRO
              </span>
            </div>
            <div className="font-mono text-[10px] text-slate-400 leading-relaxed">
              Autonomous cloud defense agent. Real-time threat detection and structured remediation via Vertex AI.
            </div>
          </div>
        </div>

        {/* Recent AI decisions */}
        <div className="p-4 border-b border-cyber-border flex-shrink-0">
          <div className="font-mono text-[10px] text-slate-500 tracking-wider mb-3">
            RECENT AI REASONING
          </div>
          <div className="space-y-2">
            {threats.slice(0, 4).map((t) => (
              <button
                key={t.id}
                className="w-full text-left glass p-3 hover:glow-cyan transition-all rounded-lg group"
                onClick={() => setSelectedThreat(t)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-slate-300 font-bold tracking-tight">
                    {t.threat_type}
                  </span>
                  <span className={`badge badge-${t.severity.toLowerCase()} text-[8px] px-1.5 py-0`}>
                    {t.severity}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="progress-track flex-1 bg-white/5">
                    <div
                      className="progress-fill shadow-[0_0_4px_currentColor]"
                      style={{
                        width: `${t.confidence * 100}%`,
                        background: t.severity === 'CRITICAL' ? '#ff2d55' :
                                    t.severity === 'HIGH' ? '#ff6b35' :
                                    t.severity === 'MEDIUM' ? '#ffd60a' : '#00ff88',
                        color:      t.severity === 'CRITICAL' ? '#ff2d55' :
                                    t.severity === 'HIGH' ? '#ff6b35' :
                                    t.severity === 'MEDIUM' ? '#ffd60a' : '#00ff88',
                      }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 w-6 text-right">
                    {Math.round(t.confidence * 100)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active Knowledge base */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="font-mono text-[10px] text-slate-500 tracking-wider mb-3">
            GCP DEFENSE PROTOCOLS
          </div>
          
          <div className="space-y-3">
            {[
              { id: 'SOP-01', label: 'Auth Multi-factor requirement', status: 'ENFORCED' },
              { id: 'SOP-02', label: 'Egress traffic monitoring', status: 'ACTIVE' },
              { id: 'SOP-03', label: 'IAM least privilege audit', status: 'SCHEDULED' },
            ].map(sop => (
              <div key={sop.id} className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] text-slate-500">{sop.id}</span>
                  <span className="font-sans text-[11px] text-slate-300">{sop.label}</span>
                </div>
                <span className="font-mono text-[8px] text-cyber-cyan">{sop.status}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 terminal p-3 text-[10px] leading-relaxed border-violet-500/20">
            <span className="terminal-system">SYSTEM PROMPT HASH: 8f2a9b...</span>
            {'\n'}<span className="terminal-info">Gemini-based remediation enabled.</span>
            {'\n'}<span className="terminal-warning">Confidence threshold: 0.85</span>
          </div>
        </div>
      </aside>

      {/* ── SLIDING ALERT PANEL ── */}
      {selectedThreat && (
        <AlertPanel
          threat={selectedThreat}
          onClose={() => setSelectedThreat(null)}
        />
      )}
    </div>
  );
}

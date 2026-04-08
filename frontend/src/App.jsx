import React, { useState } from 'react';
import TopBar from './components/TopBar/TopBar';
import ThreatGraph from './components/ThreatGraph/ThreatGraph';
import Terminal from './components/Terminal/Terminal';
import ThreatFeed from './components/ThreatFeed/ThreatFeed';
import AlertPanel from './components/AlertPanel/AlertPanel';
import MetricCards from './components/MetricCards/MetricCards';
import { useThreats, useMetrics, useTerminalFeed, useSimulatedAttack, useConnectionStatus } from './hooks/useSentinel';

export default function App() {
  const { threats }            = useThreats();
  const metrics                = useMetrics();
  const { lines, addLine }     = useTerminalFeed();
  const connected              = useConnectionStatus();
  const { simulate, isSimulating } = useSimulatedAttack(addLine);
  const [selectedThreat, setSelectedThreat] = useState(null);

  return (
    <div className="war-room-grid">
      {/* ── TOP BAR ── */}
      <TopBar
        metrics={metrics}
        connected={connected}
        onSimulate={simulate}
        isSimulating={isSimulating}
      />

      {/* ── LEFT SIDEBAR — Metrics + Threat Feed ── */}
      <aside className="sidebar-left border-r border-cyber-border flex flex-col">
        <MetricCards metrics={metrics} />
        <div className="flex-1 min-h-0 border-t border-cyber-border">
          <ThreatFeed threats={threats} onSelect={setSelectedThreat} />
        </div>
      </aside>

      {/* ── MAIN — 3D Graph + Terminal ── */}
      <main className="main-canvas flex flex-col">
        {/* 3D Network Graph */}
        <div className="flex-1 relative glass-bright m-3 mb-1.5 overflow-hidden">
          <ThreatGraph threats={threats} />
        </div>

        {/* Live Terminal */}
        <div className="h-48 glass-bright m-3 mt-1.5 overflow-hidden">
          <Terminal lines={lines} />
        </div>
      </main>

      {/* ── RIGHT SIDEBAR — Gemini AI panel ── */}
      <aside className="sidebar-right border-l border-cyber-border flex flex-col">
        {/* Gemini AI Header */}
        <div className="p-4 border-b border-cyber-border flex-shrink-0">
          <div className="glass-bright p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <span className="font-display text-xs tracking-widest text-violet-400">
                GEMINI 1.5 PRO
              </span>
            </div>
            <div className="font-mono text-xs text-slate-400 leading-relaxed">
              Autonomous cloud defense agent. Real-time threat detection and structured remediation via Vertex AI.
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-black/30 rounded p-2 text-center">
                <div className="font-mono text-lg font-bold text-violet-400">
                  {(metrics.aiConfidence * 100).toFixed(1)}%
                </div>
                <div className="font-mono text-xs text-slate-500">Confidence</div>
              </div>
              <div className="bg-black/30 rounded p-2 text-center">
                <div className="font-mono text-lg font-bold text-cyber-cyan">
                  {metrics.avgMTTR.toFixed(2)}s
                </div>
                <div className="font-mono text-xs text-slate-500">MTTR</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent AI decisions */}
        <div className="p-4 border-b border-cyber-border flex-shrink-0">
          <div className="font-mono text-xs text-slate-500 tracking-wider mb-3">
            RECENT AI DECISIONS
          </div>
          <div className="space-y-2">
            {threats.slice(0, 3).map((t) => (
              <button
                key={t.id}
                className="w-full text-left glass p-3 hover:glow-cyan transition-all rounded-lg"
                onClick={() => setSelectedThreat(t)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-slate-300 font-medium">
                    {t.threat_type}
                  </span>
                  <span className={`badge badge-${t.severity.toLowerCase()}`}>
                    {t.severity}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="progress-track flex-1">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${t.confidence * 100}%`,
                        background: t.severity === 'CRITICAL' ? '#ff2d55' :
                                    t.severity === 'HIGH' ? '#ff6b35' :
                                    t.severity === 'MEDIUM' ? '#ffd60a' : '#00ff88',
                      }}
                    />
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    {Math.round(t.confidence * 100)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* System prompt preview */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="font-mono text-xs text-slate-500 tracking-wider mb-3">
            ACTIVE SYSTEM PROMPT
          </div>
          <div className="terminal p-3 text-xs leading-relaxed">
            <span className="terminal-system">You are an autonomous cloud defense agent.</span>
            {'\n'}<span className="terminal-info">Detect anomalies and output structured JSON</span>
            {'\n'}<span className="terminal-info">with severity and remediation actions.</span>
            {'\n\n'}<span className="terminal-prompt">Output schema:</span>
            {'\n'}<span className="terminal-success">{'{ severity, threat_type,'}</span>
            {'\n'}<span className="terminal-success">{'  confidence, remediation_actions,'}</span>
            {'\n'}<span className="terminal-success">{'  auto_remediate }'}</span>
          </div>

          {/* Google Cloud badge */}
          <div className="mt-4 glass p-3 rounded-lg">
            <div className="font-mono text-xs text-slate-500 mb-2">POWERED BY</div>
            <div className="space-y-1.5 text-xs font-mono">
              {[
                ['🔵', 'Vertex AI', 'text-blue-400'],
                ['🟡', 'Cloud Run', 'text-yellow-400'],
                ['🟢', 'Pub/Sub', 'text-green-400'],
                ['🟠', 'Firestore', 'text-orange-400'],
                ['🔴', 'Cloud Armor', 'text-red-400'],
              ].map(([icon, label, cls]) => (
                <div key={label} className={`flex items-center gap-2 ${cls}`}>
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
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

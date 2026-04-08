import React, { useRef, useEffect } from 'react';

export default function Terminal({ lines = [] }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const colorClass = (type) => ({
    system:  'terminal-system',
    info:    'terminal-info',
    success: 'terminal-success',
    warning: 'terminal-warning',
    error:   'terminal-error',
    prompt:  'terminal-prompt',
  }[type] || 'terminal-info');

  const prefix = (type) => ({
    system:  '◈ ',
    info:    '  ',
    success: '✓ ',
    warning: '⚠ ',
    error:   '✗ ',
    prompt:  '$ ',
  }[type] || '  ');

  return (
    <div className="terminal flex flex-col h-full">
      {/* Header */}
      <div className="terminal-header flex-shrink-0">
        <div className="terminal-dot" style={{ background: '#ff2d55' }} />
        <div className="terminal-dot" style={{ background: '#ffd60a' }} />
        <div className="terminal-dot" style={{ background: '#00ff88' }} />
        <span className="ml-2 font-mono text-xs text-cyber-cyan opacity-70 tracking-widest">
          REMEDIATION LOG — LIVE
        </span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
          <span className="font-mono text-xs text-cyber-green opacity-60">STREAMING</span>
        </div>
      </div>

      {/* Lines */}
      <div ref={containerRef} className="flex-1 overflow-y-auto py-2">
        {lines.map((line, i) => (
          <div key={i} className={`terminal-line ${colorClass(line.type)}`}>
            <span className="opacity-40 select-none">{prefix(line.type)}</span>
            {line.text}
          </div>
        ))}
        {/* Blinking cursor */}
        <div className="terminal-line terminal-prompt">
          <span>$ </span>
          <span className="cursor-blink" />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

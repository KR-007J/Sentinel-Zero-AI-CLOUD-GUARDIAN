import { useState, useEffect, useRef, useCallback } from 'react';
import { MOCK_THREATS, MOCK_METRICS, MOCK_TERMINAL_LINES } from '../data/mockData';
import { subscribeToThreats, subscribeToLogs } from '../services/firestore';

// ─── useThreats ─────────────────────────────────────────────────────────────
export function useThreats() {
  const [threats, setThreats] = useState(MOCK_THREATS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToThreats((data) => {
      if (data.length > 0) setThreats(data);
      setLoading(false);
    });
    setLoading(false);
    return unsub;
  }, []);

  return { threats, loading };
}

// ─── useMetrics ──────────────────────────────────────────────────────────────
export function useMetrics() {
  const [metrics, setMetrics] = useState(MOCK_METRICS);

  useEffect(() => {
    // Simulate live counter increments
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        eventsProcessed: prev.eventsProcessed + Math.floor(Math.random() * 12),
        threatsBlocked: prev.threatsBlocked + (Math.random() < 0.05 ? 1 : 0),
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// ─── useTerminalFeed ─────────────────────────────────────────────────────────
export function useTerminalFeed() {
  const [lines, setLines] = useState(MOCK_TERMINAL_LINES);

  useEffect(() => {
    const unsub = subscribeToLogs((logs) => {
      if (logs.length > 0) setLines(logs);
    });
    return unsub;
  }, []);

  const addLine = useCallback((line) => {
    setLines((prev) => [...prev.slice(-199), line]);
  }, []);

  return { lines, addLine };
}

// ─── useSimulatedAttack ───────────────────────────────────────────────────────
export function useSimulatedAttack(addTerminalLine) {
  const [isSimulating, setIsSimulating] = useState(false);
  const timeoutRefs = useRef([]);

  const simulate = useCallback(async (type = 'brute_force_ssh') => {
    if (isSimulating) return;
    setIsSimulating(true);

    const SEQUENCES = {
      brute_force_ssh: [
        { delay: 0,    type: 'system',  text: '[ATTACK SIM] Initiating brute-force SSH simulation...' },
        { delay: 600,  type: 'warning', text: '[SIM] Generating 1200 failed auth packets from 198.51.100.77' },
        { delay: 1400, type: 'warning', text: '[13:XX:XX] ANOMALY DETECTED — 1,200 failed SSH attempts (198.51.100.77)' },
        { delay: 2000, type: 'info',    text: '[GEMINI] Dispatching log batch to Vertex AI for analysis...' },
        { delay: 2800, type: 'success', text: '[GEMINI] CRITICAL — Brute Force SSH Attack | Confidence: 97.2%' },
        { delay: 3400, type: 'success', text: '[REMEDY] Invoking Cloud Armor — blocking IP 198.51.100.77' },
        { delay: 3900, type: 'success', text: '[REMEDY] SSH key rotation triggered on affected VMs' },
        { delay: 5000, type: 'success', text: '✓ THREAT NEUTRALIZED — MTTR: 0.31s | Auto-remediated' },
      ],
      iam_escalation: [
        { delay: 0,    type: 'system',  text: '[ATTACK SIM] Initiating IAM Policy violation simulation...' },
        { delay: 600,  type: 'warning', text: '[SIM] Principal "sa-prod-deployer" requesting roles/owner on root' },
        { delay: 1500, type: 'error',   text: '[13:XX:XX] POLICY VIOLATION: Unauthorized privilege elevation detected' },
        { delay: 2200, type: 'info',    text: '[GEMINI] Reasoning engine analyzing blast radius...' },
        { delay: 3000, type: 'success', text: '[GEMINI] HIGH — Privilege Escalation | Confidence: 89.5%' },
        { delay: 3800, type: 'success', text: '[REMEDY] Revoking roles/owner from sa-prod-deployer' },
        { delay: 4500, type: 'info',    text: '[REMEDY] Isolation policy applied to associated service account' },
        { delay: 5200, type: 'success', text: '✓ POLICY ENFORCED — MTTR: 0.44s' },
      ],
      data_exfil: [
        { delay: 0,    type: 'system',  text: '[ATTACK SIM] Initiating Data Exfiltration simulation...' },
        { delay: 600,  type: 'warning', text: '[SIM] GCS Bucket "prod-data-archive" reporting 4.2GB/min egress' },
        { delay: 1500, type: 'error',   text: '[13:XX:XX] EGRESS SPIKE: Unusual traffic pattern detected' },
        { delay: 2000, type: 'info',    text: '[GEMINI] Inspecting destination IP and metadata...' },
        { delay: 3200, type: 'success', text: '[GEMINI] HIGH — Potential Data Exfiltration | Confidence: 82.1%' },
        { delay: 4000, type: 'warning', text: '[REMEDY] Manual review required: Severity HIGH with confidence < 0.85' },
        { delay: 4800, type: 'info',    text: '[SYSTEM] Security team alerted via PagerDuty' },
      ],
      api_flood: [
        { delay: 0,    type: 'system',  text: '[ATTACK SIM] Initiating API Flood simulation...' },
        { delay: 600,  type: 'warning', text: '[SIM] 15,000 req/sec spike on /api/v1/auth/exchange' },
        { delay: 1500, type: 'warning', text: '[13:XX:XX] TRAFFIC ANOMALY: Rate limit exceeded for 42 IPs' },
        { delay: 2000, type: 'info',    text: '[GEMINI] Analyzing request fingerprints...' },
        { delay: 2800, type: 'success', text: '[GEMINI] MEDIUM — Distributed API Flood | Confidence: 74.5%' },
        { delay: 3500, type: 'success', text: '[REMEDY] Dynamically lowering global rate limits for /auth/*' },
        { delay: 4200, type: 'success', text: '✓ SERVICE STABILIZED — 98% threat traffic dropped' },
      ],
    };

    const sequence = SEQUENCES[type] || SEQUENCES.brute_force_ssh;

    sequence.forEach(({ delay, type, text }) => {
      const t = setTimeout(() => addTerminalLine({ type, text }), delay);
      timeoutRefs.current.push(t);
    });

    const done = setTimeout(() => setIsSimulating(false), 5500);
    timeoutRefs.current.push(done);
  }, [isSimulating, addTerminalLine]);

  useEffect(() => () => timeoutRefs.current.forEach(clearTimeout), []);

  return { simulate, isSimulating };
}

// ─── useConnectionStatus ─────────────────────────────────────────────────────
export function useConnectionStatus() {
  const [connected, setConnected] = useState(true);
  useEffect(() => {
    const check = () => setConnected(navigator.onLine);
    window.addEventListener('online', check);
    window.addEventListener('offline', check);
    return () => { window.removeEventListener('online', check); window.removeEventListener('offline', check); };
  }, []);
  return connected;
}

import { analyzeThreat } from './gemini.js';
import { saveThreat, saveLog } from './firestore.js';
import { executeRemediation } from './remediation.js';
import { logger } from './index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Main dispatcher — orchestrates the full Sentinel-Zero pipeline:
 * Pub/Sub event → Gemini analysis → Firestore → Remediation
 */
export async function handlePubSubMessage(payload) {
  const startTime = Date.now();

  // 1. Enrich with internal metadata
  const event = {
    id: uuidv4(),
    receivedAt: new Date().toISOString(),
    source: payload.resource?.type || 'unknown',
    raw: payload,
  };

  await saveLog({
    type: 'info',
    text: `[${new Date().toLocaleTimeString()}] Event received: ${event.source} — dispatching to Vertex AI (Gemini)`,
    timestamp: new Date().toISOString(),
  });

  // 2. Call Gemini for threat analysis
  let analysis;
  try {
    analysis = await analyzeThreat(payload);
    logger.info(`[Gemini] Analysis complete — severity: ${analysis.severity}, confidence: ${analysis.confidence}`);
  } catch (err) {
    logger.error(`[Gemini] Analysis failed: ${err.message}`);
    return;
  }

  // 3. Persist to Firestore
  const threat = {
    ...analysis,
    id: `THR-${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: analysis.auto_remediate ? 'REMEDIATING' : 'INVESTIGATING',
    raw_event_id: event.id,
  };
  await saveThreat(threat);

  await saveLog({
    type: analysis.severity === 'CRITICAL' ? 'error' : 'warning',
    text: `[GEMINI] ${analysis.severity} — ${analysis.threat_type} | Confidence: ${(analysis.confidence * 100).toFixed(1)}%`,
    timestamp: new Date().toISOString(),
  });

  // 4. Execute auto-remediation if enabled
  if (analysis.auto_remediate) {
    try {
      await executeRemediation(threat, saveLog);
      const mttr = ((Date.now() - startTime) / 1000).toFixed(2);

      await saveLog({
        type: 'success',
        text: `✓ THREAT NEUTRALIZED — MTTR: ${mttr}s | ${threat.id}`,
        timestamp: new Date().toISOString(),
      });

      // Update status in Firestore
      await saveThreat({ ...threat, status: 'REMEDIATED', mttr: parseFloat(mttr) });
    } catch (err) {
      logger.error(`[Remediation] Failed: ${err.message}`);
      await saveLog({
        type: 'error',
        text: `[REMEDY FAILED] ${err.message} — manual intervention required`,
        timestamp: new Date().toISOString(),
      });
    }
  } else {
    await saveLog({
      type: 'warning',
      text: `⚠ PENDING HUMAN REVIEW: ${threat.id} — auto_remediate disabled`,
      timestamp: new Date().toISOString(),
    });
  }
}

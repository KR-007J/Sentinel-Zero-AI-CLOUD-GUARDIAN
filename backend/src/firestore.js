import { Firestore } from '@google-cloud/firestore';
import { logger } from './index.js';

const db = new Firestore({
  projectId: process.env.PROJECT_ID,
  databaseId: process.env.FIRESTORE_DB || '(default)',
});

/**
 * Persist a threat document.
 */
export async function saveThreat(threat) {
  try {
    const ref = db.collection('threats').doc(threat.id || `THR-${Date.now()}`);
    await ref.set(threat, { merge: true });
    logger.info(`[Firestore] Threat saved: ${threat.id}`);
  } catch (err) {
    logger.error(`[Firestore] saveThreat failed: ${err.message}`);
  }
}

/**
 * Append a remediation log line.
 */
export async function saveLog(logLine) {
  try {
    await db.collection('remediation_logs').add({
      ...logLine,
      createdAt: Firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    logger.error(`[Firestore] saveLog failed: ${err.message}`);
  }
}

/**
 * Fetch recent threats (latest first).
 */
export async function getRecentThreats(limitCount = 50) {
  try {
    const snap = await db
      .collection('threats')
      .orderBy('timestamp', 'desc')
      .limit(limitCount)
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    logger.error(`[Firestore] getRecentThreats failed: ${err.message}`);
    return [];
  }
}

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { firebaseConfig } from '../firebase.config';

let app, db;

// Use real Firebase only if config values are present
const isConfigured = () => !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined';

function getDb() {
  if (!db && isConfigured()) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
  return db;
}

/**
 * Subscribe to real-time threat updates from Firestore.
 * Falls back to a no-op if Firebase is not configured.
 */
export function subscribeToThreats(callback) {
  const db = getDb();
  if (!db) {
    console.warn('[Sentinel] Firebase not configured — using mock data');
    return () => {};
  }

  const q = query(
    collection(db, 'threats'),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const threats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(threats);
  });
}

/**
 * Subscribe to remediation logs (terminal feed).
 */
export function subscribeToLogs(callback) {
  const db = getDb();
  if (!db) return () => {};

  const q = query(
    collection(db, 'remediation_logs'),
    orderBy('timestamp', 'desc'),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(logs.reverse());
  });
}

/**
 * Manually trigger a simulated attack event (demo mode).
 */
export async function triggerSimulatedAttack(type = 'brute_force') {
  const db = getDb();
  if (!db) {
    console.warn('[Sentinel] Firebase not configured — simulation in mock mode');
    return null;
  }

  await addDoc(collection(db, 'simulated_attacks'), {
    type,
    timestamp: serverTimestamp(),
    source: 'war_room_ui',
  });
}

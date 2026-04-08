import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createLogger, format, transports } from 'winston';
import { handlePubSubMessage } from './dispatcher.js';
import { triggerSimulation } from './remediation.js';

const app = express();
const PORT = process.env.PORT || 8080;

// ── Logger ───────────────────────────────────────────────────────────────────
export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.colorize(),
    format.printf(({ timestamp, level, message }) =>
      `[${timestamp}] ${level}: ${message}`
    )
  ),
  transports: [new transports.Console()],
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({
  status: 'ok',
  service: 'sentinel-zero-backend',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}));

// ── Pub/Sub push webhook ──────────────────────────────────────────────────────
// Cloud Pub/Sub pushes base64-encoded messages to this endpoint
app.post('/webhook/pubsub', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.data) {
      return res.status(400).json({ error: 'No message data' });
    }

    const payload = JSON.parse(Buffer.from(message.data, 'base64').toString('utf8'));
    logger.info(`[Pub/Sub] Received event: ${JSON.stringify(payload).substring(0, 120)}...`);

    // Process asynchronously — respond 200 immediately to ACK
    res.status(200).send('OK');
    await handlePubSubMessage(payload);
  } catch (err) {
    logger.error(`[Webhook] Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// ── Simulation trigger (UI Demo) ──────────────────────────────────────────────
app.post('/api/simulate', async (req, res) => {
  try {
    const { type = 'brute_force_ssh' } = req.body;
    logger.info(`[Simulate] Triggering attack type: ${type}`);
    const result = await triggerSimulation(type);
    res.json({ success: true, result });
  } catch (err) {
    logger.error(`[Simulate] Error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// ── List recent threats ───────────────────────────────────────────────────────
app.get('/api/threats', async (req, res) => {
  try {
    const { getRecentThreats } = await import('./firestore.js');
    const threats = await getRecentThreats(50);
    res.json({ threats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🛡️  Sentinel-Zero Backend running on port ${PORT}`);
  logger.info(`   PROJECT_ID  : ${process.env.PROJECT_ID || '(not set)'}`);
  logger.info(`   LOCATION    : ${process.env.LOCATION || 'us-central1'}`);
});

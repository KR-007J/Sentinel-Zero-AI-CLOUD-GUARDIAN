import { VertexAI } from '@google-cloud/vertexai';
import { logger } from './index.js';
import { THREAT_ANALYSIS_PROMPT } from './prompts.js';

const PROJECT_ID = process.env.PROJECT_ID || 'your-gcp-project-id';
const LOCATION   = process.env.LOCATION   || 'us-central1';
const MODEL      = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

let vertexAI, model;

function getModel() {
  if (!model) {
    vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    model = vertexAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        temperature: 0.1,       // Low temp for deterministic security decisions
        topP: 0.8,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    });
  }
  return model;
}

/**
 * Analyze a GCP log event and return structured threat assessment.
 * @param {object} logEvent — Raw Cloud Logging / Pub/Sub payload
 * @returns {object} Structured threat analysis JSON
 */
export async function analyzeThreat(logEvent) {
  const m = getModel();

  const userContent = [
    {
      role: 'user',
      parts: [{
        text: `Analyze this GCP log event for security threats:\n\n${JSON.stringify(logEvent, null, 2)}`
      }],
    },
  ];

  const request = {
    systemInstruction: { parts: [{ text: THREAT_ANALYSIS_PROMPT }] },
    contents: userContent,
  };

  try {
    const response = await m.generateContent(request);
    const raw = response.response.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(raw);

    // Validate required fields, apply defaults
    return {
      threat_id:            parsed.threat_id            || `GEMINI-${Date.now()}`,
      severity:             parsed.severity             || 'LOW',
      threat_type:          parsed.threat_type          || 'Unknown Anomaly',
      affected_resources:   parsed.affected_resources   || [],
      confidence:           Math.min(1, Math.max(0, parsed.confidence || 0.5)),
      summary:              parsed.summary              || 'Anomaly detected by Gemini.',
      remediation_actions:  parsed.remediation_actions  || [],
      estimated_impact:     parsed.estimated_impact     || 'Unknown',
      auto_remediate:       !!parsed.auto_remediate,
    };
  } catch (err) {
    logger.error(`[Gemini] Parse error: ${err.message}`);
    // Return a safe fallback so the pipeline doesn't crash
    return {
      threat_id:           `GEMINI-ERR-${Date.now()}`,
      severity:            'MEDIUM',
      threat_type:         'Analysis Error',
      affected_resources:  [],
      confidence:          0.3,
      summary:             `Gemini analysis failed: ${err.message}`,
      remediation_actions: [],
      estimated_impact:    'Unknown — manual review required',
      auto_remediate:      false,
    };
  }
}

/**
 * Logistics Incident Copilot — Node.js Backend
 * ─────────────────────────────────────────────
 * Setup:
 *   npm init -y
 *   npm install express openai dotenv cors
 *
 * .env:
 *   OPENAI_API_KEY=sk-...
 *   PORT=3001
 *
 * Run:
 *   node server.js
 */

import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { config } from "dotenv";

config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4o-mini"; // swap to "gpt-4o" for higher quality

// ─── HISTORICAL DATA (mock — replace with DB queries in production) ──────────

const HISTORICAL_DATA = {
  breakdown: {
    similar_incidents_12m: 7,
    carrier_incidents: { ABC: 5, RMF: 1, ETG: 1 },
    route_disruption_rate: { "Warsaw→Amsterdam": 0.18 },
    avg_recovery_hours: 4.2,
  },
  weather: {
    similar_incidents_12m: 12,
    highest_disruption_quarter: "Q1 (Jan–Mar)",
    total_penalty_ytd_eur: 31000,
    successful_reroutes: 4,
    reroute_avg_cost_eur: 260,
  },
  cancellation: {
    similar_incidents_12m: 4,
    carrier_cancellations: { ETG: 4 },
    pharma_cargo_incidents: 3,
    total_exposure_eur: 18000,
    etg_cancellation_rate_pct: 8.3,
  },
};

// ─── PROMPT BUILDERS ─────────────────────────────────────────────────────────

function buildAnalysisPrompt(incidentType, incidentDescription, shipment) {
  const hist = HISTORICAL_DATA[incidentType];
  return `You are an expert logistics operations AI. Analyze the incident below and respond ONLY with valid JSON — no markdown, no explanation, no code fences.

INCIDENT TYPE: ${incidentType.toUpperCase()}
DESCRIPTION: ${incidentDescription}

SHIPMENT:
  ID: ${shipment.shipmentId}
  Route: ${shipment.route}
  Cargo: ${shipment.cargo}
  Carrier: ${shipment.carrier} (ID: ${shipment.carrierId})
  Client: ${shipment.client}
  Current ETA: ${shipment.eta}
  Cargo Value: ${shipment.value}
  Position: ${shipment.position}
  KM Remaining: ${shipment.kmLeft}
  Hours to Deadline: ${shipment.hoursToDeadline}

HISTORICAL DATA:
${JSON.stringify(hist, null, 2)}

Respond with exactly this JSON structure:
{
  "severity": "HIGH" | "CRITICAL" | "MEDIUM",
  "key_facts": [
    { "label": "string", "value": "string" }
  ],
  "options": [
    {
      "id": "A",
      "label": "short action title",
      "time_impact": "delivery time description",
      "cost_delta": "+€XXX or €0",
      "risk_level": "Low" | "Medium" | "High",
      "recommended": true | false,
      "note": "one sentence rationale",
      "action_carrier": "carrier name or action taken",
      "action_eta": "new ETA string"
    }
  ],
  "recommended_option": "A" | "B" | "C",
  "reasoning": "2-3 sentence explanation of why this option is best"
}

Rules:
- Always provide exactly 3 options (A, B, C)
- Exactly one option has recommended: true
- key_facts must have 5 items
- Be specific with costs and times based on the scenario`;
}

function buildClientMessagePrompt(incidentType, selectedOption, optionDetails, shipment) {
  return `You are a logistics operations manager writing a client notification email.

SITUATION:
  Shipment: ${shipment.shipmentId}
  Route: ${shipment.route}
  Cargo: ${shipment.cargo}
  Client: ${shipment.client}
  Incident: ${incidentType}
  Resolution chosen: Option ${selectedOption}
  New carrier / action: ${optionDetails.actionCarrier}
  New ETA: ${optionDetails.actionEta}
  Cost impact: ${optionDetails.costDelta}

Write a professional, empathetic 3-paragraph email body (no subject line):
1. Briefly explain what happened
2. Explain what action was taken and the new ETA
3. Apologize and offer contact for questions

Be specific — use the shipment ID, route, and actual details. Sound human, not template-like.
Return only the email text. No JSON, no markdown, no subject line.`;
}

function buildLessonsPrompt(incidentType, selectedOption, shipment) {
  const hist = HISTORICAL_DATA[incidentType];
  return `You are a logistics analytics expert generating a post-incident lessons learned report.

INCIDENT: ${incidentType} on route ${shipment.route}
CARRIER: ${shipment.carrier} (${shipment.carrierId})
RESOLUTION: Option ${selectedOption} was chosen
HISTORICAL DATA: ${JSON.stringify(hist, null, 2)}

Respond ONLY with valid JSON, no markdown, no code fences:
{
  "stats": [
    { "value": "number or %", "label": "context description" },
    { "value": "number or %", "label": "context description" },
    { "value": "number or %", "label": "context description" }
  ],
  "insights": [
    "data-backed insight 1",
    "data-backed insight 2",
    "data-backed insight 3"
  ],
  "recommendation": "one concrete, actionable recommendation"
}

Rules:
- Stats must reference numbers from historical data
- Insights must be specific, not generic
- Recommendation must be a concrete action (e.g. 'Add X as backup carrier for Y lane')`;
}

function buildFreightAuditPrompt(carrier, incidentType, route, originalCostEur, additionalCostEur) {
  return `Write a short professional freight audit claim notice.

Carrier: ${carrier}
Incident type: ${incidentType}
Route: ${route}
Original contracted cost: €${originalCostEur.toLocaleString()}
Additional cost incurred due to incident: €${additionalCostEur.toLocaleString()}

Write 2 paragraphs: first stating the facts of the incident and costs, second formally requesting reimbursement.
Be factual, firm, and professional. Return only the plain text. No JSON, no markdown.`;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function callOpenAI(prompt, expectJson = true) {
  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_tokens: expectJson ? 1500 : 600,
    messages: [{ role: "user", content: prompt }],
    ...(expectJson && { response_format: { type: "json_object" } }),
  });
  const text = response.choices[0].message.content.trim();
  if (expectJson) {
    return JSON.parse(text);
  }
  return text;
}

function validIncidentType(type) {
  return ["breakdown", "weather", "cancellation"].includes(type);
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Logistics Incident Copilot API", model: MODEL });
});

/**
 * POST /api/analyze-incident
 * Triggered immediately when an incident occurs.
 * Returns severity, key facts, and 3 resolution options.
 *
 * Body:
 * {
 *   incidentType: "breakdown" | "weather" | "cancellation",
 *   incidentDescription: "string",
 *   shipment: { shipmentId, route, cargo, carrier, carrierId,
 *               client, eta, value, position, kmLeft, hoursToDeadline }
 * }
 */
app.post("/api/analyze-incident", async (req, res) => {
  const { incidentType, incidentDescription, shipment } = req.body;

  if (!validIncidentType(incidentType)) {
    return res.status(400).json({ error: "Invalid incidentType" });
  }
  if (!incidentDescription || !shipment) {
    return res.status(400).json({ error: "incidentDescription and shipment are required" });
  }

  try {
    const prompt = buildAnalysisPrompt(incidentType, incidentDescription, shipment);
    const analysis = await callOpenAI(prompt, true);
    res.json({ success: true, analysis });
  } catch (err) {
    console.error("[analyze-incident]", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/generate-actions
 * Called after dispatcher selects a resolution option.
 * Returns client email + lessons learned (two parallel AI calls).
 *
 * Body:
 * {
 *   incidentType: "breakdown" | "weather" | "cancellation",
 *   selectedOption: "A" | "B" | "C",
 *   optionDetails: { actionCarrier, actionEta, costDelta },
 *   shipment: { ...same as above }
 * }
 */
app.post("/api/generate-actions", async (req, res) => {
  const { incidentType, selectedOption, optionDetails, shipment } = req.body;

  if (!validIncidentType(incidentType)) {
    return res.status(400).json({ error: "Invalid incidentType" });
  }
  if (!selectedOption || !optionDetails || !shipment) {
    return res.status(400).json({ error: "selectedOption, optionDetails, and shipment are required" });
  }

  try {
    // Run both AI calls in parallel
    const [clientMessage, lessons] = await Promise.all([
      callOpenAI(buildClientMessagePrompt(incidentType, selectedOption, optionDetails, shipment), false),
      callOpenAI(buildLessonsPrompt(incidentType, selectedOption, shipment), true),
    ]);

    res.json({
      success: true,
      clientMessage,
      lessonsLearned: lessons,
      auditLog: {
        shipmentId: shipment.shipmentId,
        incidentType,
        selectedOption,
        newCarrier: optionDetails.actionCarrier,
        newEta: optionDetails.actionEta,
        costDelta: optionDetails.costDelta,
        resolvedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[generate-actions]", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/freight-audit
 * Optional: Generate a formal carrier claim notice.
 *
 * Body:
 * {
 *   carrier: "string",
 *   incidentType: "string",
 *   route: "string",
 *   originalCostEur: number,
 *   additionalCostEur: number
 * }
 */
app.post("/api/freight-audit", async (req, res) => {
  const { carrier, incidentType, route, originalCostEur, additionalCostEur } = req.body;

  if (!carrier || !route || !originalCostEur || !additionalCostEur) {
    return res.status(400).json({ error: "carrier, route, originalCostEur, additionalCostEur are required" });
  }

  try {
    const prompt = buildFreightAuditPrompt(carrier, incidentType, route, originalCostEur, additionalCostEur);
    const claimText = await callOpenAI(prompt, false);
    res.json({ success: true, claimText });
  } catch (err) {
    console.error("[freight-audit]", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚚 Logistics Incident Copilot API`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Model: ${MODEL}`);
  console.log(`   Docs: http://localhost:${PORT}/health\n`);
});
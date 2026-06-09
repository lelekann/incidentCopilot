/**
 * Logistics Incident Copilot — Node.js Backend v2
 * ─────────────────────────────────────────────────
 * Setup:
 *   npm install express openai dotenv cors
 *
 * .env:
 *   OPENAI_API_KEY=sk-...
 *   PORT=3001
 *
 * Folder structure:
 *   server.js
 *   db/
 *     carriers.json
 *     shipments.json
 *     incident_history.json
 */

import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4o-mini";

// ─── LOAD MOCK DB ─────────────────────────────────────────────────────────────

const db = {
  carriers: JSON.parse(readFileSync(join(__dirname, "db/carriers.json"), "utf8")),
  shipments: JSON.parse(readFileSync(join(__dirname, "db/shipments.json"), "utf8")),
  incidents: JSON.parse(readFileSync(join(__dirname, "db/incident_history.json"), "utf8")),
};

// ─── DB QUERY HELPERS ─────────────────────────────────────────────────────────

function getShipment(shipmentId) {
  return db.shipments.find(s => s.id === shipmentId) || null;
}

function getCarrier(carrierId) {
  return db.carriers.find(c => c.id === carrierId) || null;
}

function findBackupCarriers(route, cargoType, tempRequired, excludeCarrierId) {
  return db.carriers.filter(c =>
    c.id !== excludeCarrierId &&
    c.available_trucks > 0 &&
    (tempRequired ? c.temp_controlled === true : true) &&
    (c.active_routes.includes(route) || c.specializations.includes(cargoType))
  ).sort((a, b) => b.rating - a.rating);
}

function getIncidentHistory(incidentType, carrierId, route) {
  const byCarrier = db.incidents.filter(i => i.carrier_id === carrierId);
  const byRoute   = db.incidents.filter(i => i.route === route);
  const byType    = db.incidents.filter(i => i.type === incidentType);

  return {
    carrier_total_incidents: byCarrier.length,
    carrier_same_type: byCarrier.filter(i => i.type === incidentType).length,
    route_disruption_count: byRoute.length,
    type_total_in_network: byType.length,
    avg_cost_delta_eur: byType.length
      ? Math.round(byType.reduce((s, i) => s + i.cost_delta_eur, 0) / byType.length)
      : 0,
    deadline_met_rate_pct: byType.length
      ? Math.round((byType.filter(i => i.deadline_met).length / byType.length) * 100)
      : 0,
    most_used_resolution: (() => {
      const counts = {};
      byType.forEach(i => { counts[i.resolution_label] = (counts[i.resolution_label] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    })(),
    recent_incidents: byCarrier.slice(-3).map(i => ({
      date: i.date, type: i.type,
      resolution: i.resolution_label, deadline_met: i.deadline_met,
    })),
  };
}

// ─── PROMPT BUILDERS ─────────────────────────────────────────────────────────

function buildAnalysisPrompt(incidentType, incidentDescription, shipment, carrier, backupCarriers, history) {
  return `You are an expert logistics operations AI. Analyze this incident and return ONLY valid JSON — no markdown, no explanation.

INCIDENT TYPE: ${incidentType.toUpperCase()}
DESCRIPTION: ${incidentDescription}

AFFECTED SHIPMENT:
${JSON.stringify(shipment, null, 2)}

CURRENT CARRIER PROFILE:
${JSON.stringify(carrier, null, 2)}

AVAILABLE BACKUP CARRIERS (top 3 by rating, filtered for this route/cargo):
${JSON.stringify(backupCarriers.slice(0, 3), null, 2)}

HISTORICAL INCIDENT DATA (this carrier + route + type):
${JSON.stringify(history, null, 2)}

Based on ALL the above real data, generate a response in this exact JSON structure:
{
  "severity": "HIGH",
  "key_facts": [
    { "label": "string", "value": "string" }
  ],
  "options": [
    {
      "id": "A",
      "label": "short action title",
      "time_impact": "specific delivery time",
      "cost_delta": "+€XXX",
      "risk_level": "Low",
      "recommended": true,
      "note": "one sentence — reference actual carrier names and costs from the data",
      "action_carrier": "use actual carrier name from backup list",
      "action_eta": "specific new ETA"
    }
  ],
  "recommended_option": "A",
  "reasoning": "2-3 sentences referencing actual data: carrier rating, history, costs"
}

Rules:
- Exactly 3 options (A, B, C), exactly one recommended: true
- 5 key_facts items
- Use REAL carrier names from the backup list
- Reference actual ratings, prices, history numbers in reasoning
- Be specific with ETA times based on hours_to_deadline`;
}

function buildClientMessagePrompt(incidentType, selectedOption, optionDetails, shipment) {
  return `Write a professional logistics client notification email body.

Shipment ID: ${shipment.id}
Route: ${shipment.route}
Cargo: ${shipment.cargo}
Client: ${shipment.client}
Incident: ${incidentType}
Resolution: ${optionDetails.action_carrier}
New ETA: ${optionDetails.action_eta}
Cost impact: ${optionDetails.cost_delta}

3 paragraphs: (1) what happened, (2) what was done and new ETA, (3) apology and contact offer.
Use the shipment ID and actual details. Sound human. Return only the email body — no subject, no JSON.`;
}

function buildLessonsPrompt(incidentType, shipment, carrier, history) {
  return `Generate a post-incident lessons learned report based on this real data.

Incident type: ${incidentType}
Route: ${shipment.route}
Carrier: ${carrier.name} (rating: ${carrier.rating}, breakdown rate: ${carrier.breakdown_rate_pct}%, cancellation rate: ${carrier.cancellation_rate_pct}%)
Historical analysis: ${JSON.stringify(history, null, 2)}

Return ONLY valid JSON:
{
  "stats": [
    { "value": "string", "label": "string" },
    { "value": "string", "label": "string" },
    { "value": "string", "label": "string" }
  ],
  "insights": [
    "specific insight referencing real numbers",
    "specific insight referencing real numbers",
    "specific insight referencing real numbers"
  ],
  "recommendation": "one concrete action — name the carrier, route, or metric"
}

Use actual numbers from historical data. Do not invent statistics.`;
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
  return expectJson ? JSON.parse(text) : text;
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

app.get("/health", (req, res) => {
  res.json({
    status: "ok", service: "Logistics Incident Copilot API v2", model: MODEL,
    db: { carriers: db.carriers.length, shipments: db.shipments.length, incidents: db.incidents.length },
  });
});

app.get("/api/shipments", (req, res) => {
  res.json({ success: true, shipments: db.shipments });
});

app.get("/api/carriers", (req, res) => {
  res.json({ success: true, carriers: db.carriers });
});

app.post("/api/analyze-incident", async (req, res) => {
  const { shipmentId, incidentType, incidentDescription } = req.body;

  if (!["breakdown", "weather", "cancellation"].includes(incidentType)) {
    return res.status(400).json({ error: "Invalid incidentType" });
  }

  const shipment = getShipment(shipmentId);
  if (!shipment) return res.status(404).json({ error: `Shipment ${shipmentId} not found` });

  const carrier = getCarrier(shipment.carrier_id);
  if (!carrier) return res.status(404).json({ error: `Carrier not found` });

  const backupCarriers = findBackupCarriers(
    shipment.route, shipment.cargo_type, shipment.temp_required, shipment.carrier_id
  );
  const history = getIncidentHistory(incidentType, shipment.carrier_id, shipment.route);

  try {
    const analysis = await callOpenAI(
      buildAnalysisPrompt(incidentType, incidentDescription, shipment, carrier, backupCarriers, history),
      true
    );
    res.json({ success: true, analysis, context: { shipment, carrier, backupCarriers: backupCarriers.slice(0, 3), history } });
  } catch (err) {
    console.error("[analyze-incident]", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/generate-actions", async (req, res) => {
  const { shipmentId, incidentType, selectedOption, optionDetails } = req.body;

  const shipment = getShipment(shipmentId);
  if (!shipment) return res.status(404).json({ error: `Shipment ${shipmentId} not found` });

  const carrier = getCarrier(shipment.carrier_id);
  const history = getIncidentHistory(incidentType, shipment.carrier_id, shipment.route);

  try {
    const [clientMessage, lessons] = await Promise.all([
      callOpenAI(buildClientMessagePrompt(incidentType, selectedOption, optionDetails, shipment), false),
      callOpenAI(buildLessonsPrompt(incidentType, shipment, carrier, history), true),
    ]);
    res.json({
      success: true, clientMessage, lessonsLearned: lessons,
      auditLog: {
        shipmentId: shipment.id, incidentType, selectedOption,
        newCarrier: optionDetails.action_carrier, newEta: optionDetails.action_eta,
        costDelta: optionDetails.cost_delta, resolvedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("[generate-actions]", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/freight-audit", async (req, res) => {
  const { shipmentId, additionalCostEur } = req.body;
  const shipment = getShipment(shipmentId);
  if (!shipment) return res.status(404).json({ error: "Shipment not found" });
  const carrier = getCarrier(shipment.carrier_id);

  const prompt = `Write a 2-paragraph professional freight audit claim.
Carrier: ${carrier?.name}. Route: ${shipment.route}.
Original cost: €${Math.round(shipment.km_left * (carrier?.price_per_km_eur || 1.5)).toLocaleString()}.
Additional cost: €${additionalCostEur.toLocaleString()}. Reason: emergency carrier replacement.
Paragraph 1: facts. Paragraph 2: reimbursement request. Plain text only.`;

  try {
    const claimText = await callOpenAI(prompt, false);
    res.json({ success: true, claimText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚚 Logistics Incident Copilot API v2`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   DB: ${db.carriers.length} carriers · ${db.shipments.length} shipments · ${db.incidents.length} incidents\n`);
});
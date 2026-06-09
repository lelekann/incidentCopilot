import * as incidentService from "../services/incidentService.js";

const VALID_INCIDENT_TYPES = ["breakdown", "weather", "cancellation"];

// POST /api/analyze-incident
export async function analyzeIncident(req, res) {
  const { shipmentId, incidentType, incidentDescription } = req.body;

  if (!shipmentId) {
    return res.status(400).json({ error: "shipmentId is required" });
  }
  if (!VALID_INCIDENT_TYPES.includes(incidentType)) {
    return res.status(400).json({
      error: `Invalid incidentType. Must be one of: ${VALID_INCIDENT_TYPES.join(", ")}`,
    });
  }
  if (!incidentDescription) {
    return res.status(400).json({ error: "incidentDescription is required" });
  }

  try {
    const result = await incidentService.analyzeIncident({
      shipmentId,
      incidentType,
      incidentDescription,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    console.error("[analyzeIncident]", message);
    res.status(status).json({ error: message });
  }
}

// POST /api/generate-actions
export async function generateActions(req, res) {
  const { shipmentId, incidentType, selectedOption, optionDetails } = req.body;

  if (!shipmentId) {
    return res.status(400).json({ error: "shipmentId is required" });
  }
  if (!VALID_INCIDENT_TYPES.includes(incidentType)) {
    return res.status(400).json({ error: "Invalid incidentType" });
  }
  if (!selectedOption || !["A", "B", "C"].includes(selectedOption)) {
    return res.status(400).json({ error: "selectedOption must be A, B, or C" });
  }
  if (!optionDetails?.action_carrier || !optionDetails?.action_eta || !optionDetails?.cost_delta) {
    return res.status(400).json({
      error: "optionDetails must include action_carrier, action_eta, and cost_delta",
    });
  }

  try {
    const result = await incidentService.generateActions({
      shipmentId,
      incidentType,
      selectedOption,
      optionDetails,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    console.error("[generateActions]", message);
    res.status(status).json({ error: message });
  }
}

// POST /api/freight-audit
export async function freightAudit(req, res) {
  const { shipmentId, additionalCostEur } = req.body;

  if (!shipmentId) {
    return res.status(400).json({ error: "shipmentId is required" });
  }
  if (typeof additionalCostEur !== "number" || additionalCostEur <= 0) {
    return res.status(400).json({ error: "additionalCostEur must be a positive number" });
  }

  try {
    const result = await incidentService.generateFreightAudit({
      shipmentId,
      additionalCostEur,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    console.error("[freightAudit]", message);
    res.status(status).json({ error: message });
  }
}
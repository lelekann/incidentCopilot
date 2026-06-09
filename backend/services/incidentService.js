import { callOpenAI } from "../utils/openaiClient.js";
import {
  buildAnalysisPrompt,
  buildClientMessagePrompt,
  buildLessonsPrompt,
  buildFreightAuditPrompt,
} from "../utils/prompts.js";
import {
  getShipment,
  getCarrier,
  findBackupCarriers,
  getIncidentHistory,
} from "../utils/dbQueries.js";

export async function analyzeIncident({ shipmentId, incidentType, incidentDescription }) {
  const shipment = getShipment(shipmentId);
  if (!shipment) throw { status: 404, message: `Shipment ${shipmentId} not found` };

  const carrier = getCarrier(shipment.carrier_id);
  if (!carrier) throw { status: 404, message: `Carrier ${shipment.carrier_id} not found` };

  const backupCarriers = findBackupCarriers(
    shipment.route,
    shipment.cargo_type,
    shipment.temp_required,
    shipment.carrier_id,
  );

  const history = getIncidentHistory(incidentType, shipment.carrier_id, shipment.route);

  const prompt = buildAnalysisPrompt(
    incidentType,
    incidentDescription,
    shipment,
    carrier,
    backupCarriers,
    history,
  );

  const analysis = await callOpenAI(prompt, true);

  return {
    analysis,
    context: {
      shipment,
      carrier,
      backupCarriers: backupCarriers.slice(0, 3),
      history,
    },
  };
}

export async function generateActions({ shipmentId, incidentType, selectedOption, optionDetails }) {
  const shipment = getShipment(shipmentId);
  if (!shipment) throw { status: 404, message: `Shipment ${shipmentId} not found` };

  const carrier = getCarrier(shipment.carrier_id);
  const history = getIncidentHistory(incidentType, shipment.carrier_id, shipment.route);

  const [clientMessage, lessonsLearned] = await Promise.all([
    callOpenAI(buildClientMessagePrompt(incidentType, selectedOption, optionDetails, shipment), false),
    callOpenAI(buildLessonsPrompt(incidentType, shipment, carrier, history), true),
  ]);

  return {
    clientMessage,
    lessonsLearned,
    auditLog: {
      shipmentId: shipment.id,
      incidentType,
      selectedOption,
      newCarrier: optionDetails.action_carrier,
      newEta: optionDetails.action_eta,
      costDelta: optionDetails.cost_delta,
      resolvedAt: new Date().toISOString(),
    },
  };
}

export async function generateFreightAudit({ shipmentId, additionalCostEur }) {
  const shipment = getShipment(shipmentId);
  if (!shipment) throw { status: 404, message: "Shipment not found" };

  const carrier = getCarrier(shipment.carrier_id);
  const prompt = buildFreightAuditPrompt(carrier, shipment, additionalCostEur);
  const claimText = await callOpenAI(prompt, false);

  return { claimText };
}
export function buildAnalysisPrompt(
  incidentType,
  incidentDescription,
  shipment,
  carrier,
  backupCarriers,
  history,
) {
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

Return this exact JSON structure:
{
  "severity": "HIGH" | "CRITICAL" | "MEDIUM",
  "key_facts": [{ "label": "string", "value": "string" }],
  "options": [
    {
      "id": "A",
      "label": "short action title",
      "time_impact": "specific delivery time",
      "cost_delta": "+€XXX",
      "risk_level": "Low" | "Medium" | "High",
      "recommended": true,
      "note": "one sentence referencing actual carrier names and costs",
      "action_carrier": "use actual carrier name from backup list",
      "action_eta": "specific new ETA"
    }
  ],
  "recommended_option": "A" | "B" | "C",
  "reasoning": "2-3 sentences referencing actual data: carrier rating, history, costs"
}

Rules:
- Exactly 3 options (A, B, C), exactly one recommended: true
- Exactly 5 key_facts items
- Use REAL carrier names from the backup list
- Reference actual ratings, prices, history numbers in reasoning
- Be specific with ETAs based on hours_to_deadline`;
}

export function buildClientMessagePrompt(incidentType, selectedOption, optionDetails, shipment) {
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

export function buildLessonsPrompt(incidentType, shipment, carrier, history) {
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

export function buildFreightAuditPrompt(carrier, shipment, additionalCostEur) {
  const originalCost = Math.round(
    shipment.km_left * (carrier?.price_per_km_eur || 1.5),
  );
  return `Write a 2-paragraph professional freight audit claim notice.

Carrier: ${carrier?.name}
Route: ${shipment.route}
Original contracted cost: €${originalCost.toLocaleString()}
Additional cost incurred: €${additionalCostEur.toLocaleString()}
Reason: emergency carrier replacement due to incident

Paragraph 1: state the facts. Paragraph 2: formally request reimbursement.
Return only plain text.`;
}
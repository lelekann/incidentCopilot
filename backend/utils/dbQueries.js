import { db } from "../config/db.js";

export function getShipment(shipmentId) {
  return db.shipments.find((s) => s.id === shipmentId) || null;
}

export function getCarrier(carrierId) {
  const carrier = db.carriers.find(c => c.id === carrierId);

  if (!carrier) {
    console.warn(`[DB] Missing carrier: ${carrierId}`);
    return null;
  }

  return carrier;
}

export function findBackupCarriers(route, cargoType, tempRequired, excludeCarrierId) {
  return db.carriers
    .filter(
      (c) =>
        c.id !== excludeCarrierId &&
        c.available_trucks > 0 &&
        (tempRequired ? c.temp_controlled === true : true) &&
        (c.active_routes.includes(route) || c.specializations.includes(cargoType)),
    )
    .sort((a, b) => b.rating - a.rating);
}

export function getIncidentHistory(incidentType, carrierId, route) {
  const byCarrier = db.incidents.filter((i) => i.carrier_id === carrierId);
  const byRoute   = db.incidents.filter((i) => i.route === route);
  const byType    = db.incidents.filter((i) => i.type === incidentType);

  const mostUsedResolution = () => {
    const counts = {};
    byType.forEach((i) => {
      counts[i.resolution_label] = (counts[i.resolution_label] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  };

  return {
    carrier_total_incidents: byCarrier.length,
    carrier_same_type: byCarrier.filter((i) => i.type === incidentType).length,
    route_disruption_count: byRoute.length,
    type_total_in_network: byType.length,
    avg_cost_delta_eur: byType.length
      ? Math.round(byType.reduce((s, i) => s + i.cost_delta_eur, 0) / byType.length)
      : 0,
    deadline_met_rate_pct: byType.length
      ? Math.round((byType.filter((i) => i.deadline_met).length / byType.length) * 100)
      : 0,
    most_used_resolution: mostUsedResolution(),
    recent_incidents: byCarrier.slice(-3).map((i) => ({
      date: i.date,
      type: i.type,
      resolution: i.resolution_label,
      deadline_met: i.deadline_met,
    })),
  };
}
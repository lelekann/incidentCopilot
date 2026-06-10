import { useState, useEffect, useCallback } from "react";
import { INCIDENT_CONFIG } from "../config/incidentConfig";
import { useShipments } from "../data/ShipmentContext";

const INCIDENT_TYPES = ["breakdown", "weather", "cancellation"];
// Generate a description that matches the shipment's current position
function generateDescription(incidentType, shipment) {
  const point = shipment.current_waypoint;
  const descriptions = {
    breakdown: [
      `Engine failure reported near ${point}. Vehicle stationary for 45+ minutes.`,
      `Driver reports mechanical issue on approach to ${point}. Truck unable to proceed.`,
      `Tyre blowout on highway near ${point}. Waiting for roadside assistance.`,
    ],
    weather: [
      `Severe weather warning issued near ${point}. Road conditions dangerous.`,
      `Heavy snowfall closing primary route through ${point}. Visibility near zero.`,
      `Storm alert near ${point}. Local authorities advising trucks to hold.`,
    ],
    cancellation: [
      `Carrier reports capacity unavailable. Vehicle scheduled from ${point} cannot depart.`,
      `Driver sick leave — no replacement arranged. Cargo held at ${point}.`,
      `Carrier ${shipment.carrier} cancelled booking. Shipment stranded near ${point}.`,
    ],
  };
  const options = descriptions[incidentType];
  return options[Math.floor(Math.random() * options.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useIncidentSimulator() {
  const [incidents, setIncidents] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const { shipments } = useShipments();

  const addIncident = useCallback(() => {
    // Pick a random in_transit shipment
    const eligible = shipments.filter((s) => s.status === "in_transit");
    if (!eligible.length) return;

    const shipment = eligible[Math.floor(Math.random() * eligible.length)];
    const incidentType = INCIDENT_TYPES[Math.floor(Math.random() * INCIDENT_TYPES.length)];
    const config = INCIDENT_CONFIG[incidentType];

    const incident = {
      id: `INC-${Date.now()}`,
      shipmentId: shipment.id,
      shipment,
      incidentType,
      description: generateDescription(incidentType, shipment),
      label: config.label,
      icon: config.icon,
      color: config.color,
      status: "new",           // "new" | "resolved"
      createdAt: new Date(),
      // filled after resolution:
      resolvedAt: null,
      analysis: null,
      chosenOption: null,
      clientMessage: null,
      lessons: null,
    };

    setIncidents((prev) => [incident, ...prev]);
    setHasNew(true);
  }, [shipments]);

  // Schedule next incident every 3-5 minutes (180-300 seconds)
  useEffect(() => {
    function schedule() {
      const delay = randomBetween(180, 300) * 1000;
      return setTimeout(() => {
        addIncident();
        schedule(); // reschedule after each trigger
      }, delay);
    }
    const timer = schedule();
    return () => clearTimeout(timer);
  }, [addIncident]);

  function resolveIncident(incidentId, { analysis, chosenOption, clientMessage, lessons }) {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status: "resolved",
              resolvedAt: new Date(),
              analysis,
              chosenOption,
              clientMessage,
              lessons,
            }
          : inc,
      ),
    );
  }

  function markAllSeen() {
    setHasNew(false);
  }

  // For demo: trigger an incident manually
  function triggerManual(shipmentId, incidentType) {
    const shipment = shipments.find((s) => s.id === shipmentId);
    if (!shipment) return;
    const config = INCIDENT_CONFIG[incidentType];

    const incident = {
      id: `INC-${Date.now()}`,
      shipmentId,
      shipment,
      incidentType,
      description: generateDescription(incidentType, shipment),
      label: config.label,
      icon: config.icon,
      color: config.color,
      status: "new",
      createdAt: new Date(),
      resolvedAt: null,
      analysis: null,
      chosenOption: null,
      clientMessage: null,
      lessons: null,
    };

    setIncidents((prev) => [incident, ...prev]);
    setHasNew(true);
  }

  const newCount = incidents.filter((i) => i.status === "new").length;

  return {
    incidents,
    hasNew,
    newCount,
    addIncident,
    triggerManual,
    resolveIncident,
    markAllSeen,
  };
}
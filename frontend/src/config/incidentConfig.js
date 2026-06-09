// ─── INCIDENT TYPES CONFIG (тільки UI-метадані, без бізнес-логіки) ────────────

export const INCIDENT_CONFIG = {
  breakdown: {
    label: "Vehicle Breakdown",
    icon: "🔧",
    color: "#F97316",
    description: "Truck engine failure. Vehicle immobilized on highway.",
    defaultDescription: "Engine failure reported by driver. Vehicle stationary for 45+ minutes.",
  },
  weather: {
    label: "Weather Disruption",
    icon: "❄️",
    color: "#60A5FA",
    description: "Severe weather closing primary route.",
    defaultDescription: "Severe snowstorm warning issued. Primary route closed by authorities.",
  },
  cancellation: {
    label: "Carrier Cancellation",
    icon: "🚫",
    color: "#EF4444",
    description: "Carrier cancelled. Cargo not yet departed.",
    defaultDescription: "Carrier reported unavailable capacity. No replacement offered by carrier.",
  },
};
import { useShipments } from "../../data/ShipmentContext";

export default function StatsBar({ incidents }) {
const { shipments } = useShipments();
  const total     = shipments.length;
  const inTransit = shipments.filter((s) => s.status === "in_transit").length;
  const pending   = shipments.filter((s) => s.status === "pending_departure").length;
  const newInc    = incidents.filter((i) => i.status === "new").length;

  const tiles = [
    { label: "Total Shipments",  value: total,     color: "#2563EB", bg: "#EFF6FF" },
    { label: "In Transit",       value: inTransit, color: "#059669", bg: "#ECFDF5" },
    { label: "Pending Departure",value: pending,   color: "#D97706", bg: "#FFFBEB" },
    { label: "Active Incidents", value: newInc,    color: "#DC2626", bg: "#FEF2F2" },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16,
      marginBottom: 24,
    }}>
      {tiles.map((t) => (
        <div key={t.label} style={{
          background: t.bg,
          border: `1px solid ${t.color}22`,
          borderRadius: 12,
          padding: "18px 20px",
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: t.color }}>
            {t.value}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4, fontWeight: 500 }}>
            {t.label}
          </div>
        </div>
      ))}
    </div>
  );
}
import { SHIPMENT_STATUS_COLORS } from "../../data/shipments";

function WaypointTrack({ waypoints, current }) {
  const idx = waypoints.indexOf(current);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", rowGap: 8 }}>
      {waypoints.map((wp, i) => {
        const done   = i < idx;
        const active = i === idx;
        return (
          <div key={wp} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: active ? 14 : 10,
                height: active ? 14 : 10,
                borderRadius: "50%",
                background: done ? "#10B981" : active ? "#2563EB" : "#D1D5DB",
                border: active ? "3px solid #93C5FD" : "none",
                margin: "0 auto 4px",
              }} />
              <div style={{
                fontSize: 10,
                color: active ? "#2563EB" : done ? "#10B981" : "#9CA3AF",
                fontWeight: active ? 700 : 500,
                maxWidth: 60,
                textAlign: "center",
                lineHeight: 1.2,
              }}>
                {wp}
              </div>
            </div>
            {i < waypoints.length - 1 && (
              <div style={{
                width: 28,
                height: 2,
                background: done ? "#10B981" : "#E5E7EB",
                marginBottom: 14,
                flexShrink: 0,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ShipmentDetailModal({ shipment, incident, onClose, onTriggerIncident }) {
  if (!shipment) return null;
  const statusStyle = SHIPMENT_STATUS_COLORS[shipment.status] || SHIPMENT_STATUS_COLORS.in_transit;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(15,23,42,0.6)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 620,
          maxHeight: "85vh",
          overflowY: "auto",
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid #F3F4F6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
              Shipment Details
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>{shipment.id}</div>
            <div style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>{shipment.route}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{
              background: statusStyle.bg, color: statusStyle.color,
              fontSize: 11, fontWeight: 700, padding: "4px 12px",
              borderRadius: 20, textTransform: "uppercase",
            }}>
              {statusStyle.label}
            </span>
            <button onClick={onClose} style={{
              background: "#F3F4F6", border: "none", borderRadius: 8,
              width: 32, height: 32, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Route progress */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Route Progress
            </div>
            <WaypointTrack waypoints={shipment.waypoints} current={shipment.current_waypoint} />
          </div>

          {/* Key info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Cargo",     val: shipment.cargo },
              { label: "Carrier",   val: shipment.carrier },
              { label: "Driver",    val: shipment.driver },
              { label: "Client",    val: shipment.client },
              { label: "Value",     val: `€${shipment.value_eur?.toLocaleString()}` },
              { label: "KM Left",   val: `${shipment.km_left} km` },
              { label: "ETA",       val: shipment.eta },
              { label: "Position",  val: shipment.position },
              { label: "Penalty",   val: `€${shipment.penalty_per_24h_eur?.toLocaleString()}/24h` },
            ].map(({ label, val }) => (
              <div key={label} style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontSize: 12, color: "#1F2937", fontWeight: 500, marginTop: 2 }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Active incident warning */}
          {incident && (
            <div style={{
              background: "#FFFBEB", border: "1.5px solid #FCD34D",
              borderRadius: 10, padding: "12px 16px", marginBottom: 16,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>{incident.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#92400E" }}>
                  Active Incident: {incident.label}
                </div>
                <div style={{ fontSize: 12, color: "#78350F", marginTop: 2 }}>
                  {incident.description}
                </div>
              </div>
              <button
                onClick={() => { onClose(); onTriggerIncident(incident); }}
                style={{
                  background: "#DC2626", color: "#fff",
                  border: "none", borderRadius: 8, padding: "8px 14px",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Resolve →
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
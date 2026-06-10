import { SHIPMENT_STATUS_COLORS } from "../../data/shipments";

function WaypointProgress({ waypoints, current }) {
if (!Array.isArray(waypoints)) {
    console.error("Invalid waypoints:", {
      waypoints,
      current,
    });

    return <span>Missing route data</span>;
  }
  const idx = waypoints.indexOf(current);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: 180 }}>
      {waypoints.map((wp, i) => {
        const done    = i < idx;
        const active  = i === idx;
        return (
          <div key={wp} style={{ display: "flex", alignItems: "center" }}>
            <div title={wp} style={{
              width: active ? 10 : 7,
              height: active ? 10 : 7,
              borderRadius: "50%",
              background: done ? "#10B981" : active ? "#2563EB" : "#D1D5DB",
              border: active ? "2px solid #93C5FD" : "none",
              flexShrink: 0,
              transition: "all 0.2s",
            }} />
            {i < waypoints.length - 1 && (
              <div style={{
                width: 18,
                height: 2,
                background: done ? "#10B981" : "#E5E7EB",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ShipmentTable({ shipments, incidents, onRowClick }) {
  // Build a quick lookup: shipmentId → active incident
  const activeIncidents = {};
  incidents
    .filter((i) => i.status === "new")
    .forEach((i) => { activeIncidents[i.shipmentId] = i; });

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      {/* Table header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "90px 1fr 140px 120px 100px 90px 60px",
        padding: "10px 20px",
        background: "#F9FAFB",
        borderBottom: "1px solid #E5E7EB",
        fontSize: 11,
        fontWeight: 700,
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        <div>ID</div>
        <div>Route & Progress</div>
        <div>Client</div>
        <div>Cargo</div>
        <div>ETA</div>
        <div>Status</div>
        <div>Inc.</div>
      </div>

      {/* Rows */}
      {shipments.map((s) => {
        const statusStyle = SHIPMENT_STATUS_COLORS[s.status] || SHIPMENT_STATUS_COLORS.in_transit;
        const hasIncident = !!activeIncidents[s.id];

        return (
          <div
            key={s.id}
            onClick={() => onRowClick(s)}
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr 140px 120px 100px 90px 60px",
              padding: "14px 20px",
              borderBottom: "1px solid #F3F4F6",
              cursor: "pointer",
              background: hasIncident ? "#FFFBEB" : "#fff",
              transition: "background 0.15s",
              alignItems: "center",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = hasIncident ? "#FEF3C7" : "#F9FAFB"}
            onMouseLeave={(e) => e.currentTarget.style.background = hasIncident ? "#FFFBEB" : "#fff"}
          >
            <div style={{ fontWeight: 700, fontSize: 12, color: "#111827" }}>
              {s.id}
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
                {s.route}
              </div>
              <WaypointProgress waypoints={s.waypoints} current={s.current_waypoint} />
            </div>

            <div style={{ fontSize: 12, color: "#374151" }}>{s.client}</div>

            <div style={{ fontSize: 11, color: "#6B7280" }}>
              {s.cargo.split("–")[0].trim()}
            </div>

            <div style={{ fontSize: 12, color: "#374151" }}>{s.eta}</div>

            <div>
              <span style={{
                background: statusStyle.bg,
                color: statusStyle.color,
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 20,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                {statusStyle.label}
              </span>
            </div>

            <div style={{ textAlign: "center" }}>
              {hasIncident && (
                <span style={{
                  background: "#FEE2E2",
                  color: "#DC2626",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 20,
                }}>
                  ⚠ NEW
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
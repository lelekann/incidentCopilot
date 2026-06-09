import { INCIDENT_CONFIG } from "../../config/incidentConfig";

export default function IncidentSetupPanel({
  shipments,
  loadingShipments,
  selectedShipmentId,
  onSelectShipment,
  selectedIncidentType,
  onSelectIncidentType,
  phase,
  onTrigger,
}) {
  const canTrigger =
    selectedShipmentId && selectedIncidentType && phase === "idle";

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 14,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Simulate Incident
      </div>

      {/* 1. Shipment selector */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{ fontSize: 12, color: "#6B7280", marginBottom: 6, fontWeight: 500 }}
        >
          1. Select Shipment
        </div>

        {loadingShipments ? (
          <div style={{ fontSize: 13, color: "#9CA3AF" }}>
            Loading shipments...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {shipments.map((s) => (
              <div
                key={s.id}
                onClick={() => phase === "idle" && onSelectShipment(s.id)}
                style={{
                  border:
                    selectedShipmentId === s.id
                      ? "2px solid #2563EB"
                      : "1.5px solid #E5E7EB",
                  background:
                    selectedShipmentId === s.id ? "#EFF6FF" : "#F9FAFB",
                  borderRadius: 8,
                  padding: "10px 14px",
                  cursor: phase === "idle" ? "pointer" : "default",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.15s",
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: "#111827", fontSize: 13 }}>
                    {s.id}
                  </span>
                  <span style={{ fontSize: 12, color: "#6B7280", marginLeft: 10 }}>
                    {s.route}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>{s.cargo}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Incident type selector */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{ fontSize: 12, color: "#6B7280", marginBottom: 6, fontWeight: 500 }}
        >
          2. Select Incident Type
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}
        >
          {Object.entries(INCIDENT_CONFIG).map(([key, inc]) => (
            <button
              key={key}
              onClick={() => phase === "idle" && onSelectIncidentType(key)}
              disabled={phase !== "idle"}
              style={{
                border:
                  selectedIncidentType === key
                    ? `2px solid ${inc.color}`
                    : "1.5px solid #E5E7EB",
                background:
                  selectedIncidentType === key ? `${inc.color}12` : "#F9FAFB",
                borderRadius: 10,
                padding: "12px",
                cursor: phase === "idle" ? "pointer" : "default",
                textAlign: "left",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{inc.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#111827" }}>
                {inc.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trigger button */}
      <button
        onClick={onTrigger}
        disabled={!canTrigger}
        style={{
          width: "100%",
          padding: "12px",
          background: canTrigger ? "#DC2626" : "#E5E7EB",
          color: canTrigger ? "#fff" : "#9CA3AF",
          border: "none",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: canTrigger ? "pointer" : "not-allowed",
          transition: "all 0.2s",
        }}
      >
        🚨 Trigger Incident
      </button>
    </div>
  );
}
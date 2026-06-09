import { INCIDENT_CONFIG } from "../../config/incidentConfig";

export default function IncidentAlert({ incidentType }) {
  const inc = INCIDENT_CONFIG[incidentType];
  return (
    <div
      style={{
        background: `${inc.color}12`,
        border: `1.5px solid ${inc.color}40`,
        borderLeft: `4px solid ${inc.color}`,
        borderRadius: 10,
        padding: "16px 20px",
        marginBottom: 16,
        animation: "slideIn 0.4s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 22 }}>{inc.icon}</span>
        <div style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>
          INCIDENT DETECTED: {inc.label}
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#374151" }}>{inc.description}</div>
    </div>
  );
}
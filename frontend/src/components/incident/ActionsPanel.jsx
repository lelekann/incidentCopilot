import { useState } from "react";

export default function ActionsPanel({ option, clientMessage, timerSeconds }) {
  const [copied, setCopied] = useState(false);

  return (
    <div style={{ animation: "slideIn 0.5s ease" }}>
      <div
        style={{
          background: "#F0FDF4",
          border: "1.5px solid #86EFAC",
          borderRadius: 10,
          padding: "14px 20px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 24 }}>✅</span>
        <div>
          <div style={{ fontWeight: 700, color: "#166534", fontSize: 15 }}>
            Incident Resolved — Option {option.id} Activated
          </div>
          <div style={{ fontSize: 12, color: "#16A34A", marginTop: 2 }}>
            Carrier notified · Client message ready · Audit log created
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#6B7280" }}>
            Total response time
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontWeight: 700,
              color: "#166534",
              fontSize: 16,
            }}
          >
            {String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:
            {String(timerSeconds % 60).padStart(2, "0")}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        {[
          {
            icon: "🚛",
            label: "Carrier assigned",
            val: option.action_carrier,
            color: "#DBEAFE",
            border: "#BFDBFE",
          },
          {
            icon: "🕐",
            label: "New ETA",
            val: option.action_eta,
            color: "#D1FAE5",
            border: "#A7F3D0",
          },
          {
            icon: "💶",
            label: "Cost delta",
            val: option.cost_delta,
            color: "#FEF3C7",
            border: "#FDE68A",
          },
          {
            icon: "📋",
            label: "Freight audit",
            val: "Claim initiated vs original carrier",
            color: "#F3E8FF",
            border: "#DDD6FE",
          },
        ].map((a) => (
          <div
            key={a.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: a.color,
              border: `1px solid ${a.border}`,
              borderRadius: 8,
              padding: "10px 14px",
            }}
          >
            <span style={{ fontSize: 18 }}>{a.icon}</span>
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {a.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1F2937" }}>
                {a.val}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: 10,
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>
            📧 Client Notification — AI Generated
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(clientMessage);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{
              background: copied ? "#10B981" : "#2563EB",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <pre
          style={{
            fontFamily: "inherit",
            fontSize: 12,
            color: "#374151",
            whiteSpace: "pre-wrap",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {clientMessage}
        </pre>
      </div>
    </div>
  );
}
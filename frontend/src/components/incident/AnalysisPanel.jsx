import SeverityBadge from "../common/SeverityBadge";

export default function AnalysisPanel({ keyFacts, severity }) {
  return (
    <div
      style={{
        background: "#F0FDF4",
        border: "1px solid #BBF7D0",
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
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: "#166534",
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          🧠 AI Analysis Complete
        </div>
        <SeverityBadge level={severity} />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))",
          gap: 8,
        }}
      >
        {keyFacts.map((f) => (
          <div
            key={f.label}
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: "10px 14px",
              border: "1px solid #D1FAE5",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {f.label}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#111827",
                marginTop: 2,
              }}
            >
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
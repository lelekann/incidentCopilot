export default function OptionCard({ opt, selected, onSelect, disabled }) {
  const isSelected = selected === opt.id;
  return (
    <div
      onClick={() => !disabled && onSelect(opt.id)}
      style={{
        border: isSelected ? "2px solid #2563EB" : "1.5px solid #E5E7EB",
        borderRadius: 10,
        padding: "14px 18px",
        cursor: disabled ? "default" : "pointer",
        background: isSelected ? "#EFF6FF" : "#fff",
        transition: "all 0.2s",
        position: "relative",
        animation: "slideIn 0.4s ease",
      }}
    >
      {opt.recommended && (
        <div
          style={{
            position: "absolute",
            top: -10,
            right: 14,
            background: "#10B981",
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            padding: "2px 10px",
            borderRadius: 20,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          ✓ Recommended
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>
          Option {opt.id}: {opt.label}
        </div>
        {isSelected && (
          <span style={{ color: "#2563EB", fontWeight: 700 }}>✓</span>
        )}
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#6B7280" }}>
          ⏱ {opt.time_impact}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#DC2626" }}>
          {opt.cost_delta}
        </span>
        <span
          style={{
            fontSize: 12,
            color:
              opt.risk_level === "Low"
                ? "#059669"
                : opt.risk_level === "Medium"
                  ? "#D97706"
                  : "#DC2626",
          }}
        >
          Risk: {opt.risk_level}
        </span>
      </div>
      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
        {opt.note}
      </div>
    </div>
  );
}
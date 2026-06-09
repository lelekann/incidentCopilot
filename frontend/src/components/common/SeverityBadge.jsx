export default function SeverityBadge({ level }) {
  const map = {
    CRITICAL: { bg: "#FEE2E2", color: "#991B1B", dot: "#EF4444" },
    HIGH:     { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
    MEDIUM:   { bg: "#DBEAFE", color: "#1E40AF", dot: "#3B82F6" },
  };
  const s = map[level] || map.MEDIUM;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
      padding: "2px 9px", borderRadius: 20, letterSpacing: "0.08em", textTransform: "uppercase",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {level}
    </span>
  );
}
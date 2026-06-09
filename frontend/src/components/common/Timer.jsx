export default function Timer({ running, seconds }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      fontFamily: "monospace", fontSize: 13,
      color: running ? "#10B981" : "#6B7280",
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: running ? "#10B981" : "#6B7280",
        animation: running ? "pulse 1s infinite" : "none",
      }} />
      AI Response Time: {mins}:{secs}
    </div>
  );
}
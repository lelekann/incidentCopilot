export default function Spinner({ label }) {
  return (
    <div style={{
      background: "#EFF6FF", border: "1px solid #BFDBFE",
      borderRadius: 10, padding: "24px", textAlign: "center",
      animation: "slideIn 0.3s ease",
    }}>
      <div style={{
        display: "inline-block", width: 24, height: 24,
        border: "3px solid #2563EB", borderTopColor: "transparent",
        borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 10,
      }} />
      <div style={{ fontWeight: 600, color: "#1D4ED8" }}>{label}</div>
    </div>
  );
}
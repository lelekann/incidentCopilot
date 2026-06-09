export default function ErrorBox({ message, onRetry }) {
  return (
    <div style={{
      background: "#FEF2F2", border: "1px solid #FECACA",
      borderRadius: 10, padding: "16px 20px", marginBottom: 16,
    }}>
      <div style={{ fontWeight: 700, color: "#991B1B", marginBottom: 6 }}>⚠ Error</div>
      <div style={{ fontSize: 13, color: "#7F1D1D", marginBottom: 10 }}>{message}</div>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: "#DC2626", color: "#fff", border: "none",
          borderRadius: 6, padding: "6px 14px", fontSize: 12,
          fontWeight: 600, cursor: "pointer",
        }}>Retry</button>
      )}
    </div>
  );
}

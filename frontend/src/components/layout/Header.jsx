import Timer from "../common/Timer";

export default function Header({
  timerRunning,
  timerSeconds,
  phase,
  onReset,
}) {
  return (
    <div
      style={{
        background: "#0F172A",
        color: "#fff",
        padding: "14px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "#2563EB",
            width: 34,
            height: 34,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          🚚
        </div>

        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Logistics Incident Copilot
          </div>

          <div
            style={{
              fontSize: 11,
              color: "#94A3B8",
            }}
          >
            AI-Powered Operations Center
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <Timer
          running={timerRunning}
          seconds={timerSeconds}
        />

        {phase !== "idle" && (
          <button
            onClick={onReset}
            style={{
              background: "transparent",
              border: "1px solid #334155",
              color: "#94A3B8",
              borderRadius: 6,
              padding: "5px 14px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            ↺ Reset
          </button>
        )}
      </div>
    </div>
  );
}
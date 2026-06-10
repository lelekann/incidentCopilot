import Timer from "../common/Timer";

export default function Header({
  timerRunning,
  timerSeconds,
  phase,
  onReset,
  newCount,
  onBellClick,
  bellOpen,
  incidents,
  onIncidentClick,
}) {
  return (
    <div style={{
      background: "#0F172A",
      color: "#fff",
      padding: "0 28px",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #1E293B",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          background: "#2563EB",
          width: 32,
          height: 32,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}>
          🚚
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>
            Logistics Copilot
          </div>
          <div style={{ fontSize: 10, color: "#64748B" }}>Operations Dashboard</div>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {timerRunning || timerSeconds > 0 ? (
          <Timer running={timerRunning} seconds={timerSeconds} />
        ) : null}

        {phase !== "idle" && onReset && (
          <button onClick={onReset} style={{
            background: "transparent",
            border: "1px solid #334155",
            color: "#94A3B8",
            borderRadius: 6,
            padding: "5px 12px",
            fontSize: 12,
            cursor: "pointer",
          }}>
            ↺ Reset
          </button>
        )}

        {/* Bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={onBellClick}
            style={{
              background: newCount > 0 ? "#DC262620" : "transparent",
              border: `1px solid ${newCount > 0 ? "#DC2626" : "#334155"}`,
              borderRadius: 8,
              width: 36,
              height: 36,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              transition: "all 0.2s",
              animation: newCount > 0 ? "bellShake 0.5s ease" : "none",
            }}
          >
            🔔
          </button>
          {newCount > 0 && (
            <div style={{
              position: "absolute",
              top: -6,
              right: -6,
              background: "#DC2626",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              width: 18,
              height: 18,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {newCount}
            </div>
          )}

          {/* Dropdown */}
          {bellOpen && (
            <div style={{
              position: "absolute",
              top: 44,
              right: 0,
              width: 360,
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              zIndex: 200,
              overflow: "hidden",
              animation: "slideIn 0.2s ease",
            }}>
              <div style={{
                padding: "12px 16px",
                borderBottom: "1px solid #F3F4F6",
                fontWeight: 700,
                fontSize: 13,
                color: "#111827",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span>Incidents</span>
                <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 400 }}>
                  {incidents.length} total
                </span>
              </div>

              {incidents.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                  No incidents yet
                </div>
              ) : (
                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                  {incidents.map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => onIncidentClick(inc)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #F9FAFB",
                        cursor: "pointer",
                        background: inc.status === "new" ? "#FFFBEB" : "#fff",
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
                      onMouseLeave={(e) => e.currentTarget.style.background = inc.status === "new" ? "#FFFBEB" : "#fff"}
                    >
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{inc.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>
                            {inc.shipment.id} — {inc.label}
                          </div>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: 20,
                            background: inc.status === "new" ? "#FEE2E2" : "#D1FAE5",
                            color: inc.status === "new" ? "#DC2626" : "#065F46",
                          }}>
                            {inc.status === "new" ? "NEW" : "RESOLVED"}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 2 }}>
                          {inc.shipment.route}
                        </div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>
                          {inc.createdAt.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bellShake {
          0%,100% { transform: rotate(0); }
          20% { transform: rotate(-15deg); }
          40% { transform: rotate(15deg); }
          60% { transform: rotate(-10deg); }
          80% { transform: rotate(10deg); }
        }
      `}</style>
    </div>
  );
}
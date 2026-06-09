export default function LessonsPanel({ lessons }) {
  return (
    <div
      style={{
        background: "#FFFBEB",
        border: "1.5px solid #FDE68A",
        borderRadius: 12,
        padding: "20px 24px",
        marginTop: 16,
        animation: "slideIn 0.5s ease",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: "#92400E",
          fontSize: 15,
          marginBottom: 16,
        }}
      >
        📚 Lessons Learned
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {lessons.stats.map((s, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: "12px 16px",
              border: "1px solid #FDE68A",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800, color: "#D97706" }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: "#92400E", marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {lessons.insights.map((ins, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              fontSize: 13,
              color: "#374151",
              lineHeight: 1.6,
            }}
          >
            <span style={{ color: "#D97706", fontWeight: 700 }}>›</span>
            {ins}
          </div>
        ))}
      </div>
      <div
        style={{
          background: "#FEF3C7",
          border: "1px solid #FCD34D",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 13,
          color: "#92400E",
          fontWeight: 500,
        }}
      >
        💡 <strong>Recommendation:</strong> {lessons.recommendation}
      </div>
    </div>
  );
}
export default function ShipmentCard({ shipment}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: "#9CA3AF",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            Active Shipment
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
            {shipment.id}
          </div>
          <div style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
            {shipment.route}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>
            ETA: {shipment.eta}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
        }}
      >
        {[
          { label: "Cargo", val: shipment.cargo },
          { label: "Carrier", val: shipment.carrier_id },
          { label: "Client", val: shipment.client },
          { label: "Position", val: shipment.position },
          { label: "Value", val: `€${shipment.value_eur?.toLocaleString()}` },
          { label: "KM Left", val: `${shipment.km_left} km` },
        ].map(({ label, val }) => (
          <div
            key={label}
            style={{
              background: "#F9FAFB",
              borderRadius: 8,
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#9CA3AF",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#1F2937",
                fontWeight: 500,
                marginTop: 2,
              }}
            >
              {val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
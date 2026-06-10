import { useState, useEffect, useRef } from "react";
import { useIncidentSimulator } from "../hooks/useIncidentSimulator";

import Header from "../components/layout/Header";
import StatsBar from "../components/dashboard/StatsBar";
import ShipmentTable from "../components/dashboard/ShipmentTable";
import ShipmentDetailModal from "../components/modals/ShipmentDetailModal";
import IncidentModal from "../components/modals/IncidentModal";
import { useShipments } from "../data/ShipmentContext";

export default function DashboardPage() {
  // Bell dropdown
  const [bellOpen, setBellOpen] = useState(false);

  // Which modal is open
  const [detailShipment, setDetailShipment] = useState(null);   // ShipmentDetailModal
  const [activeIncident, setActiveIncident] = useState(null);   // IncidentModal

  // Close bell when clicking outside
  const bellRef = useRef(null);

 const {
    shipments,
  } = useShipments();

  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const {
    incidents,
    hasNew,
    newCount,
    triggerManual,
    resolveIncident,
    markAllSeen,
  } = useIncidentSimulator();

  function handleBellClick() {
    setBellOpen((v) => !v);
    if (hasNew) markAllSeen();
  }

  function handleIncidentClick(incident) {
    setBellOpen(false);
    setActiveIncident(incident);
  }

  // Called from ShipmentDetailModal "Resolve →" button
  function handleTriggerFromDetail(incident) {
    setDetailShipment(null);
    setActiveIncident(incident);
  }

  // Called when dispatcher confirms resolution in IncidentModal
  function handleResolved(incidentId, resolutionData) {
    resolveIncident(incidentId, resolutionData);
    // Update incident object in modal to show resolved state
    setActiveIncident((prev) =>
      prev ? { ...prev, status: "resolved", ...resolutionData, resolvedAt: new Date() } : null,
    );
  }

  // Find active incident for a given shipment (for detail modal warning)
  function getActiveIncidentForShipment(shipmentId) {
    return incidents.find((i) => i.shipmentId === shipmentId && i.status === "new") || null;
  }

  return (
    <div style={{
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      background: "#F1F5F9",
      minHeight: "100vh",
    }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      <Header
        newCount={newCount}
        onBellClick={handleBellClick}
        bellOpen={bellOpen}
        incidents={incidents}
        onIncidentClick={handleIncidentClick}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>

        {/* Page title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: 0 }}>
            Shipment Dashboard
          </h1>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Live operations overview · {shipments.length} active shipments
          </div>
        </div>

        <StatsBar incidents={incidents} />

        {/* Demo controls */}
        <div style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>
            🎮 Demo Controls:
          </div>
          {["breakdown", "weather", "cancellation"].map((type) => (
            <button
              key={type}
              onClick={() => {
                const randomShipment = shipments[Math.floor(Math.random() * shipments.length)];
                triggerManual(randomShipment.id, type);
              }}
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.target.style.background = "#EFF6FF"; e.target.style.borderColor = "#2563EB"; }}
              onMouseLeave={(e) => { e.target.style.background = "#F8FAFC"; e.target.style.borderColor = "#E2E8F0"; }}
            >
              + {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#94A3B8" }}>
            Auto incidents fire every 3–5 min
          </div>
        </div>

        <ShipmentTable
          shipments={shipments}
          incidents={incidents}
          onRowClick={(shipment) => setDetailShipment(shipment)}
        />
      </div>

      {/* Shipment detail modal */}
      {detailShipment && (
        <ShipmentDetailModal
          shipment={detailShipment}
          incident={getActiveIncidentForShipment(detailShipment.id)}
          onClose={() => setDetailShipment(null)}
          onTriggerIncident={handleTriggerFromDetail}
        />
      )}

      {/* Incident modal */}
      {activeIncident && (
        <IncidentModal
          incident={activeIncident}
          onClose={() => setActiveIncident(null)}
          onResolved={(data) => handleResolved(activeIncident.id, data)}
        />
      )}
    </div>
  );
}
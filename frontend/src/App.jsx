import { useState, useEffect, useRef } from "react";

import { getShipments } from "./services/api";
import { useIncidentFlow } from "./hooks/useIncidentFlow";

import Header from "./components/layout/Header";
import ErrorBox from "./components/common/ErrorBox";
import Spinner from "./components/common/Spinner";

import IncidentSetupPanel from "./components/incident/IncidentSetupPanel";
import IncidentAlert from "./components/incident/IncidentAlert";
import AnalysisPanel from "./components/incident/AnalysisPanel";
import OptionCard from "./components/incident/OptionCard";
import ActionsPanel from "./components/incident/ActionsPanel";
import LessonsPanel from "./components/incident/LessonsPanel";

import ShipmentCard from "./components/shipment/ShipmentCard";

export default function LogisticsIncidentCopilot() {
  const [shipments, setShipments] = useState([]);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [backendError, setBackendError] = useState(null);

  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [selectedIncidentType, setSelectedIncidentType] = useState(null);

  const bottomRef = useRef(null);

  const {
    phase,
    analysis,
    selectedOption,
    setSelectedOption,
    clientMessage,
    lessons,
    error,
    triggerIncident,
    confirmOption,
    reset,
    timerSeconds,
    timerRunning,
  } = useIncidentFlow();

  // Load shipments on mount
  useEffect(() => {
    async function loadShipments() {
      try {
        const data = await getShipments();
        setShipments(data.shipments || []);
      } catch (err) {
        setBackendError(
          "Cannot reach backend at localhost:3001. Make sure the server is running.",
        );
        console.error(err);
      } finally {
        setLoadingShipments(false);
      }
    }
    loadShipments();
  }, []);

  // Auto-scroll on phase change
  useEffect(() => {
    if (phase !== "idle") {
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    }
  }, [phase]);

  const selectedShipment = shipments.find((s) => s.id === selectedShipmentId);
  const chosenOption = analysis?.options?.find((o) => o.id === selectedOption);

  function handleTriggerIncident() {
    if (!selectedShipmentId || !selectedIncidentType) return;
    triggerIncident({ shipmentId: selectedShipmentId, incidentType: selectedIncidentType });
  }

  function handleConfirmOption() {
    confirmOption({ shipmentId: selectedShipmentId, incidentType: selectedIncidentType });
  }

  function handleReset() {
    setSelectedShipmentId(null);
    setSelectedIncidentType(null);
    reset();
  }

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#F3F4F6", minHeight: "100vh" }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>

      <Header
        timerRunning={timerRunning}
        timerSeconds={timerSeconds}
        phase={phase}
        onReset={handleReset}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>

        {backendError && <ErrorBox message={backendError} />}

        <IncidentSetupPanel
          shipments={shipments}
          loadingShipments={loadingShipments}
          selectedShipmentId={selectedShipmentId}
          onSelectShipment={setSelectedShipmentId}
          selectedIncidentType={selectedIncidentType}
          onSelectIncidentType={setSelectedIncidentType}
          phase={phase}
          onTrigger={handleTriggerIncident}
        />

        {error && <ErrorBox message={error} />}

        {selectedShipment && selectedIncidentType && phase !== "idle" && (
          <>
            <ShipmentCard shipment={selectedShipment} />
            <IncidentAlert incidentType={selectedIncidentType} />
          </>
        )}

        {phase === "analyzing" && (
          <Spinner label="AI analyzing situation — loading carrier data, history, backup options..." />
        )}

        {["options", "acting", "resolved"].includes(phase) && analysis && (
          <>
            <AnalysisPanel keyFacts={analysis.key_facts} severity={analysis.severity} />

            {analysis.reasoning && (
              <div style={{
                background: "#F8FAFC", border: "1px solid #E2E8F0",
                borderRadius: 10, padding: "12px 16px", marginBottom: 14,
                fontSize: 13, color: "#475569", lineHeight: 1.7, fontStyle: "italic",
              }}>
                🤖 {analysis.reasoning}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: "#111827", marginBottom: 12, fontSize: 15 }}>
                Choose Resolution Strategy
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {analysis.options.map((opt) => (
                  <OptionCard
                    key={opt.id}
                    opt={opt}
                    selected={selectedOption}
                    onSelect={setSelectedOption}
                    disabled={phase !== "options"}
                  />
                ))}
              </div>

              {phase === "options" && (
                <button
                  onClick={handleConfirmOption}
                  disabled={!selectedOption}
                  style={{
                    marginTop: 14, width: "100%",
                    background: selectedOption ? "#2563EB" : "#E5E7EB",
                    color: selectedOption ? "#fff" : "#9CA3AF",
                    border: "none", borderRadius: 10, padding: "13px",
                    fontSize: 15, fontWeight: 700,
                    cursor: selectedOption ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                  }}
                >
                  ⚡ Confirm & Execute — Option {selectedOption || "?"}
                </button>
              )}

              {phase === "acting" && (
                <Spinner label="Generating client message and lessons learned..." />
              )}
            </div>
          </>
        )}

        {phase === "resolved" && chosenOption && clientMessage && (
          <>
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
              <ActionsPanel
                option={chosenOption}
                clientMessage={clientMessage}
                timerSeconds={timerSeconds}
              />
            </div>
            {lessons && <LessonsPanel lessons={lessons} />}
          </>
        )}

        {phase === "idle" && !backendError && !loadingShipments && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛰</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
              No Active Incidents
            </div>
            <div style={{ fontSize: 14 }}>
              Select a shipment and incident type above, then click "Trigger Incident".
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
import { useIncidentFlow } from "../../hooks/useIncidentFlow";
import Spinner from "../common/Spinner";
import AnalysisPanel from "../incident/AnalysisPanel";
import OptionCard from "../incident/OptionCard";
import ActionsPanel from "../incident/ActionsPanel";
import LessonsPanel from "../incident/LessonsPanel";

// ─── Resolved Summary ─────────────────────────────────────────────────────────

function ResolvedSummary({ incident }) {
  const { analysis, chosenOption, clientMessage, lessons, shipment } = incident;

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Resolution header */}
      <div style={{
        background: "#F0FDF4", border: "1.5px solid #86EFAC",
        borderRadius: 10, padding: "14px 18px", marginBottom: 20,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 24 }}>✅</span>
        <div>
          <div style={{ fontWeight: 700, color: "#166534", fontSize: 14 }}>
            Incident Resolved — Option {chosenOption?.id}
          </div>
          <div style={{ fontSize: 12, color: "#16A34A", marginTop: 2 }}>
            Resolved at {incident.resolvedAt?.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Options that were proposed */}
      {analysis && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            Options Proposed by AI
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {analysis.options.map((opt) => (
              <OptionCard
                key={opt.id}
                opt={opt}
                selected={chosenOption?.id}
                onSelect={() => {}}
                disabled
              />
            ))}
          </div>
        </div>
      )}

      {/* Chosen option details */}
      {chosenOption && clientMessage && (
        <div style={{ marginBottom: 20 }}>
          <ActionsPanel
            option={chosenOption}
            clientMessage={clientMessage}
            timerSeconds={null}
          />
        </div>
      )}

      {/* Lessons learned */}
      {lessons && <LessonsPanel lessons={lessons} />}
    </div>
  );
}

// ─── New Incident Flow ────────────────────────────────────────────────────────

function NewIncidentFlow({ incident, onResolved, onClose }) {
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
    timerSeconds,
    timerRunning,
  } = useIncidentFlow();

  // Auto-start analysis when modal opens
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) {
      setStarted(true);
      triggerIncident({
        shipmentId: incident.shipmentId,
        incidentType: incident.incidentType,
        incidentDescription: incident.description,
      });
    }
  }, []);

  useEffect(() => {
    if (phase === "resolved" && analysis && clientMessage) {
      const chosenOpt = analysis.options.find((o) => o.id === selectedOption);
      onResolved({
        analysis,
        chosenOption: chosenOpt,
        clientMessage,
        lessons,
      });
    }
  }, [phase]);

  async function handleConfirm() {
    confirmOption({
      shipmentId: incident.shipmentId,
      incidentType: incident.incidentType,
    });
  }

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Incident alert */}
      <div style={{
        background: `${incident.color}12`,
        border: `1.5px solid ${incident.color}40`,
        borderLeft: `4px solid ${incident.color}`,
        borderRadius: 10, padding: "14px 18px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 22 }}>{incident.icon}</span>
          <div style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>
            {incident.label} — {incident.shipment.id}
          </div>
          {(timerRunning || timerSeconds > 0) && (
            <div style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 12, color: "#6B7280" }}>
              ⏱ {String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:{String(timerSeconds % 60).padStart(2, "0")}
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#374151" }}>{incident.description}</div>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
          Route: {incident.shipment.route} · Position: {incident.shipment.position}
        </div>
      </div>

      {error && (
        <div style={{
          background: "#FEF2F2", border: "1px solid #FECACA",
          borderRadius: 8, padding: "12px 16px", marginBottom: 16,
          fontSize: 13, color: "#991B1B",
        }}>
          ⚠ {error}
        </div>
      )}

      {phase === "analyzing" && (
        <Spinner label="AI analyzing — loading carrier data, history, backup options..." />
      )}

      {["options", "acting"].includes(phase) && analysis && (
        <>
          <AnalysisPanel keyFacts={analysis.key_facts} severity={analysis.severity} />

          {analysis.reasoning && (
            <div style={{
              background: "#F8FAFC", border: "1px solid #E2E8F0",
              borderRadius: 8, padding: "10px 14px", marginBottom: 14,
              fontSize: 12, color: "#475569", lineHeight: 1.6, fontStyle: "italic",
            }}>
              🤖 {analysis.reasoning}
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, color: "#111827", marginBottom: 10, fontSize: 14 }}>
              Choose Resolution Strategy
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {analysis.options.map((opt) => (
                <OptionCard
                  key={opt.id}
                  opt={opt}
                  selected={selectedOption}
                  onSelect={phase === "options" ? setSelectedOption : () => {}}
                  disabled={phase !== "options"}
                />
              ))}
            </div>
          </div>

          {phase === "options" && (
            <button
              onClick={handleConfirm}
              disabled={!selectedOption}
              style={{
                width: "100%",
                background: selectedOption ? "#2563EB" : "#E5E7EB",
                color: selectedOption ? "#fff" : "#9CA3AF",
                border: "none", borderRadius: 10, padding: "12px",
                fontSize: 14, fontWeight: 700,
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
        </>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

export default function IncidentModal({ incident, onClose, onResolved }) {
  if (!incident) return null;

  const isResolved = incident.status === "resolved";
  const title = isResolved
    ? `Resolved: ${incident.label}`
    : `New Incident: ${incident.label}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(15,23,42,0.65)",
        zIndex: 400,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 60,
        padding: "60px 20px 20px",
        animation: "fadeIn 0.2s ease",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 680,
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid #F3F4F6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: isResolved ? "#F0FDF4" : "#FFFBEB",
          borderRadius: "16px 16px 0 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{incident.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{title}</div>
              <div style={{ fontSize: 11, color: "#6B7280" }}>
                {incident.shipment.route} · {incident.shipment.id}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "#F3F4F6", border: "none", borderRadius: 8,
            width: 32, height: 32, cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            ✕
          </button>
        </div>

        {/* Content */}
        {isResolved
          ? <ResolvedSummary incident={incident} />
          : <NewIncidentFlow incident={incident} onResolved={onResolved} onClose={onClose} />
        }
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
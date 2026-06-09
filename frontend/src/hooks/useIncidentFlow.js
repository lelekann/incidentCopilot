import { useState, useEffect } from "react";
import { analyzeIncident, generateActions } from "../services/api";
import { INCIDENT_CONFIG } from "../config/incidentConfig";

export function useIncidentFlow() {
  const [phase, setPhase] = useState("idle");

  const [analysis, setAnalysis] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [clientMessage, setClientMessage] = useState("");
  const [lessons, setLessons] = useState(null);
  const [error, setError] = useState(null);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  // ── Step 1 ─────────────────────────────────────────────────────────────────
  async function triggerIncident({ shipmentId, incidentType }) {
    setPhase("analyzing");
    setError(null);
    setAnalysis(null);
    setSelectedOption(null);
    setClientMessage("");
    setLessons(null);
    setTimerSeconds(0);
    setTimerRunning(true);

    try {
      const incident = INCIDENT_CONFIG[incidentType];

      const { ok, data } = await analyzeIncident({
        shipmentId,
        incidentType,
        incidentDescription: incident.defaultDescription,
      });

      if (!ok) throw new Error(data.error || "Analysis failed");

      setAnalysis(data.analysis);
      setPhase("options");
    } catch (err) {
      setError(err.message);
      setPhase("idle");
    } finally {
      setTimerRunning(false);
    }
  }

  // ── Step 2 ─────────────────────────────────────────────────────────────────
  async function confirmOption({ shipmentId, incidentType }) {
    if (!selectedOption || !analysis) return;

    setPhase("acting");
    setError(null);

    try {
      const option = analysis.options.find((o) => o.id === selectedOption);

      const { ok, data } = await generateActions({
        shipmentId,
        incidentType,
        selectedOption,
        optionDetails: {
          action_carrier: option.action_carrier,
          action_eta: option.action_eta,
          cost_delta: option.cost_delta,
        },
      });

      if (!ok) throw new Error(data.error || "Action generation failed");

      setClientMessage(data.clientMessage);
      setLessons(data.lessonsLearned);
      setPhase("resolved");
    } catch (err) {
      setError(err.message);
      setPhase("options");
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  function reset() {
    setPhase("idle");
    setAnalysis(null);
    setSelectedOption(null);
    setClientMessage("");
    setLessons(null);
    setError(null);
    setTimerSeconds(0);
    setTimerRunning(false);
  }

  return {
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
  };
}
import { useState, useEffect, useRef } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const SHIPMENTS = {
  breakdown: {
    id: "SHP-2041",
    route: "Warsaw → Amsterdam",
    cargo: "18 pallets – Consumer Electronics",
    carrier: "Jan Kowalski Transport",
    carrierId: "ABC",
    driver: "Marek Nowak",
    eta: "Tomorrow 09:00",
    client: "MediaMarkt NL",
    value: "€124,000",
    position: "Near Poznań, A2 highway",
    kmLeft: 387,
    hoursToDeadline: 19,
  },
  weather: {
    id: "SHP-2047",
    route: "Denver → Chicago",
    cargo: "32 pallets – Auto Parts",
    carrier: "Rocky Mountain Freight",
    carrierId: "RMF",
    driver: "Jake Miller",
    eta: "Today 22:00",
    client: "Ford Distribution Center",
    value: "€89,500",
    position: "I-70, Colorado",
    kmLeft: 1540,
    hoursToDeadline: 14,
  },
  cancellation: {
    id: "SHP-2053",
    route: "Lyon → Hamburg",
    cargo: "24 pallets – Pharmaceutical",
    carrier: "EuroTrans GmbH",
    carrierId: "ETG",
    driver: "Hans Mueller",
    eta: "Tomorrow 14:00",
    client: "Bayer AG",
    value: "€210,000",
    position: "Lyon depot (not yet departed)",
    kmLeft: 880,
    hoursToDeadline: 22,
  },
};

const INCIDENTS = {
  breakdown: {
    type: "breakdown",
    label: "Vehicle Breakdown",
    icon: "🔧",
    color: "#F97316",
    trigger: "GPS tracker: vehicle stationary 47 min · Driver SMS: Engine failure",
    severity: "HIGH",
    description: "Truck engine failure near Poznań. Vehicle immobilized on A2 highway.",
  },
  weather: {
    type: "weather",
    label: "Weather Disruption",
    icon: "❄️",
    color: "#60A5FA",
    trigger: "NOAA Alert: Severe snowstorm warning I-70 Colorado · Wind 65mph · Visibility <100m",
    severity: "CRITICAL",
    description: "Snowstorm closing I-70 in Colorado. Road closed by state authorities.",
  },
  cancellation: {
    type: "cancellation",
    label: "Carrier Cancellation",
    icon: "🚫",
    color: "#EF4444",
    trigger: "EuroTrans GmbH: Capacity unavailable · Driver sick leave · No replacement available",
    severity: "HIGH",
    description: "Carrier cancelled 4 hours before scheduled departure. Cargo still at Lyon depot.",
  },
};

const ANALYSIS = {
  breakdown: {
    facts: [
      { label: "Distance remaining", value: "387 km" },
      { label: "Time to deadline", value: "19 hours" },
      { label: "Cargo sensitivity", value: "Electronics – no temp req." },
      { label: "Penalty if late", value: "€1,200 / 24h" },
      { label: "Recovery window", value: "~16 hours available" },
    ],
    options: [
      {
        id: "A",
        label: "Replace carrier immediately",
        time: "Delivery 06:00 (+3h delay)",
        cost: "+€380",
        risk: "Low",
        recommended: true,
        note: "FastCargo EU available, 3h response time. Deadline met.",
        action_carrier: "FastCargo EU",
        action_eta: "Tomorrow 06:00",
      },
      {
        id: "B",
        label: "Wait for repair + partial load",
        time: "Delivery 14:00 (+5h delay)",
        cost: "+€150 penalty",
        risk: "Medium",
        recommended: false,
        note: "Repair estimated 6–8h. Risk of further delay if repair fails.",
        action_carrier: "Jan Kowalski Transport (repaired)",
        action_eta: "Tomorrow 14:00",
      },
      {
        id: "C",
        label: "Split shipment",
        time: "50% today, 50% +8h",
        cost: "+€520",
        risk: "Medium",
        recommended: false,
        note: "Critical SKUs delivered on time. Client receives partial order.",
        action_carrier: "Two carriers",
        action_eta: "Split delivery",
      },
    ],
  },
  weather: {
    facts: [
      { label: "Distance remaining", value: "1,540 km" },
      { label: "Time to deadline", value: "14 hours" },
      { label: "Road closure est.", value: "18–24 hours" },
      { label: "Penalty if late", value: "€2,800 flat" },
      { label: "Alt route available", value: "US-40 (+290km)" },
    ],
    options: [
      {
        id: "A",
        label: "Reroute via US-40",
        time: "Delivery +6h delay → 04:00",
        cost: "+€290 fuel",
        risk: "Low",
        recommended: true,
        note: "US-40 clear per NOAA. Adds 290km but avoids full closure.",
        action_carrier: "Rocky Mountain Freight (rerouted)",
        action_eta: "Tomorrow 04:00",
      },
      {
        id: "B",
        label: "Hold at Denver, depart after storm",
        time: "Delivery +18h → next day",
        cost: "+€180 storage + €2,800 penalty",
        risk: "High",
        recommended: false,
        note: "Safest for cargo, but penalty unavoidable.",
        action_carrier: "Rocky Mountain Freight (hold)",
        action_eta: "+18 hours",
      },
      {
        id: "C",
        label: "Transfer to air freight",
        time: "On-time delivery",
        cost: "+€4,200",
        risk: "Low",
        recommended: false,
        note: "Denver airport operational. High cost but deadline guaranteed.",
        action_carrier: "FedEx Air Freight",
        action_eta: "Today 22:00 (on time)",
      },
    ],
  },
  cancellation: {
    facts: [
      { label: "Distance remaining", value: "880 km" },
      { label: "Time to deadline", value: "22 hours" },
      { label: "Cargo sensitivity", value: "Pharmaceutical – temp controlled" },
      { label: "Penalty if late", value: "€4,500 + contract clause" },
      { label: "Depot availability", value: "Lyon open until 20:00" },
    ],
    options: [
      {
        id: "A",
        label: "Emergency carrier via load board",
        time: "Departure 16:00, delivery on time",
        cost: "+€680 spot premium",
        risk: "Medium",
        recommended: true,
        note: "3 carriers available on Transporeon. Temp-controlled confirmed.",
        action_carrier: "Transporeon Spot – TempFreight FR",
        action_eta: "Tomorrow 13:30",
      },
      {
        id: "B",
        label: "Own fleet repositioning",
        time: "Departure 18:00, +2h delay",
        cost: "+€310",
        risk: "Low",
        recommended: false,
        note: "Company truck available in Dijon (120km). Driver hours compliant.",
        action_carrier: "Own fleet – Truck #07",
        action_eta: "Tomorrow 16:00",
      },
      {
        id: "C",
        label: "Rail freight LTL",
        time: "Departure tomorrow AM, +12h delay",
        cost: "+€220",
        risk: "High",
        recommended: false,
        note: "Cheapest option but significant delay. Penalty likely.",
        action_carrier: "DB Cargo",
        action_eta: "+12 hours",
      },
    ],
  },
};

const LESSONS = {
  breakdown: {
    stats: [
      { value: "7", label: "similar incidents in last 12 months" },
      { value: "5", label: "involved Carrier ABC (Jan Kowalski)" },
      { value: "18%", label: "higher disruption rate on Warsaw→Amsterdam" },
    ],
    insights: [
      "Carrier ABC has the highest breakdown rate in your network. Consider renegotiating SLA or reducing allocation.",
      "A2 highway segment near Poznań accounts for 43% of all vehicle breakdown incidents.",
      "Average recovery time for this incident type: 4.2 hours with pre-approved backup carriers.",
    ],
    recommendation: "Add FastCargo EU as pre-approved backup for Warsaw→Amsterdam lane.",
  },
  weather: {
    stats: [
      { value: "12", label: "weather disruptions on I-70 last 12 months" },
      { value: "Q1", label: "highest disruption quarter (Jan–Mar)" },
      { value: "€31K", label: "total penalty cost from weather delays YTD" },
    ],
    insights: [
      "I-70 Colorado corridor shows seasonal pattern: 80% of disruptions occur Nov–Mar.",
      "Rerouting via US-40 was used in 4 previous incidents – avg additional cost €260.",
      "Consider adding weather monitoring alert for this lane during winter season.",
    ],
    recommendation: "Pre-negotiate US-40 routing clause with Rocky Mountain Freight for winter months.",
  },
  cancellation: {
    stats: [
      { value: "4", label: "EuroTrans GmbH cancellations this year" },
      { value: "3", label: "involved pharmaceutical cargo" },
      { value: "€18K", label: "total exposure from ETG cancellations" },
    ],
    insights: [
      "EuroTrans GmbH cancellation rate: 8.3% — highest in your EU carrier pool.",
      "Lyon depot departures have 22% higher cancellation rate than other origins.",
      "Pharmaceutical shipments require temp-certified backup — only 2 carriers in your network qualify.",
    ],
    recommendation: "Reduce EuroTrans GmbH allocation. Add TempFreight FR as primary for pharma lanes.",
  },
};

// ─── CLIENT MESSAGES ──────────────────────────────────────────────────────────
function generateMessage(incidentType, option, shipment) {
  const messages = {
    breakdown: {
      A: `Dear ${shipment.client},\n\nWe're writing to inform you that shipment ${shipment.id} (${shipment.cargo}) has encountered a technical issue — vehicle breakdown near Poznań on the A2 highway.\n\nWe have already arranged a replacement carrier and your shipment is back on track. Updated ETA: tomorrow at 06:00 (approx. 3-hour delay from original schedule).\n\nWe sincerely apologize for this disruption and are committed to minimizing any impact on your operations. Please don't hesitate to reach out if you have any questions.\n\nBest regards,\nLogistics Operations Team`,
      B: `Dear ${shipment.client},\n\nShipment ${shipment.id} has experienced a vehicle breakdown near Poznań. The carrier is working to resolve the issue. Updated ETA: tomorrow at 14:00.\n\nWe will keep you informed of any further changes.\n\nBest regards,\nLogistics Operations Team`,
      C: `Dear ${shipment.client},\n\nDue to a vehicle breakdown, shipment ${shipment.id} will be split into two deliveries. Critical SKUs will arrive on schedule; remaining items will follow within 8 hours. Our team will coordinate with your receiving department.\n\nBest regards,\nLogistics Operations Team`,
    },
    weather: {
      A: `Dear ${shipment.client},\n\nDue to a severe snowstorm closing I-70 in Colorado, shipment ${shipment.id} has been rerouted via US-40. This adds approximately 290km but ensures safe and timely delivery.\n\nUpdated ETA: tomorrow at 04:00 (6-hour delay). The cargo is safe and moving.\n\nWe appreciate your understanding and will provide live tracking updates throughout the journey.\n\nBest regards,\nLogistics Operations Team`,
      B: `Dear ${shipment.client},\n\nDue to I-70 closure from severe weather, shipment ${shipment.id} is being held safely in Denver until road conditions clear. We expect departure in 18–24 hours.\n\nWe regret the delay and will update you as soon as departure is confirmed.\n\nBest regards,\nLogistics Operations Team`,
      C: `Dear ${shipment.client},\n\nTo ensure on-time delivery despite the I-70 closure, we have arranged air freight transfer for shipment ${shipment.id} from Denver Airport. Your delivery will arrive as originally scheduled.\n\nBest regards,\nLogistics Operations Team`,
    },
    cancellation: {
      A: `Dear ${shipment.client},\n\nWe must inform you that our original carrier for shipment ${shipment.id} (${shipment.cargo}) has cancelled due to unavailable capacity. We take full responsibility for this disruption.\n\nWe have immediately sourced a certified temperature-controlled replacement carrier. Departure is confirmed for 16:00 today, with delivery on track for tomorrow at 13:30 — within your required window.\n\nWe apologize for any concern this may have caused.\n\nBest regards,\nLogistics Operations Team`,
      B: `Dear ${shipment.client},\n\nDue to a carrier cancellation, shipment ${shipment.id} will depart at 18:00 with our own fleet vehicle. Expected delivery: tomorrow at 16:00 (2-hour delay).\n\nBest regards,\nLogistics Operations Team`,
      C: `Dear ${shipment.client},\n\nDue to carrier cancellation, shipment ${shipment.id} will be transferred to rail freight. This will result in an approximate 12-hour delay. We are actively working to minimize the impact.\n\nBest regards,\nLogistics Operations Team`,
    },
  };
  return messages[incidentType]?.[option] || "";
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function SeverityBadge({ level }) {
  const styles = {
    CRITICAL: { bg: "#FEE2E2", color: "#991B1B", dot: "#EF4444" },
    HIGH: { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
    MEDIUM: { bg: "#DBEAFE", color: "#1E40AF", dot: "#3B82F6" },
  };
  const s = styles[level] || styles.MEDIUM;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
      padding: "2px 9px", borderRadius: 20, letterSpacing: "0.08em",
      textTransform: "uppercase"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {level}
    </span>
  );
}

function Timer({ running, seconds }) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      fontFamily: "'Courier New', monospace",
      fontSize: 13, color: running ? "#10B981" : "#6B7280"
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: running ? "#10B981" : "#6B7280",
        animation: running ? "pulse 1s infinite" : "none"
      }} />
      AI Response Time: {mins}:{secs}
    </div>
  );
}

function ShipmentCard({ shipment, incident }) {
  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid #E5E7EB",
      borderRadius: 12, padding: "20px 24px", marginBottom: 16
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Active Shipment
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>{shipment.id}</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>{shipment.route}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <SeverityBadge level={incident.severity} />
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 6 }}>ETA: {shipment.eta}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {[
          { label: "Cargo", val: shipment.cargo },
          { label: "Carrier", val: shipment.carrier },
          { label: "Client", val: shipment.client },
          { label: "Position", val: shipment.position },
          { label: "Value", val: shipment.value },
          { label: "KM Left", val: `${shipment.kmLeft} km` },
        ].map(({ label, val }) => (
          <div key={label} style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            <div style={{ fontSize: 13, color: "#1F2937", fontWeight: 500, marginTop: 2 }}>{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncidentAlert({ incident }) {
  return (
    <div style={{
      background: `${incident.color}12`,
      border: `1.5px solid ${incident.color}40`,
      borderLeft: `4px solid ${incident.color}`,
      borderRadius: 10, padding: "16px 20px", marginBottom: 16,
      animation: "slideIn 0.4s ease"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{incident.icon}</span>
        <div>
          <div style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>
            INCIDENT DETECTED: {incident.label}
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{incident.trigger}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#374151" }}>{incident.description}</div>
    </div>
  );
}

function AnalysisPanel({ analysis }) {
  return (
    <div style={{
      background: "#F0FDF4", border: "1px solid #BBF7D0",
      borderRadius: 10, padding: "16px 20px", marginBottom: 16,
      animation: "slideIn 0.4s ease 0.1s both"
    }}>
      <div style={{ fontWeight: 700, color: "#166534", marginBottom: 12, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        🧠 AI Analysis Complete
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 8 }}>
        {analysis.facts.map(f => (
          <div key={f.label} style={{ background: "#fff", borderRadius: 8, padding: "10px 14px", border: "1px solid #D1FAE5" }}>
            <div style={{ fontSize: 10, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>{f.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginTop: 2 }}>{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OptionCard({ opt, selected, onSelect }) {
  const isSelected = selected === opt.id;
  return (
    <div
      onClick={() => onSelect(opt.id)}
      style={{
        border: isSelected ? "2px solid #2563EB" : "1.5px solid #E5E7EB",
        borderRadius: 10, padding: "14px 18px", cursor: "pointer",
        background: isSelected ? "#EFF6FF" : "#fff",
        transition: "all 0.2s", position: "relative",
        animation: "slideIn 0.4s ease both"
      }}
    >
      {opt.recommended && (
        <div style={{
          position: "absolute", top: -10, right: 14,
          background: "#10B981", color: "#fff", fontSize: 10,
          fontWeight: 700, padding: "2px 10px", borderRadius: 20,
          letterSpacing: "0.08em", textTransform: "uppercase"
        }}>
          ✓ Recommended
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>
          Option {opt.id}: {opt.label}
        </div>
        {isSelected && <span style={{ color: "#2563EB", fontWeight: 700 }}>✓</span>}
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 16 }}>
        <span style={{ fontSize: 12, color: "#6B7280" }}>⏱ {opt.time}</span>
        <span style={{ fontSize: 12, color: opt.cost.startsWith("+€") ? "#DC2626" : "#059669", fontWeight: 600 }}>{opt.cost}</span>
        <span style={{ fontSize: 12, color: opt.risk === "Low" ? "#059669" : opt.risk === "Medium" ? "#D97706" : "#DC2626" }}>
          Risk: {opt.risk}
        </span>
      </div>
      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>{opt.note}</div>
    </div>
  );
}

function ActionsPanel({ option, incidentType, shipment }) {
  const [msgCopied, setMsgCopied] = useState(false);
  const message = generateMessage(incidentType, option.id, shipment);

  return (
    <div style={{ animation: "slideIn 0.5s ease" }}>
      <div style={{ fontWeight: 700, color: "#111827", marginBottom: 14, fontSize: 15 }}>
        ⚡ Automated Actions — Option {option.id}
      </div>
      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        {[
          { icon: "🚛", label: "Carrier assigned", val: option.action_carrier, color: "#DBEAFE", border: "#BFDBFE" },
          { icon: "🕐", label: "New ETA", val: option.action_eta, color: "#D1FAE5", border: "#A7F3D0" },
          { icon: "💶", label: "Cost delta", val: option.cost, color: "#FEF3C7", border: "#FDE68A" },
          { icon: "📋", label: "Freight audit", val: "Claim initiated vs original carrier", color: "#F3E8FF", border: "#DDD6FE" },
        ].map(a => (
          <div key={a.label} style={{
            display: "flex", alignItems: "center", gap: 12,
            background: a.color, border: `1px solid ${a.border}`,
            borderRadius: 8, padding: "10px 14px"
          }}>
            <span style={{ fontSize: 18 }}>{a.icon}</span>
            <div>
              <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, textTransform: "uppercase" }}>{a.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1F2937" }}>{a.val}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>📧 Client Notification — Draft Ready</div>
          <button
            onClick={() => { navigator.clipboard?.writeText(message); setMsgCopied(true); setTimeout(() => setMsgCopied(false), 2000); }}
            style={{
              background: msgCopied ? "#10B981" : "#2563EB", color: "#fff",
              border: "none", borderRadius: 6, padding: "5px 14px",
              fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}
          >
            {msgCopied ? "✓ Copied" : "Copy"}
          </button>
        </div>
        <pre style={{
          fontFamily: "inherit", fontSize: 12, color: "#374151",
          whiteSpace: "pre-wrap", lineHeight: 1.7, margin: 0
        }}>
          {message}
        </pre>
      </div>
    </div>
  );
}

function LessonsPanel({ lessons }) {
  return (
    <div style={{
      background: "#FFFBEB", border: "1.5px solid #FDE68A",
      borderRadius: 12, padding: "20px 24px",
      animation: "slideIn 0.5s ease"
    }}>
      <div style={{ fontWeight: 700, color: "#92400E", fontSize: 15, marginBottom: 16 }}>
        📚 Lessons Learned
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
        {lessons.stats.map(s => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: 8, padding: "12px 16px",
            border: "1px solid #FDE68A", textAlign: "center"
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#D97706" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#92400E", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {lessons.insights.map((ins, i) => (
          <div key={i} style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            fontSize: 13, color: "#374151", lineHeight: 1.6
          }}>
            <span style={{ color: "#D97706", fontWeight: 700, marginTop: 1 }}>›</span>
            {ins}
          </div>
        ))}
      </div>
      <div style={{
        background: "#FEF3C7", border: "1px solid #FCD34D",
        borderRadius: 8, padding: "10px 14px", fontSize: 13,
        color: "#92400E", fontWeight: 500
      }}>
        💡 <strong>Recommendation:</strong> {lessons.recommendation}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function LogisticsIncidentCopilot() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | triggered | analyzing | options | resolved
  const [selectedOption, setSelectedOption] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  useEffect(() => {
    if (phase !== "idle") {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [phase]);

  function triggerIncident(type) {
    setSelectedScenario(type);
    setPhase("triggered");
    setSelectedOption(null);
    setTimerSeconds(0);
    setTimerRunning(true);

    setTimeout(() => setPhase("analyzing"), 1200);
    setTimeout(() => { setPhase("options"); setTimerRunning(false); }, 2600);
  }

  function confirmOption() {
    if (!selectedOption) return;
    setPhase("resolved");
  }

  function reset() {
    setSelectedScenario(null);
    setPhase("idle");
    setSelectedOption(null);
    setTimerSeconds(0);
    setTimerRunning(false);
  }

  const incident = selectedScenario ? INCIDENTS[selectedScenario] : null;
  const shipment = selectedScenario ? SHIPMENTS[selectedScenario] : null;
  const analysis = selectedScenario ? ANALYSIS[selectedScenario] : null;
  const lessons = selectedScenario ? LESSONS[selectedScenario] : null;
  const chosenOption = selectedOption ? analysis?.options.find(o => o.id === selectedOption) : null;

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#F3F4F6", minHeight: "100vh" }}>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#0F172A", color: "#fff", padding: "14px 28px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid #1E293B"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            background: "#2563EB", width: 34, height: 34, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
          }}>🚚</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>Logistics Incident Copilot</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>AI-Powered Operations Center · PoC Demo</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Timer running={timerRunning} seconds={timerSeconds} />
          {phase !== "idle" && (
            <button onClick={reset} style={{
              background: "transparent", border: "1px solid #334155",
              color: "#94A3B8", borderRadius: 6, padding: "5px 14px",
              fontSize: 12, cursor: "pointer"
            }}>↺ Reset</button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>

        {/* Scenario Selector */}
        <div style={{
          background: "#fff", border: "1px solid #E5E7EB",
          borderRadius: 12, padding: "20px 24px", marginBottom: 20
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Simulate Incident
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {Object.entries(INCIDENTS).map(([key, inc]) => (
              <button
                key={key}
                onClick={() => triggerIncident(key)}
                disabled={timerRunning}
                style={{
                  border: selectedScenario === key ? `2px solid ${inc.color}` : "1.5px solid #E5E7EB",
                  background: selectedScenario === key ? `${inc.color}10` : "#F9FAFB",
                  borderRadius: 10, padding: "14px 12px", cursor: "pointer",
                  transition: "all 0.2s", textAlign: "left",
                  opacity: timerRunning && selectedScenario !== key ? 0.5 : 1
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{inc.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{inc.label}</div>
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3 }}>
                  {key === "breakdown" ? "Jan Kowalski · Warsaw→Amsterdam" :
                   key === "weather" ? "Rocky Mtn · Denver→Chicago" :
                   "EuroTrans GmbH · Lyon→Hamburg"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Flow */}
        {incident && shipment && (
          <>
            <ShipmentCard shipment={shipment} incident={incident} />
            <IncidentAlert incident={incident} />

            {(phase === "analyzing") && (
              <div style={{
                background: "#EFF6FF", border: "1px solid #BFDBFE",
                borderRadius: 10, padding: "20px 24px", textAlign: "center",
                animation: "slideIn 0.3s ease"
              }}>
                <div style={{
                  display: "inline-block", width: 24, height: 24, border: "3px solid #2563EB",
                  borderTopColor: "transparent", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite", marginBottom: 10
                }} />
                <div style={{ fontWeight: 600, color: "#1D4ED8" }}>
                  AI is analyzing situation — checking carriers, routes, contracts...
                </div>
              </div>
            )}

            {(phase === "options" || phase === "resolved") && analysis && (
              <>
                <AnalysisPanel analysis={analysis} />
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: "#111827", marginBottom: 12, fontSize: 15 }}>
                    Choose Resolution Strategy
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {analysis.options.map(opt => (
                      <OptionCard
                        key={opt.id}
                        opt={opt}
                        selected={selectedOption}
                        onSelect={phase !== "resolved" ? setSelectedOption : () => {}}
                      />
                    ))}
                  </div>
                  {phase !== "resolved" && (
                    <button
                      onClick={confirmOption}
                      disabled={!selectedOption}
                      style={{
                        marginTop: 14, width: "100%",
                        background: selectedOption ? "#2563EB" : "#E5E7EB",
                        color: selectedOption ? "#fff" : "#9CA3AF",
                        border: "none", borderRadius: 10, padding: "13px",
                        fontSize: 15, fontWeight: 700, cursor: selectedOption ? "pointer" : "not-allowed",
                        transition: "all 0.2s"
                      }}
                    >
                      ⚡ Confirm & Execute — Option {selectedOption || "?"}
                    </button>
                  )}
                </div>
              </>
            )}

            {phase === "resolved" && chosenOption && (
              <>
                <div style={{
                  background: "#F0FDF4", border: "1.5px solid #86EFAC",
                  borderRadius: 10, padding: "14px 20px", marginBottom: 16,
                  display: "flex", alignItems: "center", gap: 12,
                  animation: "slideIn 0.4s ease"
                }}>
                  <span style={{ fontSize: 24 }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#166534", fontSize: 15 }}>
                      Incident Resolved — Option {chosenOption.id} Activated
                    </div>
                    <div style={{ fontSize: 12, color: "#16A34A", marginTop: 2 }}>
                      All actions executed · Carrier notified · Client message ready · Audit log created
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>Total response time</div>
                    <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#166534", fontSize: 16 }}>
                      {String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:{String(timerSeconds % 60).padStart(2, "0")}
                    </div>
                  </div>
                </div>
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
                  <ActionsPanel option={chosenOption} incidentType={selectedScenario} shipment={shipment} />
                </div>
                <LessonsPanel lessons={lessons} />
              </>
            )}
          </>
        )}

        {phase === "idle" && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛰</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
              No Active Incidents
            </div>
            <div style={{ fontSize: 14 }}>Select a scenario above to simulate an incident and see the AI Copilot in action.</div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

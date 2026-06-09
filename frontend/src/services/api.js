const API = "http://localhost:3001";

export async function getShipments() {
  const res = await fetch(`${API}/api/shipments`);
  
  if (!res.ok) {
    throw new Error("Failed to load shipments");
  }

  return res.json();
}

export async function analyzeIncident(payload) {
  const res = await fetch(`${API}/api/analyze-incident`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return {
    ok: res.ok,
    data: await res.json()
  };
}

export async function generateActions(payload) {
  const res = await fetch(`${API}/api/generate-actions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return {
    ok: res.ok,
    data: await res.json()
  };
}
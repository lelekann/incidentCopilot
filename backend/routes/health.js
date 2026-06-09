import { Router } from "express";
import { db } from "../config/db.js";
import { MODEL } from "../config/openai.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Logistics Incident Copilot API",
    model: MODEL,
    db: {
      carriers: db.carriers.length,
      shipments: db.shipments.length,
      incidents: db.incidents.length,
    },
  });
});

export default router;
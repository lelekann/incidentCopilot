import { Router } from "express";
import {
  analyzeIncident,
  generateActions,
  freightAudit,
} from "../controllers/incidentController.js";

const router = Router();

router.post("/analyze-incident", analyzeIncident);
router.post("/generate-actions", generateActions);
router.post("/freight-audit", freightAudit);

export default router;
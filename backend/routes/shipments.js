import { Router } from "express";
import { getAll } from "../controllers/shipmentController.js";

const router = Router();

router.get("/", getAll);

export default router;
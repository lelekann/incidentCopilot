import { Router } from "express";
import { getAll } from "../controllers/carrierController.js";

const router = Router();

router.get("/", getAll);

export default router;
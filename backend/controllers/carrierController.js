import { db } from "../config/db.js";

export function getAll(req, res) {
  res.json({ success: true, carriers: db.carriers });
}
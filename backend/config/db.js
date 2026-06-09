import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
 
const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = (file) => join(__dirname, "../db", file);
 
export const db = {
  carriers: JSON.parse(readFileSync(dbPath("carriers.json"), "utf8")),
  shipments: JSON.parse(readFileSync(dbPath("shipments.json"), "utf8")),
  incidents: JSON.parse(readFileSync(dbPath("incident_history.json"), "utf8")),
};
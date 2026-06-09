import express from "express";
import cors from "cors";

import healthRouter from "./routes/health.js";
import shipmentsRouter from "./routes/shipments.js";
import incidentsRouter from "./routes/incidents.js";
import carriersRouter from "./routes/carriers.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", healthRouter);
app.use("/api/shipments", shipmentsRouter);
app.use("/api/carriers", carriersRouter);
app.use("/api", incidentsRouter);

export default app;
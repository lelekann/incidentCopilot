import app from "./app.js";
import { PORT } from "./config/env.js";
import { db } from "./config/db.js";

app.listen(PORT, () => {
  console.log(`\n🚚 Logistics Incident Copilot API`);
  console.log(`   http://localhost:${PORT}`);
  console.log(
    `   DB: ${db.carriers.length} carriers · ${db.shipments.length} shipments · ${db.incidents.length} incidents\n`,
  );
});
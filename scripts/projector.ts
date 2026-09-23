import { pool } from "../src/infrastructure/db/pool";
import { projectPendingEvents } from "../src/application/projections/orderProjector";

const delay = Number(process.env.PROJECTION_POLL_MS ?? 700);
let running = true;

process.on("SIGTERM", () => { running = false; });
process.on("SIGINT", () => { running = false; });

async function main() {
  console.log(`[projector] started, poll=${delay}ms`);
  while (running) {
    try {
      const count = await projectPendingEvents(pool, 20);
      if (count > 0) console.log(`[projector] projected ${count} event(s)`);
    } catch (error) {
      console.error("[projector] iteration failed", error);
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

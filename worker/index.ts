import { processOutboxBatch } from "../lib/email/outbox";
import { logger } from "../lib/logger";

const intervalMs = Number(process.env.EMAIL_POLL_MS ?? 15000);
let stopping = false;

async function tick() {
  if (stopping) return;
  try {
    await processOutboxBatch(process.env.HOSTNAME ?? "worker");
  } catch {
    logger.error("worker_tick_failed");
  }
}

async function main() {
  logger.info("email_worker_started");
  await tick();
  const timer = setInterval(tick, intervalMs);
  const stop = async () => {
    stopping = true;
    clearInterval(timer);
    logger.info("email_worker_stopping");
    process.exit(0);
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}

void main();

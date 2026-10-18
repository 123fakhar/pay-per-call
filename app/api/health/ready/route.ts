import { pingDatabase } from "@/lib/db";
import { outboxBacklog } from "@/lib/email/outbox";

export async function GET() {
  try {
    await pingDatabase();
    const outbox = await outboxBacklog();
    const failed = outbox.find((row) => row.status === "failed")?.count ?? 0;
    return Response.json({
      status: "ready",
      database: "ok",
      version: process.env.APP_VERSION ?? "dev",
      emailOutboxFailed: failed,
    });
  } catch {
    return Response.json({ status: "not_ready", database: "unavailable" }, { status: 503 });
  }
}

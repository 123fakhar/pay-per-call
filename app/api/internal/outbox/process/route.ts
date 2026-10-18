import { processOutboxBatch } from "@/lib/email/outbox";
import { jsonError } from "@/lib/http";
import { safeEqual } from "@/lib/hash";

export async function POST(request: Request) {
  const configured = process.env.WORKER_SECRET;
  const provided = request.headers.get("x-worker-secret") ?? "";
  if (!configured || !safeEqual(provided, configured)) {
    return jsonError("Unauthorized", 401);
  }

  const result = await processOutboxBatch("worker");
  return Response.json({ ok: true, ...result });
}

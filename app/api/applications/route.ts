import { after } from "next/server";
import { persistApplication } from "@/lib/applications/submit";
import { processOutboxBatch } from "@/lib/email/outbox";
import { jsonError, isSameOrigin } from "@/lib/http";
import { logger } from "@/lib/logger";
import { clientIp, enforceSubmissionRateLimit } from "@/lib/rate-limit";
import { isTooFast, parseApplicationInput } from "@/lib/validation/application";

export const maxDuration = 30;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Invalid request origin", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = parseApplicationInput(payload, {
    gmailOnly: process.env.GMAIL_ONLY_REGISTRATION === "true",
  });
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (parsed.data.websiteFax) {
    return jsonError("Invalid submission", 400);
  }
  if (isTooFast(parsed.data.formStartedAt)) {
    return jsonError("Please review the form before submitting", 400);
  }

  try {
    const ip = clientIp(request.headers);
    const rate = await enforceSubmissionRateLimit(ip);
    if (rate.limited) {
      return jsonError("Too many submissions. Try again later.", 429);
    }

    const application = await persistApplication(parsed.data, rate.keyHash);
    after(async () => {
      try {
        await processOutboxBatch(`submit-${application.id}`);
      } catch {
        logger.error("outbox_after_submit_failed", { applicationId: application.id });
      }
    });

    logger.info("application_stored", { applicationId: application.id });
    return Response.json({
      ok: true,
      applicationId: application.id,
      emailQueued: true,
      emailDelivered: false,
    });
  } catch {
    logger.error("application_store_failed");
    return jsonError("Unable to save the application right now", 503);
  }
}

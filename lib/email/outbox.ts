import { and, eq, lte, or, sql, isNull, lt } from "drizzle-orm";
import { openDatabase } from "@/lib/db";
import type { EmailOutboxRow } from "@/lib/db/schema";
import { sendMail, smtpConfigured } from "@/lib/email/transport";
import { logger } from "@/lib/logger";

const MAX_ATTEMPTS = Number(process.env.EMAIL_MAX_ATTEMPTS ?? 8);
const BATCH_SIZE = Number(process.env.EMAIL_BATCH_SIZE ?? 10);

function backoffMinutes(attempts: number) {
  return Math.min(60, 2 ** Math.max(0, attempts - 1));
}

function publicErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.toLowerCase().includes("smtp is not configured")) {
    return "smtp_not_configured";
  }
  return "delivery_failed";
}

export async function processOutboxBatch(workerId = "app") {
  if (!smtpConfigured()) {
    logger.warn("outbox_skipped_smtp_unconfigured");
    return { processed: 0, sent: 0, failed: 0, skipped: true as const };
  }

  const { db, emailOutbox } = await openDatabase();
  const due = await db
    .select()
    .from(emailOutbox)
    .where(
      and(
        or(
          eq(emailOutbox.status, "pending"),
          eq(emailOutbox.status, "failed"),
          and(
            eq(emailOutbox.status, "sending"),
            or(isNull(emailOutbox.lockedAt), lt(emailOutbox.lockedAt, new Date(Date.now() - 5 * 60_000))),
          ),
        ),
        lte(emailOutbox.scheduledAt, new Date()),
        sql`${emailOutbox.attempts} < ${MAX_ATTEMPTS}`,
      ),
    )
    .limit(BATCH_SIZE);

  let sent = 0;
  let failed = 0;

  for (const item of due) {
    const claimed = await claimMessage(item, workerId);
    if (!claimed) continue;
    try {
      await sendMail({
        to: claimed.toAddress,
        subject: claimed.subject,
        text: claimed.bodyText,
      });
      await db
        .update(emailOutbox)
        .set({
          status: "sent",
          sentAt: new Date(),
          lockedAt: null,
          lockedBy: null,
          lastError: null,
          updatedAt: new Date(),
        })
        .where(eq(emailOutbox.id, claimed.id));
      sent += 1;
      logger.info("email_sent", { kind: claimed.kind, applicationId: claimed.applicationId });
    } catch (error) {
      const attempts = claimed.attempts + 1;
      const next = new Date(Date.now() + backoffMinutes(attempts) * 60_000);
      await db
        .update(emailOutbox)
        .set({
          status: "failed",
          attempts,
          lastError: publicErrorMessage(error),
          scheduledAt: next,
          lockedAt: null,
          lockedBy: null,
          updatedAt: new Date(),
        })
        .where(eq(emailOutbox.id, claimed.id));
      failed += 1;
      logger.error("email_send_failed", {
        kind: claimed.kind,
        applicationId: claimed.applicationId,
        attempts,
      });
    }
  }

  return { processed: due.length, sent, failed, skipped: false as const };
}

async function claimMessage(item: EmailOutboxRow, workerId: string) {
  const { db, emailOutbox } = await openDatabase();
  if (item.status === "sent") {
    return null;
  }
  await db
    .update(emailOutbox)
    .set({
      status: "sending",
      attempts: item.attempts,
      lockedAt: new Date(),
      lockedBy: workerId,
      updatedAt: new Date(),
    })
    .where(and(eq(emailOutbox.id, item.id), eq(emailOutbox.status, item.status)));
  const [claimed] = await db.select().from(emailOutbox).where(eq(emailOutbox.id, item.id)).limit(1);
  if (!claimed || claimed.lockedBy !== workerId || claimed.status !== "sending") return null;
  return claimed;
}

export async function outboxBacklog() {
  const { db, emailOutbox } = await openDatabase();
  const rows = await db
    .select({
      status: emailOutbox.status,
      count: sql<number>`count(*)`,
    })
    .from(emailOutbox)
    .groupBy(emailOutbox.status);
  return rows.map((row) => ({ ...row, count: Number(row.count ?? 0) }));
}

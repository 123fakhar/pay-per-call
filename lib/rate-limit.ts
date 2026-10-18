import { and, eq, gt, sql } from "drizzle-orm";
import { openDatabase } from "@/lib/db";
import { hashWithSalt } from "@/lib/hash";

export function rateLimitExceeded(count: number, limit: number) {
  return count >= limit;
}

export async function enforceSubmissionRateLimit(ip: string) {
  const windowMs = Number(process.env.SUBMIT_RATE_WINDOW_MS ?? 15 * 60 * 1000);
  const limit = Number(process.env.SUBMIT_RATE_LIMIT ?? 5);
  const salt = process.env.RATE_LIMIT_SALT ?? "change-me";
  const keyHash = hashWithSalt(ip, salt);
  const { db, submissionRateEvents } = await openDatabase();
  const cutoff = new Date(Date.now() - windowMs);

  await db.insert(submissionRateEvents).values({ keyHash });
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(submissionRateEvents)
    .where(
      and(eq(submissionRateEvents.keyHash, keyHash), gt(submissionRateEvents.createdAt, cutoff)),
    );

  const count = Number(result[0]?.count ?? 0);
  return { limited: rateLimitExceeded(count, limit), count, limit, keyHash };
}

export function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip") ?? "unknown";
}

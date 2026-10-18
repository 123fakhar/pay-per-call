import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth/session";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { openDatabase } from "@/lib/db";
import { isSameOrigin, jsonError } from "@/lib/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  const { db, applications, emailOutbox } = await openDatabase();
  const [application] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  if (!application) return jsonError("Not found", 404);

  const emails = await db.select().from(emailOutbox).where(eq(emailOutbox.applicationId, id));

  return Response.json(
    {
      application: {
        ...application,
        submitterKeyHash: undefined,
      },
      emails: emails.map((item) => ({
        kind: item.kind,
        status: item.status,
        attempts: item.attempts,
        sentAt: item.sentAt,
        lastError: item.lastError,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  if (!isSameOrigin(request)) return jsonError("Invalid request origin", 403);

  const { id } = await context.params;
  let body: { status?: string; adminNotes?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (
    !body.status ||
    !APPLICATION_STATUSES.includes(body.status as (typeof APPLICATION_STATUSES)[number])
  ) {
    return jsonError("Invalid status", 400);
  }

  const { db, applications } = await openDatabase();
  await db
    .update(applications)
    .set({
      status: body.status as (typeof APPLICATION_STATUSES)[number],
      adminNotes: body.adminNotes ?? null,
      adminReviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(applications.id, id));
  const [updated] = await db
    .select({ id: applications.id, status: applications.status })
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);

  if (!updated) return jsonError("Not found", 404);
  return Response.json({ ok: true, application: updated });
}

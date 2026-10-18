import { and, desc, eq, sql } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth/session";
import { openDatabase } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { APPLICATION_STATUSES } from "@/lib/constants";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(10, Number(url.searchParams.get("pageSize") ?? 20)));
  const status = url.searchParams.get("status");
  const offset = (page - 1) * pageSize;

  const { db, applications } = await openDatabase();
  const filters = [];
  if (status && APPLICATION_STATUSES.includes(status as (typeof APPLICATION_STATUSES)[number])) {
    filters.push(eq(applications.status, status as (typeof APPLICATION_STATUSES)[number]));
  }
  const where = filters.length ? and(...filters) : undefined;

  const [rows, countRows] = await Promise.all([
    db
      .select({
        id: applications.id,
        firstName: applications.firstName,
        lastName: applications.lastName,
        email: applications.email,
        companyName: applications.companyName,
        campaigns: applications.campaigns,
        monthlyRevenueRange: applications.monthlyRevenueRange,
        status: applications.status,
        createdAt: applications.createdAt,
      })
      .from(applications)
      .where(where)
      .orderBy(desc(applications.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(where),
  ]);

  return Response.json(
    {
      items: rows,
      page,
      pageSize,
      total: Number(countRows[0]?.count ?? 0),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

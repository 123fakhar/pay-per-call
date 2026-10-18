import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { ApplicationsTable } from "@/components/admin/applications-table";

export const instant = false;

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await connection();
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const { page } = await searchParams;
  const currentPage = Number(page ?? 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-serif text-4xl">Applications</h1>
      <AdminApplicationsLoader page={currentPage} />
    </div>
  );
}

async function AdminApplicationsLoader({ page }: { page: number }) {
  const { openDatabase } = await import("@/lib/db");
  const { desc, sql } = await import("drizzle-orm");
  const { db, applications } = await openDatabase();
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  const [items, countRows] = await Promise.all([
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
      .orderBy(desc(applications.createdAt))
      .limit(pageSize)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(applications),
  ]);

  return (
    <div className="mt-8">
      <ApplicationsTable
        items={items.map((item) => ({
          ...item,
          campaigns: item.campaigns ?? [],
          createdAt: item.createdAt.toISOString(),
        }))}
        total={Number(countRows[0]?.count ?? 0)}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}

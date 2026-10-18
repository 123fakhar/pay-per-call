import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { openDatabase } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { StatusForm } from "@/components/admin/status-form";

export const instant = false;

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;
  const { db, applications, emailOutbox } = await openDatabase();
  const [application] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  if (!application) notFound();
  const emails = await db.select().from(emailOutbox).where(eq(emailOutbox.applicationId, id));

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-12">
      <h1 className="font-serif text-4xl">
        {application.firstName} {application.lastName}
      </h1>
      <Card>
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <Item label="Application ID" value={application.id} />
          <Item label="Status" value={application.status} />
          <Item label="Email" value={application.email} />
          <Item label="Phone" value={application.phone ?? "—"} />
          <Item label="Company" value={application.companyName} />
          <Item label="Website" value={application.websiteUrl} />
          <Item label="Campaigns" value={(application.campaigns ?? []).join(", ")} />
          <Item label="Revenue range" value={application.monthlyRevenueRange} />
          <Item label="Primary channel" value={application.primaryChannelDetails} />
          <Item label="Secondary channel" value={application.secondaryChannelDetails} />
          <Item
            label="Address"
            value={`${application.addressLine1}, ${application.city}, ${application.postalCode}, ${application.country}`}
          />
          <Item label="Terms" value={`${application.termsVersion} at ${application.termsAcceptedAt.toISOString()}`} />
        </dl>
      </Card>
      <Card>
        <h2 className="mb-3 font-serif text-2xl">Email delivery</h2>
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          {emails.map((email) => (
            <li key={email.id}>
              {email.kind}: {email.status}
              {email.sentAt ? ` · sent ${email.sentAt.toISOString()}` : ""}
              {email.lastError ? ` · ${email.lastError}` : ""}
            </li>
          ))}
        </ul>
      </Card>
      <StatusForm id={application.id} status={application.status} notes={application.adminNotes} />
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="mt-1 text-[var(--ivory)]">{value}</dd>
    </div>
  );
}

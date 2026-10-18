import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { COMPANY } from "@/lib/constants";

export const metadata: Metadata = { title: "Application received" };
export const instant = false;

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <Card>
        <p className="text-xs uppercase tracking-[0.28em] text-[#67efff]">Received</p>
        <h1 className="mt-3 font-serif text-4xl">Your application is on file</h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          This page confirms that the application was stored. It does not mean the application was
          approved. A confirmation email is queued to the address you submitted; queued is not the
          same as delivered.
        </p>
        {id ? (
          <p className="mt-6 text-sm">
            Application reference: <span className="text-[var(--gold)]">{id}</span>
          </p>
        ) : null}
        <p className="mt-6 text-sm text-[var(--muted)]">
          {COMPANY.name}
          <br />
          {COMPANY.addressLines.join(", ")}
        </p>
        <Link href="/" className="mt-8 inline-block text-[var(--gold)]">
          Return home
        </Link>
      </Card>
    </div>
  );
}

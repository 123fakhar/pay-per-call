import { Suspense } from "react";
import type { Metadata } from "next";
import { AffiliateForm } from "@/components/apply/affiliate-form";

export const metadata: Metadata = { title: "Affiliate Signup" };

export default function ApplyPage() {
  const gmailOnly = process.env.GMAIL_ONLY_REGISTRATION === "true";
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.32em] text-[#67efff]">Affiliates</p>
      <h1 className="mt-3 font-serif text-5xl leading-tight md:text-6xl">
        The application, <span className="text-aurora">in full color.</span>
      </h1>
      <p className="mt-4 mb-10 max-w-3xl text-lg leading-8 text-[#c9c6de]">
        Fill every required field. A successful save stores the application, emails the
        administrator, and sends a confirmation to the address you entered. That confirmation is a
        receipt, not an approval.
      </p>
      <Suspense fallback={<div className="text-[var(--muted)]">Loading form…</div>}>
        <AffiliateForm gmailOnly={gmailOnly} />
      </Suspense>
    </div>
  );
}

import type { Metadata } from "next";
import { COMPANY, TERMS_VERSION } from "@/lib/constants";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--gold)]">Draft for legal review</p>
      <h1 className="mt-3 font-serif text-5xl">Privacy Policy</h1>
      <Card className="mt-8 space-y-4 leading-7 text-[var(--muted)]">
        <p>Version {TERMS_VERSION}. Have counsel review this draft before public launch.</p>
        <p>
          {COMPANY.name} collects the information you submit on the affiliate application, including
          contact, company, traffic, and reference details, plus technical metadata such as a hashed
          network identifier used for abuse prevention.
        </p>
        <p>
          We use that information to review applications, operate the website, send receipt and
          administrator messages, and protect the service. We do not sell application contents as a
          marketing list through this website.
        </p>
        <p>
          Application records are stored in a private database. Access is limited to authenticated
          administrators and to systems that send queued email. Public pages do not expose applicant
          details.
        </p>
        <p>
          Questions about this draft policy may be directed in writing to {COMPANY.name},{" "}
          {COMPANY.addressLines.join(", ")}.
        </p>
      </Card>
    </div>
  );
}

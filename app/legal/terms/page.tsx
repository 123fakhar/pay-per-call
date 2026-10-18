import type { Metadata } from "next";
import { COMPANY, TERMS_VERSION } from "@/lib/constants";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Terms and Conditions" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.28em] text-[var(--gold)]">Draft for legal review</p>
      <h1 className="mt-3 font-serif text-5xl">Terms and Conditions</h1>
      <Card className="mt-8 space-y-4 leading-7 text-[var(--muted)]">
        <p>Version {TERMS_VERSION}. This draft is not a substitute for counsel-reviewed contracts.</p>
        <p>
          These terms govern use of the {COMPANY.name} website and affiliate application process.
          Submitting an application creates no partnership, employment, insurance license, or
          guaranteed campaign.
        </p>
        <p>
          {COMPANY.name} may accept, decline, or request more information without stating a reason.
          Call volume, payouts, and campaign availability depend on later written program terms, if
          any are offered.
        </p>
        <p>
          Applicants represent that the information they submit is accurate, that they will not use
          deceptive advertising, and that they will comply with applicable telemarketing, privacy,
          and advertising laws.
        </p>
        <p>
          {COMPANY.name} is a private company located at {COMPANY.addressLines.join(", ")}. It is not
          a government agency and is not endorsed by Medicare or any public program.
        </p>
      </Card>
    </div>
  );
}

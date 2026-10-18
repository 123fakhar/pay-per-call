import type { Metadata } from "next";
import { COMPANY } from "@/lib/constants";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-5xl">Disclaimer</h1>
      <Card className="mt-8 space-y-4 leading-7 text-[var(--muted)]">
        <p>
          {COMPANY.name} is not a government agency, is not endorsed by the United States government,
          and is not affiliated with Medicare, Medicaid, or any official benefits program.
        </p>
        <p>
          This website does not provide insurance quotes, legal advice, or medical advice. No
          license numbers, testimonials, customer counts, or revenue claims are presented because
          those facts have not been supplied for publication here.
        </p>
        <p>
          Pay-per-call and affiliate arrangements, if offered after review, are documented separately.
          Nothing on this site guarantees calls, approvals, or earnings.
        </p>
      </Card>
    </div>
  );
}

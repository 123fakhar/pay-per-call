import type { Metadata } from "next";
import Link from "next/link";
import { CampaignBoard } from "@/components/home/showcase";

export const metadata: Metadata = { title: "Campaigns" };

export default function CampaignsPage() {
  return (
    <div className="pt-10">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-xs uppercase tracking-[0.32em] text-[#67efff]">Campaigns</p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
          The verticals on the <span className="text-aurora">application.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#c9c6de]">
          Pick the categories that match the calls you can actually send. A listing here is not an
          open insertion order.
        </p>
        <Link
          href="/apply"
          className="mt-8 inline-flex rounded-full bg-[linear-gradient(115deg,#67efff,#8b6cff_55%,#ff4d9a)] px-6 py-3 text-sm font-semibold text-[#071018]"
        >
          Apply with these verticals
        </Link>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-24">
        <CampaignBoard />
      </div>
    </div>
  );
}

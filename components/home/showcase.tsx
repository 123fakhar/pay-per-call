"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CAMPAIGNS } from "@/lib/constants";
import { Reveal } from "@/components/motion/reveal";

const visuals: Record<
  (typeof CAMPAIGNS)[number]["id"],
  { accent: string; wash: string; note: string }
> = {
  medicare: {
    accent: "#67efff",
    wash: "from-cyan-300/25 via-sky-500/10",
    note: "Conversations with people asking about Medicare coverage. Assured is not Medicare and is not a government agency.",
  },
  "final-expense": {
    accent: "#c4b5fd",
    wash: "from-violet-300/30 via-fuchsia-500/10",
    note: "Final-expense insurance calls. Creative rules and buyer demand are confirmed only after a publisher is accepted.",
  },
  "auto-insurance": {
    accent: "#ffb020",
    wash: "from-amber-300/30 via-orange-500/10",
    note: "Auto insurance calls. Hours, states, and payout schedules live in later campaign terms, not in this introduction.",
  },
  "home-services": {
    accent: "#3dffb0",
    wash: "from-emerald-300/25 via-teal-400/10",
    note: "Home-services calls, including repair and improvement inquiries, when a buyer is actually taking that volume.",
  },
  legal: {
    accent: "#ff4d9a",
    wash: "from-rose-300/30 via-pink-500/10",
    note: "Legal-vertical calls. Nothing here is legal advice, and nothing here creates an attorney-client relationship.",
  },
};

const steps = [
  {
    title: "You map the traffic",
    copy: "Name the verticals, the channels, the networks you already work, and two references who will pick up.",
  },
  {
    title: "We keep the file",
    copy: "The application is stored first. An administrator notice and your confirmation are sent from the company mailbox.",
  },
  {
    title: "Review stays human",
    copy: "A saved application is a receipt, not an acceptance. Call volume and earnings stay off this page on purpose.",
  },
];

export function CampaignBoard() {
  const reduce = useReducedMotion();

  return (
    <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
      {CAMPAIGNS.map((campaign, index) => {
        const visual = visuals[campaign.id];
        return (
          <motion.article
            key={campaign.id}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={reduce ? undefined : { y: -8 }}
            className={`glass relative overflow-hidden rounded-3xl p-6 ${
              index < 2 ? "lg:col-span-3" : "lg:col-span-2"
            }`}
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${visual.wash} to-transparent`} />
            <div className="relative">
              <p className="font-serif text-sm" style={{ color: visual.accent }}>
                0{index + 1}
              </p>
              <h3 className="mt-4 font-serif text-3xl">{campaign.name}</h3>
              <p className="mt-3 text-sm leading-7 text-[#c9c6de]">{visual.note}</p>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

export function Showcase() {
  return (
    <>
      <div className="overflow-hidden border-y border-white/10 bg-white/[0.03]">
        <div className="flex w-max marquee-track">
          {[0, 1].map((copy) => (
            <p
              key={copy}
              className="flex gap-10 px-6 py-4 text-xs tracking-[0.32em] text-[#d7d3ea] uppercase"
            >
              {CAMPAIGNS.map((campaign) => (
                <span key={`${copy}-${campaign.id}`}>{campaign.name}</span>
              ))}
            </p>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-24">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.32em] text-[#67efff]">Verticals</p>
          <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight md:text-6xl">
            Five rooms. <span className="text-aurora">One application.</span>
          </h2>
        </Reveal>
        <CampaignBoard />
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:py-16">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.32em] text-[#ffb020]">How it moves</p>
          <h2 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">
            Submit once. The mailbox does the rest.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#c9c6de]">
            Your confirmation goes to the Gmail address on the form. The company copy arrives in
            the administrator inbox through the Hostinger mailbox.
          </p>
        </Reveal>
        <div className="grid gap-4">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <div className="glass rounded-3xl p-6">
                <p className="font-serif text-sm text-[#67efff]">0{index + 1}</p>
                <h3 className="mt-2 font-serif text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#c9c6de]">{step.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#090b18] px-6 py-14 md:px-12">
            <div className="pointer-events-none absolute -left-10 top-0 h-56 w-56 rounded-full bg-[#67efff]/20 blur-3xl" />
            <div className="pointer-events-none absolute right-0 bottom-0 h-56 w-56 rounded-full bg-[#ff4d9a]/20 blur-3xl" />
            <div className="relative max-w-2xl">
              <p className="text-xs uppercase tracking-[0.32em] text-[#ff4d9a]">Affiliate desk</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight md:text-6xl">
                Bring the traffic. Leave the guesswork in the form.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#c9c6de]">
                General contact, company, address, messaging, verticals, earnings, references,
                channels, and terms. Required fields stop the submit until they are real.
              </p>
              <Link
                href="/apply"
                className="mt-8 inline-flex rounded-full bg-[linear-gradient(115deg,#67efff,#8b6cff_55%,#ff4d9a)] px-6 py-3 text-sm font-semibold text-[#071018]"
              >
                Open the affiliate form
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

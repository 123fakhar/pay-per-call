"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { COMPANY } from "@/lib/constants";

const ThreeScene = dynamic(() => import("@/components/ui/three-scene"), { ssr: false });

const line = {
  hidden: { opacity: 0, y: 28, filter: "blur(10px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden md:min-h-[calc(100svh-5.5rem)]">
      <div className="relative h-[48vh] min-h-[300px] md:absolute md:inset-y-0 md:right-0 md:left-[50%] md:h-auto md:min-h-0 lg:left-[46%]">
        <ThreeScene />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#05060d] md:hidden" />
      </div>
      <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(5,6,13,0.94)_0%,rgba(5,6,13,0.78)_36%,rgba(5,6,13,0.2)_62%,transparent_100%)] md:block" />

      <div className="relative z-10 mx-auto flex max-w-6xl items-center px-4 pt-2 pb-12 md:min-h-[calc(100svh-5.5rem)] md:py-16">
        <motion.div
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="max-w-xl md:max-w-md lg:max-w-lg"
        >
          <motion.p variants={line} className="text-xs uppercase tracking-[0.34em] text-[#67efff]">
            Pay-per-call partnerships
          </motion.p>
          <motion.h1
            variants={line}
            className="mt-5 font-serif text-5xl leading-[0.95] font-semibold tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Calls with
            <span className="block text-aurora">a night-city glow.</span>
          </motion.h1>
          <motion.p variants={line} className="mt-6 max-w-xl text-lg leading-8 text-[#d7d3ea]">
            {COMPANY.name} reviews publishers for Medicare, Final Expense, Auto Insurance, Home
            Services, and Legal. Acceptance, call volume, and earnings are never guaranteed.
          </motion.p>
          <motion.div variants={line} className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/apply"
              className="rounded-full bg-[linear-gradient(115deg,#67efff,#8b6cff_55%,#ff4d9a)] px-6 py-3 text-sm font-semibold text-[#071018] shadow-[0_10px_40px_rgba(255,77,154,0.28)]"
            >
              Start the application
            </Link>
            <Link
              href="/campaigns"
              className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm text-white backdrop-blur-md"
            >
              Walk the five verticals
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

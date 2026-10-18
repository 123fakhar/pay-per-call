"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { COMPANY } from "@/lib/constants";

const links = [
  { href: "/campaigns", label: "Campaigns" },
  { href: "/apply", label: "Affiliate Signup" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-[#05060d] from-40% via-[#05060d]/80 to-transparent px-3 pt-3 pb-6 md:px-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-[#070814]/75 px-3 py-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl md:px-5">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(140deg,#67efff,#8b6cff_50%,#ff4d9a)] text-sm font-bold text-[#071018]">
            A
          </span>
          <span className="font-serif text-sm tracking-wide text-white md:text-base">
            <span className="md:hidden">{COMPANY.shortName}</span>
            <span className="hidden md:inline">{COMPANY.name}</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-[#c9c6de] md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
          <Link
            href="/apply"
            className="rounded-full bg-[linear-gradient(115deg,#67efff,#8b6cff_55%,#ff4d9a)] px-4 py-2 font-semibold text-[#071018]"
          >
            Apply
          </Link>
        </nav>
        <button
          className="grid h-10 w-10 place-items-center rounded-full border border-white/10 md:hidden"
          type="button"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-auto mt-2 flex max-w-6xl flex-col gap-3 rounded-3xl border border-white/10 bg-[#070814]/95 px-5 py-4 backdrop-blur-xl md:hidden"
          >
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/apply" onClick={() => setOpen(false)} className="text-[#67efff]">
              Apply
            </Link>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

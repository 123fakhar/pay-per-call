import Link from "next/link";
import { COMPANY } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl text-white">{COMPANY.name}</p>
          <p className="mt-3 text-sm leading-6 text-[#b9b6d4]">
            {COMPANY.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
        <div className="text-sm text-[#b9b6d4]">
          <p className="mb-3 text-xs tracking-[0.22em] text-[#67efff] uppercase">Legal</p>
          <div className="flex flex-col gap-2">
            <Link href="/legal/terms">Terms and Conditions</Link>
            <Link href="/legal/privacy">Privacy Policy</Link>
            <Link href="/legal/disclaimer">Disclaimer</Link>
          </div>
        </div>
        <p className="text-sm leading-6 text-[#b9b6d4]">
          Assured Insurance Services is a private company. It is not a government agency, is not
          endorsed by Medicare or any public program, and this website does not promise call volume
          or earnings.
        </p>
      </div>
    </footer>
  );
}

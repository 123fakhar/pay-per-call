import type { Metadata } from "next";
import { Sora, Syne } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AppToaster } from "@/components/providers/toaster";
import { COMPANY } from "@/lib/constants";
import "./globals.css";
import { Background } from "@/components/ui/background";
const serif = Syne({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const sans = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: COMPANY.name,
    template: `%s — ${COMPANY.name}`,
  },
  description:
    "Affiliate pay-per-call application for Assured Insurance Services. Medicare, Final Expense, Auto Insurance, Home Services, and Legal. Review is not a guarantee of calls, revenue, or approval.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[var(--ink)] text-[var(--ivory)] relative">
          <Background />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <AppToaster />
      </body>
    </html>
  );
}

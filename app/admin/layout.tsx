import Link from "next/link";
import { connection } from "next/server";
import { LogoutButton } from "@/components/admin/logout-button";
import { getAdminSession } from "@/lib/auth/session";

export const instant = false;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await getAdminSession();
  return (
    <div>
      {session ? (
        <div className="border-b border-[var(--line)] bg-[var(--charcoal)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm">
            <Link href="/admin/applications">Application desk</Link>
            <LogoutButton />
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}

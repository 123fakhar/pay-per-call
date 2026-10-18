export const ADMIN_COOKIE = "assured_admin";

export function hasAdminCookie(cookieHeader: string | null) {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => part.trim().startsWith(`${ADMIN_COOKIE}=`));
}

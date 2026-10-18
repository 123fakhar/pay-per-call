import { createAdminSession, verifyAdminCredentials } from "@/lib/auth/session";
import { isSameOrigin, jsonError } from "@/lib/http";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Invalid request origin", 403);
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  if (!verifyAdminCredentials(body.email ?? "", body.password ?? "")) {
    logger.warn("admin_login_failed");
    return jsonError("Invalid credentials", 401);
  }

  await createAdminSession((body.email ?? "").trim().toLowerCase());
  logger.info("admin_login_success");
  return Response.json({ ok: true });
}

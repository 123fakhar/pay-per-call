import { clearAdminSession } from "@/lib/auth/session";
import { isSameOrigin, jsonError } from "@/lib/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Invalid request origin", 403);
  }
  await clearAdminSession();
  return Response.json({ ok: true });
}

export async function GET() {
  return Response.json({
    version: process.env.APP_VERSION ?? "dev",
    gitSha: process.env.GIT_SHA ?? "unknown",
  });
}

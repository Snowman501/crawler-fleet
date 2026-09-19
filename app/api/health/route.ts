export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    status: "ok",
    service: "crawler-fleet",
    version: "0.3.0",
    checked_at: new Date().toISOString(),
    checks: {
      app: "live",
      api: "ready",
      scanner: "ready",
      dashboard: "ready",
    },
  });
}

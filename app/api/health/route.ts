export const runtime = "nodejs";

const paymentEnvKeys = [
  "NEXT_PUBLIC_PAYMENT_QUICK_FIX_REVIEW",
  "NEXT_PUBLIC_PAYMENT_WEBSITE_ACTION_PLAN",
  "NEXT_PUBLIC_PAYMENT_HOMEPAGE_CLEANUP",
  "NEXT_PUBLIC_PAYMENT_LEAD_PATH_SETUP",
  "NEXT_PUBLIC_PAYMENT_LAUNCH_CHECK",
];

export async function GET() {
  return Response.json({
    status: "ok",
    service: "crawler-fleet",
    version: "0.6.0",
    checked_at: new Date().toISOString(),
    checks: {
      app: "live",
      api: "ready",
      scanner: "ready",
      dashboard: "ready",
      deep_recon: "ready",
      lead_inbox: process.env.GITHUB_LEAD_TOKEN ? "github-ready" : "fallback-ready",
      payment_links: paymentEnvKeys.some((key) => Boolean(process.env[key])) ? "configured" : "not-configured",
    },
  });
}

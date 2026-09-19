export const runtime = "nodejs";

const paymentEnvKeys = [
  "NEXT_PUBLIC_PAYMENT_QUICK_FIX_REVIEW",
  "NEXT_PUBLIC_PAYMENT_WEBSITE_ACTION_PLAN",
  "NEXT_PUBLIC_PAYMENT_HOMEPAGE_CLEANUP",
  "NEXT_PUBLIC_PAYMENT_LEAD_PATH_SETUP",
  "NEXT_PUBLIC_PAYMENT_LAUNCH_CHECK",
];

export async function GET() {
  const paymentsConfigured = paymentEnvKeys.some((key) => Boolean(process.env[key]));
  const leadInboxConfigured = Boolean(process.env.GITHUB_LEAD_TOKEN);
  const readySystems = [
    true,
    true,
    true,
    true,
    true,
    leadInboxConfigured,
    paymentsConfigured,
    false,
  ].filter(Boolean).length;

  return Response.json({
    status: "ok",
    brand: "SL NextGen Web Intel",
    service: "crawler-fleet",
    engine: "Crawler Fleet",
    version: "0.7.0",
    environment: process.env.VERCEL_ENV ?? "development",
    checked_at: new Date().toISOString(),
    deployment: {
      provider: "vercel",
      url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "local",
      git_commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown",
      git_branch: process.env.VERCEL_GIT_COMMIT_REF ?? "unknown",
      region: process.env.VERCEL_REGION ?? "unknown",
    },
    readiness: {
      score: `${readySystems}/8`,
      launch_ready: !paymentsConfigured,
      note: paymentsConfigured
        ? "Core systems and payment links are configured."
        : "Core systems are live; payment links are the main missing revenue connection.",
    },
    checks: {
      app: "live",
      api: "ready",
      scanner: "ready",
      dashboard: "ready",
      deep_recon: "ready",
      trust_center: "ready",
      lead_inbox: leadInboxConfigured ? "github-ready" : "fallback-ready",
      payment_links: paymentsConfigured ? "configured" : "not-configured",
      ai_action_plans: "planned",
    },
    routes: {
      scanner: "/",
      dashboard: "/dashboard",
      status: "/status",
      health: "/api/health",
      leads: "/api/leads",
      trust_center: "/trust-center",
      pricing: "/pricing",
      privacy: "/privacy",
      terms: "/terms",
    },
    scan_policy: {
      scope: "one public HTML page plus same-origin robots.txt and sitemap.xml",
      private_networks: "blocked",
      custom_ports: "blocked",
      credentials_in_url: "blocked",
      protected_pages: "not scanned",
      secrets: "do not submit passwords, payment cards, private dashboards, or sensitive personal data",
    },
    installs: {
      web: "ready",
      pwa_manifest: "ready",
      phone: "installable from browser with Add to Home Screen",
      linux: "planned CLI wrapper",
      windows: "planned desktop wrapper",
      galaxy_store: "planned Android wrapper after web launch",
    },
    next_actions: [
      "Add payment links",
      "Add admin-only dashboard access",
      "Add AI-generated action plans",
      "Move scan history into a shared database",
      "Add downloadable branded PDF reports",
    ],
    support: {
      contact: "/contact",
      no_phone_first: true,
    },
  });
}

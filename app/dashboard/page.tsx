import ScanHistoryPanel from "../components/ScanHistoryPanel";

const statusCards = [
  { label: "Public app", value: "Live", detail: "questforgeai.vercel.app", tone: "good" },
  { label: "Check API", value: "Ready", detail: "/api/check accepts one URL per run", tone: "good" },
  { label: "Healthcheck", value: "Online", detail: "/api/health reports app status", tone: "good" },
  { label: "Scan history", value: "Local", detail: "Recent checks are saved in this browser", tone: "good" },
  { label: "Deep recon", value: "Active", detail: "Headings, images, links, social, robots, sitemap", tone: "good" },
  { label: "Lead inbox", value: "Ready", detail: "Saves to GitHub Issues when env vars are connected", tone: "good" },
  { label: "Payment links", value: "Ready", detail: "Checkout buttons activate when links are added", tone: "good" },
  { label: "Fleet teams", value: "4", detail: "Technical, content, trust, conversion", tone: "good" },
  { label: "Revenue path", value: "Started", detail: "Report sharing, lead requests, pricing pages", tone: "good" },
];

const quickActions = [
  {
    title: "Run a check",
    description: "Open the public scanner and inspect one website page.",
    href: "/",
    action: "Open scanner",
  },
  {
    title: "Production site",
    description: "View the live Vercel deployment customers can access.",
    href: "https://questforgeai.vercel.app/",
    action: "Open live site",
  },
  {
    title: "Healthcheck",
    description: "Read the live app status response used for quick monitoring.",
    href: "/api/health",
    action: "Open health",
  },
  {
    title: "Status page",
    description: "View live system cards, readiness, and install paths.",
    href: "/status",
    action: "Open status",
  },
  {
    title: "GitHub repo",
    description: "Review the code, commits, and future fleet upgrades.",
    href: "https://github.com/Snowman501/crawler-fleet",
    action: "Open GitHub",
  },
];

const monitorItems = [
  "Latest production deployment should build from main.",
  "Healthcheck should return status ok.",
  "Checker scope stays limited to one public HTML page plus same-origin robots and sitemap files.",
  "Deep recon checks should return evidence counts instead of guesses.",
  "Recent scans are saved in browser storage until database storage is added.",
  "Lead requests save to GitHub Issues when GITHUB_LEAD_TOKEN is configured.",
  "Lead form falls back to email if the lead inbox is not connected yet.",
  "Payment buttons appear when payment link environment variables are configured.",
  "Ollama/AI recommendations are planned, not active.",
];

const roadmap = [
  "Move browser scan history into a shared database.",
  "Add admin-only dashboard access.",
  "Add AI-generated action plans from the detected evidence.",
  "Connect live payment links for full reports and fix plans.",
  "Add phone-friendly uptime and lead alerts.",
  "Add scheduled rechecks for saved sites.",
  "Add downloadable branded PDF reports.",
];

export default function Dashboard() {
  return (
    <main className="shell dashboard-shell">
      <section className="dashboard-hero">
        <div className="topbar">
          <p className="eyebrow">Control Room</p>
          <a className="nav-link" href="/">
            Scanner
          </a>
        </div>
        <div>
          <h1>Fleet dashboard for launch control and monitoring.</h1>
          <p className="intro">
            Website recon for businesses that need answers fast. Evidence-first scans built for action, follow-up, and
            a clean path to paid help.
          </p>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="Fleet status">
        {statusCards.map((card) => (
          <article className="control-card" key={card.label}>
            <p className="card-label">{card.label}</p>
            <div className="card-row">
              <strong>{card.value}</strong>
              <span className={`dot ${card.tone}`} />
            </div>
            <p>{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-columns">
        <div className="panel">
          <div className="section-head">
            <p className="eyebrow">Quick Actions</p>
            <h2>Operate the fleet</h2>
          </div>
          <div className="action-list">
            {quickActions.map((item) => (
              <a className="action-card" href={item.href} key={item.title}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <span>{item.action}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-head">
            <p className="eyebrow">Monitoring</p>
            <h2>Current watchlist</h2>
          </div>
          <ul className="check-list">
            {monitorItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <ScanHistoryPanel />

      <section className="panel">
        <div className="section-head">
          <p className="eyebrow">Roadmap</p>
          <h2>Next control upgrades</h2>
        </div>
        <div className="roadmap-grid">
          {roadmap.map((item, index) => (
            <article className="roadmap-card" key={item}>
              <span>{index + 1}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

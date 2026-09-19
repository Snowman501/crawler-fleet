const statusCards = [
  { label: "Public app", value: "Live", detail: "questforgeai.vercel.app", tone: "good" },
  { label: "Check API", value: "Ready", detail: "/api/check accepts one URL per run", tone: "good" },
  { label: "Healthcheck", value: "Online", detail: "/api/health reports app status", tone: "good" },
  { label: "Fleet teams", value: "4", detail: "Technical, content, trust, conversion", tone: "good" },
  { label: "Revenue path", value: "Started", detail: "Report sharing and lead request form", tone: "good" },
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
    title: "GitHub repo",
    description: "Review the code, commits, and future fleet upgrades.",
    href: "https://github.com/Snowman501/crawler-fleet",
    action: "Open GitHub",
  },
];

const monitorItems = [
  "Latest production deployment should build from main.",
  "Healthcheck should return status ok.",
  "Checker scope stays limited to one public HTML page.",
  "Lead requests open as email drafts until database storage is added.",
  "Payments are not connected yet.",
  "Ollama/AI recommendations are planned, not active.",
];

const roadmap = [
  "Save scan history in a database.",
  "Add admin-only dashboard access.",
  "Add deeper crawler checks for headings, links, images, robots, and sitemap.",
  "Use Ollama locally or a hosted model to draft plain-English recommendations from evidence.",
  "Add payment links for full reports and fix plans.",
  "Add phone-friendly uptime and lead alerts.",
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
            Website recon for businesses that need answers fast. Evidence-first scans built for action.
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

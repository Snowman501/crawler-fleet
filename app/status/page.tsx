const systems = [
  { label: "Scanner", value: "Online", detail: "Public website checks are live.", tone: "good" },
  { label: "Lead Inbox", value: "Ready", detail: "Requests save to GitHub Issues when configured, with email fallback.", tone: "good" },
  { label: "Payments", value: "Not Connected", detail: "Checkout buttons activate after payment links are added.", tone: "warn" },
  { label: "Deep Recon", value: "Active", detail: "Checks headings, images, links, social tags, robots, and sitemap.", tone: "good" },
  { label: "Last Deployment", value: "Live", detail: "Production deploy is aliased to questforgeai.vercel.app.", tone: "good" },
  { label: "Health API", value: "OK", detail: "/api/health returns machine-readable system status.", tone: "good" },
  { label: "Trust Center", value: "Live", detail: "Security posture, scan limits, and verification links are public.", tone: "good" },
];

const installPaths = [
  {
    title: "Web App",
    status: "Live now",
    detail: "Use SL NextGen Web Intel directly in the browser from any device. No download required.",
    action: "Open scanner",
    href: "/",
  },
  {
    title: "Cell Phone",
    status: "Installable web app",
    detail: "Open this site in Samsung Internet, Chrome, or Safari, then choose Add to Home screen for app-like access.",
    action: "Install guide",
    href: "/",
  },
  {
    title: "Linux",
    status: "Planned",
    detail: "A lightweight CLI wrapper can run checks from terminal and save reports locally.",
    action: "Use web version",
    href: "/",
  },
  {
    title: "Windows",
    status: "Planned",
    detail: "A desktop wrapper can come later after the web workflow and payments are stable.",
    action: "Use web version",
    href: "/",
  },
];

const nextActions = [
  "Connect payment links for paid reviews and fix plans.",
  "Add admin-only access before storing private customer history.",
  "Add AI-generated action plans from detected evidence.",
  "Add branded PDF report downloads.",
  "Package Android, Windows, and Linux apps after the web app starts getting real usage.",
];

export default function StatusPage() {
  return (
    <main className="shell status-shell">
      <section className="dashboard-hero">
        <div className="topbar">
          <p className="eyebrow">SL NextGen Web Intel Status</p>
          <a className="nav-link" href="/">
            Scanner
          </a>
        </div>
        <div>
          <h1>Live system status for the website intelligence engine.</h1>
          <p className="intro">
            Crawler Fleet powers the scan engine under SL NextGen Web Intel. This page shows what is online, what is ready,
            and how businesses can use the scanner from web, phone, Windows, and Linux.
          </p>
        </div>
      </section>

      <section className="status-banner">
        <div>
          <p className="eyebrow">Current Readiness</p>
          <h2>Core system online. Payments are the main missing connection.</h2>
          <p>
            The public scanner, dashboard, deep recon checks, lead request path, trust pages, and health API are active.
          </p>
        </div>
        <div className="promo-actions">
          <a className="button-link" href="/api/health">
            View JSON health
          </a>
          <a className="nav-link" href="/trust-center">
            Trust Center
          </a>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="System status">
        {systems.map((system) => (
          <article className="control-card" key={system.label}>
            <p className="card-label">{system.label}</p>
            <div className="card-row">
              <strong>{system.value}</strong>
              <span className={`dot ${system.tone}`} />
            </div>
            <p>{system.detail}</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-head">
          <p className="eyebrow">Use Anywhere</p>
          <h2>Download and install path</h2>
          <p className="section-copy">
            The web app is the main product today. Phone installation works through the browser. Store downloads come
            after payments, admin access, and customer flow are stable.
          </p>
        </div>
        <div className="install-grid">
          {installPaths.map((item) => (
            <article className="install-card" key={item.title}>
              <div>
                <p className="card-label">{item.status}</p>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
              <a className="nav-link" href={item.href}>
                {item.action}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="install-help">
        <div>
          <p className="eyebrow">Install App</p>
          <h2>Add SL NextGen Web Intel to a phone.</h2>
          <p>
            On Samsung Internet or Chrome, open the site menu and choose <strong>Add page to</strong> or{" "}
            <strong>Add to Home screen</strong>. On iPhone Safari, use Share, then <strong>Add to Home Screen</strong>.
          </p>
        </div>
        <a className="button-link" href="/">
          Open installable app
        </a>
      </section>

      <section className="panel">
        <div className="section-head">
          <p className="eyebrow">Launch Queue</p>
          <h2>Next systems to connect</h2>
        </div>
        <ul className="check-list">
          {nextActions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

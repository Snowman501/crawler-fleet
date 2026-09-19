import type { Metadata } from "next";

const siteUrl = "https://questforgeai.vercel.app";
const encodedSiteUrl = encodeURIComponent(siteUrl);

const trustSignals = [
  {
    title: "HTTPS only",
    detail: "The public app runs over HTTPS through Vercel so traffic uses a secure browser connection.",
  },
  {
    title: "Public-page scanning",
    detail: "The scanner checks one public URL plus same-origin robots.txt and sitemap.xml. It does not log in.",
  },
  {
    title: "Private network blocks",
    detail: "The checker rejects localhost, private networks, credentials in URLs, and custom ports.",
  },
  {
    title: "Transparent status",
    detail: "The live status page and JSON health endpoint show what is online and what is still being connected.",
  },
  {
    title: "No fake security seal",
    detail: "SL NextGen Web Intel does not claim Norton, McAfee, or other vendor certification unless actually connected.",
  },
  {
    title: "Plain-language policies",
    detail: "Privacy, terms, contact, and trust pages explain the service before a customer requests paid help.",
  },
];

const verificationLinks = [
  {
    title: "Live status page",
    detail: "Human-readable system status for scanner, health API, payments, and install paths.",
    href: "/status",
  },
  {
    title: "Health API",
    detail: "Machine-readable status for app, scanner, dashboard, lead inbox, payment links, and install readiness.",
    href: "/api/health",
  },
  {
    title: "Google Safe Browsing",
    detail: "Open Google's public transparency report and check the live domain.",
    href: `https://transparencyreport.google.com/safe-browsing/search?url=${encodedSiteUrl}`,
  },
  {
    title: "SSL Labs",
    detail: "Run an independent HTTPS/TLS configuration check for the live domain.",
    href: `https://www.ssllabs.com/ssltest/analyze.html?d=${encodeURIComponent("questforgeai.vercel.app")}`,
  },
  {
    title: "Security Headers",
    detail: "Check browser security headers such as X-Frame-Options and Referrer-Policy.",
    href: `https://securityheaders.com/?q=${encodedSiteUrl}&followRedirects=on`,
  },
  {
    title: "VirusTotal URL scan",
    detail: "Use VirusTotal to inspect the public URL with multiple security vendors.",
    href: "https://www.virustotal.com/gui/home/url",
  },
];

export const metadata: Metadata = {
  title: "Trust Center | SL NextGen Web Intel",
  description:
    "Security, privacy, scan-scope, and verification information for SL NextGen Web Intel, powered by Crawler Fleet.",
};

export default function TrustCenterPage() {
  return (
    <main className="shell trust-center-shell">
      <section className="dashboard-hero">
        <div className="topbar">
          <p className="eyebrow">Trust Center</p>
          <a className="nav-link" href="/">
            Scanner
          </a>
        </div>
        <div>
          <h1>Real trust signals. No borrowed badges.</h1>
          <p className="intro">
            SL NextGen Web Intel is built for public website checks. The scanner should never receive passwords,
            protected dashboard URLs, private admin pages, payment card numbers, or sensitive personal information.
          </p>
        </div>
      </section>

      <section className="status-banner">
        <div>
          <p className="eyebrow">Safety Position</p>
          <h2>Public-page only, evidence-first, transparent by design.</h2>
          <p>
            The app gives practical website intelligence from visible public pages. Paid trust seals can be added later
            only if a real provider account is active.
          </p>
        </div>
        <a className="button-link" href="/api/health">
          View health API
        </a>
      </section>

      <section className="marketing-grid" aria-label="Trust signals">
        {trustSignals.map((item) => (
          <article className="marketing-card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-head">
          <p className="eyebrow">Verify</p>
          <h2>Independent checks and live status.</h2>
          <p className="section-copy">
            These links do not imply endorsement. They give visitors a practical way to inspect the live site instead of
            relying on a decorative badge.
          </p>
        </div>
        <div className="action-list">
          {verificationLinks.map((link) => (
            <a className="action-card" href={link.href} key={link.title}>
              <div>
                <h3>{link.title}</h3>
                <p>{link.detail}</p>
              </div>
              <span>Open</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

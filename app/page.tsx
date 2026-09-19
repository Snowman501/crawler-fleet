"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { saveScanHistoryItem, summarizeReportForHistory } from "./lib/scan-history";
import { marketingPages } from "./marketing-pages";
import { getPaymentLink, serviceOffers } from "./service-offers";

type Finding = {
  team: string;
  check: string;
  detected: boolean;
  evidence: string;
  why_it_matters: string;
};

type Report = {
  url: string;
  checked_at: string;
  scope: string;
  title: string;
  description: string;
  team_summary: Record<string, { passed: number; total: number; missing: string[] }>;
  findings: Finding[];
};

type LeadForm = {
  name: string;
  email: string;
  website: string;
  message: string;
  company: string;
};

const teamLabels: Record<string, string> = {
  technical: "Technical",
  content: "Content",
  trust: "Trust",
  conversion: "Conversion",
};

function formatReport(report: Report) {
  const teamLines = Object.entries(report.team_summary).map(([team, summary]) => {
    const missing = summary.missing.length ? summary.missing.join(", ") : "none";
    return `- ${teamLabels[team] ?? team}: ${summary.passed}/${summary.total} detected; missing: ${missing}`;
  });
  const findingLines = report.findings.map((finding) => {
    const status = finding.detected ? "Detected" : "Not detected";
    return [
      `- [${teamLabels[finding.team] ?? finding.team}] ${finding.check}: ${status}`,
      `  Evidence checked: ${finding.evidence}`,
      `  Why it matters: ${finding.why_it_matters}`,
    ].join("\n");
  });

  return [
    "Crawler Fleet Website Checkup",
    `URL: ${report.url}`,
    `Checked: ${new Date(report.checked_at).toLocaleString()}`,
    `Title: ${report.title || "Untitled page"}`,
    "",
    report.scope,
    "",
    "Team summary:",
    ...teamLines,
    "",
    "Findings:",
    ...findingLines,
  ].join("\n");
}

export default function Home() {
  const defaultMessage = "I would like help understanding and improving this website checkup.";
  const [url, setUrl] = useState("https://example.com");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadForm>({
    name: "",
    email: "",
    website: "",
    message: defaultMessage,
    company: "",
  });
  const visibleMarketingPages = useMemo(
    () =>
      marketingPages.filter((page) =>
        [
          "free-website-checker",
          "small-business-website-audit",
          "contractor-website-checker",
          "author-website-checker",
          "restaurant-website-checker",
          "local-business-website-checker",
        ].includes(page.slug),
      ),
    [],
  );

  useEffect(() => {
    const service = new URLSearchParams(window.location.search).get("service");
    const offer = serviceOffers.find((item) => item.name === service);
    if (offer) {
      setLeadForm((current) => ({ ...current, message: offer.request }));
    }
  }, []);

  async function runCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setReport(null);

    try {
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "The check failed.");
      }
      setReport(payload);
      saveScanHistoryItem(summarizeReportForHistory(payload));
      setLeadForm((current) => ({ ...current, website: payload.url }));
      setCopyStatus("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The check failed.");
    } finally {
      setLoading(false);
    }
  }

  async function copyReport() {
    if (!report) {
      return;
    }
    await navigator.clipboard.writeText(formatReport(report));
    setCopyStatus("Report copied.");
  }

  function downloadReport() {
    if (!report) {
      return;
    }
    const blob = new Blob([formatReport(report)], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "crawler-fleet-report.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function openLeadEmail() {
    const subject = `Website checkup help: ${leadForm.website || report?.url || "new request"}`;
    const body = [
      `Name: ${leadForm.name}`,
      `Email: ${leadForm.email}`,
      `Website: ${leadForm.website}`,
      "",
      "Requested help:",
      leadForm.message,
      "",
      report ? formatReport(report) : "No report was attached.",
    ].join("\n");
    window.location.href = `mailto:barnhartloren33@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  async function submitLeadRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLeadLoading(true);
    setLeadStatus("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadForm,
          report: report ? formatReport(report) : "",
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "The lead request failed.");
      }
      setLeadStatus(
        payload.stored
          ? "Request saved. I will review the report and follow up by email."
          : "Request captured. Opening your email app as a backup until the lead inbox is connected.",
      );
      if (!payload.stored) {
        openLeadEmail();
      }
    } catch (caught) {
      setLeadStatus(caught instanceof Error ? caught.message : "The lead request failed.");
    } finally {
      setLeadLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="topbar">
          <p className="eyebrow">Crawler Fleet</p>
          <a className="nav-link" href="/dashboard">
            Dashboard
          </a>
        </div>
        <h1>Rough checks. Clean evidence. No guesswork.</h1>
        <p className="intro">
          Find what is costing your website leads. Run a free website checkup across SEO basics, headings, links,
          images, trust signals, conversion paths, robots, and sitemap health.
        </p>
        <form className="check-form" onSubmit={runCheck}>
          <label htmlFor="url">Website URL</label>
          <div className="field-row">
            <input
              id="url"
              name="url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Checking..." : "Run check"}
            </button>
          </div>
        </form>
      </section>

      {error ? <p className="error">{error}</p> : null}

      <section className="promo-panel">
        <div>
          <p className="eyebrow">Launch Promo</p>
          <h2>Not sure what your report means?</h2>
          <p>
            Run the free check first. If the report shows missing trust, search, or lead-capture basics, request a
            launch review and get the highest-impact fixes listed in plain English.
          </p>
        </div>
        <div className="promo-actions">
          <a className="button-link" href="/launch-promo">
            View launch promo
          </a>
          <a className="nav-link" href="/what-to-do-next">
            What to do next
          </a>
        </div>
      </section>

      <section className="service-strip" aria-label="Free website tools">
        <div className="section-head">
          <p className="eyebrow">Free Services</p>
          <h2>More doors into the scanner.</h2>
        </div>
        <div className="service-grid">
          {visibleMarketingPages.map((page) => (
            <a className="service-link" href={`/${page.slug}`} key={page.slug}>
              <strong>{page.title}</strong>
              <span>{page.description}</span>
            </a>
          ))}
        </div>
      </section>

      {report ? (
        <section className="report" aria-live="polite">
          <div className="report-head">
            <div>
              <p className="eyebrow">Report</p>
              <h2>{report.title || "Untitled page"}</h2>
              <p>{report.url}</p>
            </div>
            <time>{new Date(report.checked_at).toLocaleString()}</time>
          </div>

          <p className="scope">{report.scope}</p>

          <div className="report-actions">
            <button type="button" onClick={copyReport}>
              Copy report
            </button>
            <button className="secondary-button" type="button" onClick={downloadReport}>
              Download report
            </button>
            {copyStatus ? <span>{copyStatus}</span> : null}
          </div>

          <section className="offer-panel">
            <div className="section-head">
              <p className="eyebrow">Fix This For Me</p>
              <h2>Choose a next step.</h2>
            </div>
            <div className="offer-grid">
              {serviceOffers.slice(0, 4).map((offer) => (
                <article className="offer-card" key={offer.id}>
                  <div>
                    <p className="offer-price">{offer.price}</p>
                    <h3>{offer.name}</h3>
                    <p>{offer.promise}</p>
                  </div>
                  {getPaymentLink(offer.id) ? (
                    <a className="button-link" href={getPaymentLink(offer.id)}>
                      Pay and request
                    </a>
                  ) : (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() =>
                        setLeadForm((current) => ({
                          ...current,
                          website: report.url,
                          message: offer.request,
                        }))
                      }
                    >
                      Pick this
                    </button>
                  )}
                </article>
              ))}
            </div>
            <p className="panel-copy">
              Payment buttons appear here automatically after payment links are added in Vercel.
            </p>
          </section>

          <section className="next-step-panel">
            <div className="section-head">
              <p className="eyebrow">Not Sure?</p>
              <h2>Fix in this order.</h2>
            </div>
            <div className="step-grid">
              <article>
                <span>1</span>
                <h3>Trust</h3>
                <p>Fix contact, about, privacy, email, phone, and policy paths before buying traffic.</p>
              </article>
              <article>
                <span>2</span>
                <h3>Search</h3>
                <p>Then handle titles, descriptions, headings, social tags, robots.txt, and sitemap.xml.</p>
              </article>
              <article>
                <span>3</span>
                <h3>Leads</h3>
                <p>Then make the next step obvious with a form, phone link, email link, or clear CTA.</p>
              </article>
            </div>
            <a className="nav-link" href="/what-to-do-next">
              Read the simple guide
            </a>
          </section>

          <div className="summary-grid">
            {Object.entries(report.team_summary).map(([team, summary]) => (
              <article className="summary-card" key={team}>
                <h3>{teamLabels[team] ?? team}</h3>
                <p className="score">
                  {summary.passed}/{summary.total}
                </p>
                <p>{summary.missing.length ? `Missing: ${summary.missing.join(", ")}` : "No missing checks detected."}</p>
              </article>
            ))}
          </div>

          <div className="findings">
            {report.findings.map((finding) => (
              <article className="finding" key={`${finding.team}-${finding.check}`}>
                <div>
                  <span className={finding.detected ? "status good" : "status warn"}>
                    {finding.detected ? "Detected" : "Not detected"}
                  </span>
                  <h3>{finding.check}</h3>
                </div>
                <p>{finding.why_it_matters}</p>
                <p className="evidence">Evidence checked: {finding.evidence}</p>
              </article>
            ))}
          </div>

          <section className="lead-panel">
            <div>
              <p className="eyebrow">Need Help?</p>
              <h2>Turn this checkup into a fix plan.</h2>
              <p>
                Send the report with your contact details and what you want help with. Requests can save to a private
                GitHub lead inbox once it is connected.
              </p>
            </div>
            <form className="lead-form" onSubmit={submitLeadRequest}>
              <label className="hidden-field" aria-hidden="true">
                Company
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={leadForm.company}
                  onChange={(event) => setLeadForm({ ...leadForm, company: event.target.value })}
                />
              </label>
              <div className="form-grid">
                <label>
                  Name
                  <input
                    value={leadForm.name}
                    onChange={(event) => setLeadForm({ ...leadForm, name: event.target.value })}
                    placeholder="Your name"
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(event) => setLeadForm({ ...leadForm, email: event.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </label>
              </div>
              <label>
                Website
                <input
                  type="url"
                  value={leadForm.website}
                  onChange={(event) => setLeadForm({ ...leadForm, website: event.target.value })}
                  placeholder="https://example.com"
                  required
                />
              </label>
              <label>
                What do you want help with?
                <textarea
                  value={leadForm.message}
                  onChange={(event) => setLeadForm({ ...leadForm, message: event.target.value })}
                  rows={4}
                  required
                />
              </label>
              <button type="submit" disabled={leadLoading}>
                {leadLoading ? "Sending..." : "Request fix plan"}
              </button>
              {leadStatus ? <p className="lead-status">{leadStatus}</p> : null}
            </form>
          </section>
        </section>
      ) : null}
    </main>
  );
}

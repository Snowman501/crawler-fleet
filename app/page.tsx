"use client";

import { FormEvent, useState } from "react";

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
  const [url, setUrl] = useState("https://example.com");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [leadForm, setLeadForm] = useState<LeadForm>({
    name: "",
    email: "",
    website: "",
    message: "I would like help understanding and improving this website checkup.",
  });

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

  function openLeadEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  return (
    <main className="shell">
      <section className="hero">
        <div className="topbar">
          <p className="eyebrow">Crawler Fleet</p>
          <a className="nav-link" href="/dashboard">
            Dashboard
          </a>
        </div>
        <h1>Website checkups from a small, evidence-first agent team.</h1>
        <p className="intro">
          Run a safe one-page scan for technical, content, trust, and conversion basics. Every result shows what was checked
          and stays scoped to the inspected page.
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
                Send the report with your contact details and what you want help with. This opens your email app so you
                can review it before sending.
              </p>
            </div>
            <form className="lead-form" onSubmit={openLeadEmail}>
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
              <button type="submit">Create email request</button>
            </form>
          </section>
        </section>
      ) : null}
    </main>
  );
}

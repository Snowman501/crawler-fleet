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

const teamLabels: Record<string, string> = {
  technical: "Technical",
  content: "Content",
  trust: "Trust",
  conversion: "Conversion",
};

export default function Home() {
  const [url, setUrl] = useState("https://example.com");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The check failed.");
    } finally {
      setLoading(false);
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
        </section>
      ) : null}
    </main>
  );
}

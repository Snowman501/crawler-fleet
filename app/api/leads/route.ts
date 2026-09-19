export const runtime = "nodejs";

const DEFAULT_REPO = "Snowman501/crawler-fleet";
const MAX_TEXT_LENGTH = 6000;

type LeadPayload = {
  name?: unknown;
  email?: unknown;
  website?: unknown;
  message?: unknown;
  report?: unknown;
  company?: unknown;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LeadPayload;
    if (typeof payload.company === "string" && payload.company.trim()) {
      return Response.json({ ok: true, stored: false, message: "Request received." });
    }

    const lead = normalizeLead(payload);
    const inbox = getGitHubInbox();
    if (!inbox) {
      return Response.json({
        ok: true,
        stored: false,
        message: "Request captured in the browser. Configure GitHub lead inbox env vars to save requests server-side.",
      });
    }

    const issue = await createGitHubIssue(inbox, lead);
    return Response.json({
      ok: true,
      stored: true,
      message: "Request saved to the lead inbox.",
      issue_url: issue.html_url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lead request failed.";
    return Response.json({ error: message }, { status: 400 });
  }
}

function normalizeLead(payload: LeadPayload) {
  const name = requiredText(payload.name, "name", 120);
  const email = requiredEmail(payload.email);
  const website = requiredUrl(payload.website);
  const message = requiredText(payload.message, "message", 1200);
  const report = typeof payload.report === "string" ? payload.report.slice(0, MAX_TEXT_LENGTH) : "";

  return { name, email, website, message, report };
}

function requiredText(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Enter a ${field}.`);
  }
  return value.trim().slice(0, maxLength);
}

function requiredEmail(value: unknown) {
  const email = requiredText(value, "valid email", 180);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email.");
  }
  return email;
}

function requiredUrl(value: unknown) {
  const website = requiredText(value, "website URL", 300);
  try {
    const url = new URL(website);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error();
    }
    return url.toString();
  } catch {
    throw new Error("Enter a full http:// or https:// website URL.");
  }
}

function getGitHubInbox() {
  const token = process.env.GITHUB_LEAD_TOKEN;
  const repo = process.env.GITHUB_LEAD_REPO ?? DEFAULT_REPO;
  if (!token) {
    return null;
  }
  const [owner, name] = repo.split("/");
  if (!owner || !name) {
    throw new Error("GITHUB_LEAD_REPO must look like owner/repo.");
  }
  return { token, owner, repo: name };
}

async function createGitHubIssue(
  inbox: { token: string; owner: string; repo: string },
  lead: { name: string; email: string; website: string; message: string; report: string },
) {
  const response = await fetch(`https://api.github.com/repos/${inbox.owner}/${inbox.repo}/issues`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${inbox.token}`,
      "Content-Type": "application/json",
      "User-Agent": "CrawlerFleetLeadInbox/0.1",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      title: `Lead request: ${lead.website}`,
      labels: ["lead", "website-checkup"],
      body: [
        "## Lead request",
        "",
        `**Name:** ${lead.name}`,
        `**Email:** ${lead.email}`,
        `**Website:** ${lead.website}`,
        "",
        "## Requested help",
        "",
        lead.message,
        "",
        lead.report ? "## Report" : "",
        lead.report ? "```text" : "",
        lead.report,
        lead.report ? "```" : "",
      ]
        .filter(Boolean)
        .join("\n"),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "GitHub lead inbox rejected the request.");
  }
  return data as { html_url: string };
}

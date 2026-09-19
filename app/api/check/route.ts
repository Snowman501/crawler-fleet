import dns from "node:dns/promises";
import { isIP } from "node:net";

export const runtime = "nodejs";

const MAX_BYTES = 1_000_000;
const REDIRECT_LIMIT = 4;

type Finding = {
  team: string;
  check: string;
  detected: boolean;
  evidence: string;
  why_it_matters: string;
};

type TeamSummary = Record<string, { passed: number; total: number; missing: string[] }>;

const checks = [
  {
    team: "technical",
    check: "HTTPS at final URL",
    evidence: "final URL scheme",
    why_it_matters: "A secure final URL is table stakes for customer trust and browser compatibility.",
    detect: (context: PageContext) => context.url.protocol === "https:",
  },
  {
    team: "technical",
    check: "Mobile viewport tag",
    evidence: 'meta[name="viewport"]',
    why_it_matters: "A viewport tag helps the page render correctly on phones.",
    detect: (context: PageContext) => /<meta\b[^>]*name=["']viewport["'][^>]*>/i.test(context.html),
  },
  {
    team: "content",
    check: "Page title",
    evidence: "<title>",
    why_it_matters: "A title helps people and search engines understand the page.",
    detect: (context: PageContext) => context.title.length > 0,
  },
  {
    team: "content",
    check: "Meta description",
    evidence: 'meta[name="description"]',
    why_it_matters: "A clear description can improve how the page appears in search results.",
    detect: (context: PageContext) => context.description.length > 0,
  },
  {
    team: "trust",
    check: "Contact link on inspected page",
    evidence: "anchor href values",
    why_it_matters: "A visible contact path makes the business easier to trust and reach.",
    detect: (context: PageContext) => /<a\b[^>]*href=["'][^"']*(contact|mailto:)[^"']*["'][^>]*>/i.test(context.html),
  },
  {
    team: "conversion",
    check: "Form on inspected page",
    evidence: "<form>",
    why_it_matters: "A form can turn visitor interest into a lead or customer request.",
    detect: (context: PageContext) => /<form\b/i.test(context.html),
  },
];

type PageContext = {
  url: URL;
  html: string;
  title: string;
  description: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: unknown };
    if (typeof body.url !== "string") {
      return Response.json({ error: "Enter a full http:// or https:// URL." }, { status: 400 });
    }

    const { finalUrl, html } = await fetchHtml(body.url);
    const context: PageContext = {
      url: finalUrl,
      html,
      title: extractTitle(html),
      description: extractDescription(html),
    };
    const findings = checks.map<Finding>((check) => ({
      team: check.team,
      check: check.check,
      detected: check.detect(context),
      evidence: check.check === "HTTPS at final URL" ? finalUrl.toString() : check.evidence,
      why_it_matters: check.why_it_matters,
    }));

    return Response.json({
      url: finalUrl.toString(),
      checked_at: new Date().toISOString(),
      scope: "HTML of one public page; absence here does not mean a feature is absent sitewide",
      title: context.title.slice(0, 160),
      description: context.description.slice(0, 300),
      team_summary: summarizeByTeam(findings),
      findings,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The check failed.";
    return Response.json({ error: message }, { status: 400 });
  }
}

async function fetchHtml(input: string) {
  let currentUrl = validateUrl(input);
  for (let redirectCount = 0; redirectCount < REDIRECT_LIMIT; redirectCount += 1) {
    await assertPublicHostname(currentUrl);
    const response = await fetch(currentUrl, {
      redirect: "manual",
      headers: { "User-Agent": "CrawlerFleet/0.2 (+website checkup; contact site owner)" },
      signal: AbortSignal.timeout(10_000),
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) {
        throw new Error("Redirect has no destination.");
      }
      currentUrl = validateUrl(new URL(location, currentUrl).toString());
      continue;
    }

    if (!response.ok) {
      throw new Error(`Site returned HTTP ${response.status}; no page findings were made.`);
    }
    if (!response.headers.get("content-type")?.toLowerCase().includes("text/html")) {
      throw new Error("Destination did not return an HTML page.");
    }

    const html = await readLimitedText(response);
    return { finalUrl: currentUrl, html };
  }

  throw new Error("Too many redirects.");
}

function validateUrl(input: string) {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Enter a full http:// or https:// URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Enter a full http:// or https:// URL.");
  }
  if (url.username || url.password || !["", "80", "443"].includes(url.port)) {
    throw new Error("Credentials and custom ports are not supported.");
  }
  return url;
}

async function assertPublicHostname(url: URL) {
  if (url.hostname === "localhost") {
    throw new Error("Only public websites can be checked.");
  }
  const addresses = isIP(url.hostname) ? [{ address: url.hostname }] : await dns.lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new Error("Only public websites can be checked.");
  }
}

function isPublicAddress(address: string) {
  if (address.includes(":")) {
    return !/^(::1|fc|fd|fe80)/i.test(address);
  }
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }
  const [a, b] = parts;
  return !(
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

async function readLimitedText(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) {
    return "";
  }

  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    size += value.length;
    if (size > MAX_BYTES) {
      throw new Error("Page exceeded the 1 MB inspection limit.");
    }
    chunks.push(value);
  }

  return new TextDecoder().decode(Buffer.concat(chunks));
}

function extractTitle(html: string) {
  return decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/\s+/g, " ").trim();
}

function extractDescription(html: string) {
  const match = html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  return decodeEntities(match?.[1] ?? "").trim();
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function summarizeByTeam(findings: Finding[]) {
  return findings.reduce<TeamSummary>((summary, finding) => {
    summary[finding.team] ??= { passed: 0, total: 0, missing: [] };
    summary[finding.team].total += 1;
    if (finding.detected) {
      summary[finding.team].passed += 1;
    } else {
      summary[finding.team].missing.push(finding.check);
    }
    return summary;
  }, {});
}

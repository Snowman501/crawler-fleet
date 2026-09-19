import dns from "node:dns/promises";
import { isIP } from "node:net";

export const runtime = "nodejs";

const MAX_BYTES = 1_000_000;
const REDIRECT_LIMIT = 4;

type Finding = {
  team: string;
  check: string;
  detected: boolean;
  applicable: boolean;
  evidence: string;
  why_it_matters: string;
  how_to_fix: string;
};

type TeamSummary = Record<string, { passed: number; total: number; missing: string[]; not_applicable: string[] }>;

const checks = [
  {
    team: "technical",
    check: "HTTPS at final URL",
    evidence: "final URL scheme",
    why_it_matters: "A secure final URL is table stakes for customer trust and browser compatibility.",
    how_to_fix: "Redirect all HTTP traffic to HTTPS and use the HTTPS address as the canonical URL.",
    detect: (context: PageContext) => context.url.protocol === "https:",
  },
  {
    team: "technical",
    check: "Mobile viewport tag",
    evidence: 'meta[name="viewport"]',
    why_it_matters: "A viewport tag helps the page render correctly on phones.",
    how_to_fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> inside <head>.',
    detect: (context: PageContext) => hasMetaName(context.html, "viewport"),
  },
  {
    team: "technical",
    check: "Canonical URL",
    evidence: 'link[rel="canonical"]',
    why_it_matters: "A canonical URL helps search engines understand the preferred page address.",
    how_to_fix: 'Add <link rel="canonical" href="https://your-domain.example/preferred-path"> inside <head>.',
    detect: (context: PageContext) => /<link\b[^>]*rel=["'][^"']*\bcanonical\b[^"']*["'][^>]*>/i.test(context.html),
  },
  {
    team: "technical",
    check: "Robots file reachable",
    evidence: "/robots.txt",
    why_it_matters: "A robots file gives crawlers basic instructions and can point them toward important content.",
    how_to_fix: "Publish /robots.txt, allow the public pages you want indexed, and include the sitemap URL.",
    detect: (context: PageContext) => context.originChecks.robots.ok,
    detail: (context: PageContext) => context.originChecks.robots.evidence,
  },
  {
    team: "technical",
    check: "Sitemap reachable",
    evidence: "/sitemap.xml",
    why_it_matters: "A sitemap helps search engines discover the important pages faster.",
    how_to_fix: "Publish /sitemap.xml with canonical public URLs and keep its last-modified dates accurate.",
    detect: (context: PageContext) => context.originChecks.sitemap.ok,
    detail: (context: PageContext) => context.originChecks.sitemap.evidence,
  },
  {
    team: "content",
    check: "Page title",
    evidence: "<title>",
    why_it_matters: "A title helps people and search engines understand the page.",
    how_to_fix: "Add one specific page title that clearly names the business, service, product, or topic.",
    detect: (context: PageContext) => context.title.length > 0,
  },
  {
    team: "content",
    check: "Meta description",
    evidence: 'meta[name="description"]',
    why_it_matters: "A clear description can improve how the page appears in search results.",
    how_to_fix: "Add a concise meta description that explains the page and gives the visitor a reason to click.",
    detect: (context: PageContext) => context.description.length > 0,
  },
  {
    team: "content",
    check: "Single H1 heading",
    evidence: "<h1>",
    why_it_matters: "One clear H1 gives visitors and search engines a strong page topic.",
    how_to_fix: "Use exactly one visible H1 that describes the primary purpose of the page.",
    detect: (context: PageContext) => context.h1Count === 1,
    detail: (context: PageContext) => `H1 count: ${context.h1Count}`,
  },
  {
    team: "content",
    check: "Social preview tags",
    evidence: 'meta[property="og:title"], meta[property="og:description"]',
    why_it_matters: "Social preview tags make shared links look more trustworthy and clickable.",
    how_to_fix: "Add Open Graph title and description tags; add an image tag when a suitable share image exists.",
    detect: (context: PageContext) =>
      hasMetaProperty(context.html, "og:title") && hasMetaProperty(context.html, "og:description"),
  },
  {
    team: "content",
    check: "Images have alt text",
    evidence: "<img alt>",
    why_it_matters: "Alt text improves accessibility and gives image-heavy pages more readable context.",
    how_to_fix: "Give each meaningful image concise alt text; use an empty alt attribute for purely decorative images.",
    applicable: (context: PageContext) => context.imageCount > 0,
    detect: (context: PageContext) => context.imageCount > 0 && context.imagesWithAlt === context.imageCount,
    detail: (context: PageContext) => `${context.imagesWithAlt}/${context.imageCount} images include alt text`,
  },
  {
    team: "content",
    check: "Links present on page",
    evidence: "anchor href values",
    why_it_matters: "Useful links help people continue their path instead of hitting a dead end.",
    how_to_fix: "Add clear links to the next useful page, action, product, service, or trusted external destination.",
    detect: (context: PageContext) => context.linkCount > 0,
    detail: (context: PageContext) =>
      `${context.internalLinkCount} internal links; ${context.externalLinkCount} external links`,
  },
  {
    team: "trust",
    check: "Contact link on inspected page",
    evidence: "anchor href values",
    why_it_matters: "A visible contact path makes the business easier to trust and reach.",
    how_to_fix: "Add a visible Contact link in the main navigation or footer and point it to a working contact page.",
    detect: (context: PageContext) => /<a\b[^>]*href=["'][^"']*(contact|mailto:)[^"']*["'][^>]*>/i.test(context.html),
  },
  {
    team: "trust",
    check: "About link on inspected page",
    evidence: "anchor href values",
    why_it_matters: "An about path helps visitors quickly understand who is behind the business.",
    how_to_fix: "Add an About, Company, or Story link that identifies the people or organization behind the site.",
    detect: (context: PageContext) => /<a\b[^>]*href=["'][^"']*(about|company|story)[^"']*["'][^>]*>/i.test(context.html),
  },
  {
    team: "trust",
    check: "Privacy or policy link",
    evidence: "anchor href values",
    why_it_matters: "Policy links are basic trust signals for customers, platforms, and payment reviews.",
    how_to_fix: "Publish plain-language Privacy and Terms pages and link them from the footer.",
    detect: (context: PageContext) => /<a\b[^>]*href=["'][^"']*(privacy|policy|terms)[^"']*["'][^>]*>/i.test(context.html),
  },
  {
    team: "trust",
    check: "Direct email or phone path",
    evidence: "mailto: or tel: link",
    why_it_matters: "A direct contact option lowers friction when someone is ready to ask for help.",
    how_to_fix: "Add a working mailto: email link, tel: phone link, or both where visitors can find them easily.",
    detect: (context: PageContext) => /<a\b[^>]*href=["'](?:mailto:|tel:)[^"']+["'][^>]*>/i.test(context.html),
  },
  {
    team: "conversion",
    check: "Form on inspected page",
    evidence: "<form>",
    why_it_matters: "A form can turn visitor interest into a lead or customer request.",
    how_to_fix: "Add a short form that asks only for the information needed to respond, with spam protection and a privacy notice.",
    detect: (context: PageContext) => /<form\b/i.test(context.html),
  },
  {
    team: "conversion",
    check: "Call-to-action language",
    evidence: "button and link text",
    why_it_matters: "Clear action language tells visitors what to do next.",
    how_to_fix: "Use specific action text such as Request a quote, Book a call, Buy the book, or Contact us.",
    detect: (context: PageContext) =>
      /\b(get started|contact|book|schedule|quote|buy|order|subscribe|sign up|request|start|call now)\b/i.test(
        context.visibleActionText,
      ),
  },
  {
    team: "conversion",
    check: "Lead capture path",
    evidence: "form, mailto, tel, or CTA link",
    why_it_matters: "A lead path turns a page from information into a business pipeline.",
    how_to_fix: "Connect the primary call to action to a real form, contact page, booking page, email address, or phone number.",
    detect: (context: PageContext) => /<form\b/i.test(context.html) || hasActionableLeadLink(context.html),
  },
];

type PageContext = {
  url: URL;
  html: string;
  title: string;
  description: string;
  h1Count: number;
  imageCount: number;
  imagesWithAlt: number;
  linkCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  visibleActionText: string;
  originChecks: OriginChecks;
};

type OriginResourceCheck = {
  ok: boolean;
  evidence: string;
};

type OriginChecks = {
  robots: OriginResourceCheck;
  sitemap: OriginResourceCheck;
};

export async function POST(request: Request) {
  const startedAt = Date.now();
  try {
    const body = (await request.json()) as { url?: unknown };
    if (typeof body.url !== "string") {
      return Response.json({ error: "Enter a full http:// or https:// URL." }, { status: 400 });
    }

    const { finalUrl, html } = await fetchHtml(body.url);
    const originChecks = await fetchOriginChecks(finalUrl);
    const linkStats = countLinks(html, finalUrl);
    const imageStats = countImages(html);
    const context: PageContext = {
      url: finalUrl,
      html,
      title: extractTitle(html),
      description: extractDescription(html),
      h1Count: countTags(html, "h1"),
      imageCount: imageStats.total,
      imagesWithAlt: imageStats.withAlt,
      linkCount: linkStats.total,
      internalLinkCount: linkStats.internal,
      externalLinkCount: linkStats.external,
      visibleActionText: extractActionText(html),
      originChecks,
    };
    const findings = checks.map<Finding>((check) => {
      const applicable = check.applicable?.(context) ?? true;
      return {
        team: check.team,
        check: check.check,
        detected: applicable && check.detect(context),
        applicable,
        evidence: check.detail?.(context) ?? (check.check === "HTTPS at final URL" ? finalUrl.toString() : check.evidence),
        why_it_matters: check.why_it_matters,
        how_to_fix: check.how_to_fix,
      };
    });

    console.log(JSON.stringify({
      level: "info",
      msg: "website check completed",
      route: "/api/check",
      host: finalUrl.hostname,
      ms: Date.now() - startedAt,
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
    console.error(JSON.stringify({
      level: "error",
      msg: "website check failed",
      route: "/api/check",
      error: message,
      ms: Date.now() - startedAt,
    }));
    return Response.json({ error: message }, { status: 400 });
  }
}

async function fetchHtml(input: string) {
  let currentUrl = validateUrl(input);
  for (let redirectCount = 0; redirectCount < REDIRECT_LIMIT; redirectCount += 1) {
    await assertPublicHostname(currentUrl);
    const response = await fetchWithRetry(currentUrl, {
      redirect: "manual",
      headers: { "User-Agent": "CrawlerFleet/0.7 (+https://questforgeai.vercel.app; evidence-based website checkup)" },
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

async function fetchOriginChecks(url: URL): Promise<OriginChecks> {
  const [robots, sitemap] = await Promise.all([
    checkOriginResource(url, "/robots.txt"),
    checkOriginResource(url, "/sitemap.xml"),
  ]);
  return { robots, sitemap };
}

async function checkOriginResource(baseUrl: URL, pathname: string): Promise<OriginResourceCheck> {
  const resourceUrl = validateUrl(new URL(pathname, baseUrl.origin).toString());
  try {
    await assertPublicHostname(resourceUrl);
    const response = await fetchWithRetry(resourceUrl, {
      redirect: "manual",
      headers: { "User-Agent": "CrawlerFleet/0.7 (+https://questforgeai.vercel.app; evidence-based website checkup)" },
      signal: AbortSignal.timeout(8_000),
    });
    await response.body?.cancel();
    return {
      ok: response.status >= 200 && response.status < 400,
      evidence: `${pathname} returned HTTP ${response.status}`,
    };
  } catch {
    return { ok: false, evidence: `${pathname} was not reachable during this check` };
  }
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

function hasMetaName(html: string, name: string) {
  return new RegExp(`<meta\\b[^>]*name=["']${escapeRegExp(name)}["'][^>]*>`, "i").test(html);
}

function hasMetaProperty(html: string, property: string) {
  return new RegExp(`<meta\\b[^>]*property=["']${escapeRegExp(property)}["'][^>]*>`, "i").test(html);
}

function countTags(html: string, tag: string) {
  return html.match(new RegExp(`<${escapeRegExp(tag)}\\b`, "gi"))?.length ?? 0;
}

function countImages(html: string) {
  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  const withAlt = images.filter((image) => /\balt=["'][^"']+["']/i.test(image)).length;
  return { total: images.length, withAlt };
}

function countLinks(html: string, baseUrl: URL) {
  const hrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
  let internal = 0;
  let external = 0;
  for (const href of hrefs) {
    if (/^(mailto:|tel:|#)/i.test(href)) {
      internal += 1;
      continue;
    }
    try {
      const url = new URL(href, baseUrl);
      if (url.hostname === baseUrl.hostname) {
        internal += 1;
      } else if (["http:", "https:"].includes(url.protocol)) {
        external += 1;
      }
    } catch {
      internal += 1;
    }
  }
  return { total: hrefs.length, internal, external };
}

function extractActionText(html: string) {
  const matches = [
    ...html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi),
    ...html.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi),
  ];
  return matches
    .map((match) => stripTags(match[1]))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasActionableLeadLink(html: string) {
  const hrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
  return hrefs.some((href) => {
    if (/^(mailto:|tel:)/i.test(href)) {
      return true;
    }
    try {
      const path = new URL(href, "https://crawler-fleet.invalid").pathname;
      return /\/(contact|book|booking|schedule|quote|request|appointment|reservation|order|cart|checkout)(?:\/|$)/i.test(path);
    } catch {
      return false;
    }
  });
}

async function fetchWithRetry(url: URL, init: RequestInit) {
  const retryableStatuses = new Set([429, 502, 503, 504]);
  let response = await fetch(url, init);
  if (!retryableStatuses.has(response.status)) {
    return response;
  }

  await response.body?.cancel();
  const retryAfter = Number(response.headers.get("retry-after"));
  const delayMs = Number.isFinite(retryAfter) ? Math.min(retryAfter * 1_000, 2_000) : 500;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  response = await fetch(url, init);
  return response;
}

function stripTags(value: string) {
  return decodeEntities(value.replace(/<[^>]+>/g, " ")).trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
    summary[finding.team] ??= { passed: 0, total: 0, missing: [], not_applicable: [] };
    if (!finding.applicable) {
      summary[finding.team].not_applicable.push(finding.check);
    } else if (finding.detected) {
      summary[finding.team].total += 1;
      summary[finding.team].passed += 1;
    } else {
      summary[finding.team].total += 1;
      summary[finding.team].missing.push(finding.check);
    }
    return summary;
  }, {});
}

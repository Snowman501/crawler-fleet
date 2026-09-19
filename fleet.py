#!/usr/bin/env python3
"""Evidence-based, single-site website checkup. No AI or customer outreach."""

import argparse
import ipaddress
import json
import socket
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup


HEADERS = {"User-Agent": "CrawlerFleet/0.1 (+website checkup; contact site owner)"}
TIMEOUT = 10
MAX_BYTES = 1_000_000


FLEET_CHECKS = [
    {
        "team": "technical",
        "check": "HTTPS at final URL",
        "evidence": "final URL scheme",
        "detect": lambda context: urlparse(context["url"]).scheme == "https",
        "why_it_matters": "A secure final URL is table stakes for customer trust and browser compatibility.",
    },
    {
        "team": "technical",
        "check": "Mobile viewport tag",
        "evidence": 'meta[name="viewport"]',
        "detect": lambda context: bool(context["viewport"]),
        "why_it_matters": "A viewport tag helps the page render correctly on phones.",
    },
    {
        "team": "content",
        "check": "Page title",
        "evidence": "<title>",
        "detect": lambda context: bool(context["title"]),
        "why_it_matters": "A title helps people and search engines understand the page.",
    },
    {
        "team": "content",
        "check": "Meta description",
        "evidence": 'meta[name="description"]',
        "detect": lambda context: bool(context["description"]),
        "why_it_matters": "A clear description can improve how the page appears in search results.",
    },
    {
        "team": "trust",
        "check": "Contact link on inspected page",
        "evidence": "anchor href values",
        "detect": lambda context: any(
            "contact" in link.lower() or link.startswith("mailto:") for link in context["links"]
        ),
        "why_it_matters": "A visible contact path makes the business easier to trust and reach.",
    },
    {
        "team": "conversion",
        "check": "Form on inspected page",
        "evidence": "<form>",
        "detect": lambda context: bool(context["forms"]),
        "why_it_matters": "A form can turn visitor interest into a lead or customer request.",
    },
]


def validate_url(url):
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise ValueError("Enter a full http:// or https:// URL")
    if parsed.username or parsed.password or parsed.port not in (None, 80, 443):
        raise ValueError("Credentials and custom ports are not supported")
    host = parsed.hostname
    addresses = socket.getaddrinfo(host, parsed.port or (443 if parsed.scheme == "https" else 80))
    if not addresses or any(not ipaddress.ip_address(item[4][0]).is_global for item in addresses):
        raise ValueError("Only public websites can be checked")
    return url


def fetch(url, session=None):
    session = session or requests.Session()
    for _ in range(4):
        validate_url(url)
        with session.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=False, stream=True) as response:
            if response.status_code in (301, 302, 303, 307, 308):
                location = response.headers.get("Location")
                if not location:
                    raise ValueError("Redirect has no destination")
                url = urljoin(url, location)
                continue
            if response.status_code != 200:
                raise ValueError(f"Site returned HTTP {response.status_code}; no page findings were made")
            if "text/html" not in response.headers.get("Content-Type", "").lower():
                raise ValueError("Destination did not return an HTML page")
            chunks = []
            size = 0
            for chunk in response.iter_content(8192):
                size += len(chunk)
                if size > MAX_BYTES:
                    raise ValueError("Page exceeded the 1 MB inspection limit")
                chunks.append(chunk)
            return url, b"".join(chunks).decode(response.encoding or "utf-8", errors="replace")
    raise ValueError("Too many redirects")


def inspect(url, html):
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.get_text(" ", strip=True) if soup.title else ""
    descriptions = soup.find_all("meta", attrs={"name": lambda v: v and v.lower() == "description"})
    description = descriptions[0].get("content", "").strip() if descriptions else ""
    viewport = soup.find("meta", attrs={"name": lambda v: v and v.lower() == "viewport"})
    links = [a.get("href", "") for a in soup.find_all("a", href=True)]
    forms = soup.find_all("form")
    context = {
        "url": url,
        "title": title,
        "description": description,
        "viewport": viewport,
        "links": links,
        "forms": forms,
    }
    findings = []
    for check in FLEET_CHECKS:
        findings.append(
            {
                "team": check["team"],
                "check": check["check"],
                "detected": bool(check["detect"](context)),
                "evidence": url if check["check"] == "HTTPS at final URL" else check["evidence"],
                "why_it_matters": check["why_it_matters"],
            }
        )
    team_summary = summarize_by_team(findings)
    return {
        "url": url,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "scope": "HTML of one public page; absence here does not mean a feature is absent sitewide",
        "title": title[:160],
        "description": description[:300],
        "team_summary": team_summary,
        "findings": findings,
    }


def summarize_by_team(findings):
    summary = {}
    for finding in findings:
        team = finding["team"]
        if team not in summary:
            summary[team] = {"passed": 0, "total": 0, "missing": []}
        summary[team]["total"] += 1
        if finding["detected"]:
            summary[team]["passed"] += 1
        else:
            summary[team]["missing"].append(finding["check"])
    return summary


def format_text_report(report):
    lines = [
        "Crawler Fleet Website Checkup",
        f"URL: {report['url']}",
        f"Scope: {report['scope']}",
        "",
        "Team summary:",
    ]
    for team, summary in sorted(report["team_summary"].items()):
        missing = ", ".join(summary["missing"]) if summary["missing"] else "none"
        lines.append(f"- {team}: {summary['passed']}/{summary['total']} detected; missing: {missing}")
    lines.extend(["", "Findings:"])
    for finding in report["findings"]:
        status = "detected" if finding["detected"] else "not detected"
        lines.append(f"- [{finding['team']}] {finding['check']}: {status}")
        lines.append(f"  Evidence checked: {finding['evidence']}")
        lines.append(f"  Why it matters: {finding['why_it_matters']}")
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description="Check one public website and save an evidence-based JSON report")
    parser.add_argument("url", help="Full http:// or https:// URL")
    parser.add_argument("--output", default="report.json", help="Output JSON path")
    parser.add_argument("--text-output", help="Optional plain-English report path")
    args = parser.parse_args()
    try:
        final_url, html = fetch(args.url)
        report = inspect(final_url, html)
    except (ValueError, OSError, requests.RequestException) as exc:
        parser.exit(1, f"Check failed: {exc}\n")
    with open(args.output, "w", encoding="utf-8") as output:
        json.dump(report, output, indent=2)
        output.write("\n")
    if args.text_output:
        with open(args.text_output, "w", encoding="utf-8") as output:
            output.write(format_text_report(report))
    print(f"Saved {args.output}: {len(report['findings'])} checks of {final_url}")


if __name__ == "__main__":
    main()

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
    checks = [
        ("Page title", bool(title), "<title>"),
        ("Meta description", bool(description), 'meta[name="description"]'),
        ("Mobile viewport tag", bool(viewport), 'meta[name="viewport"]'),
        ("HTTPS at final URL", urlparse(url).scheme == "https", url),
        ("Contact link on inspected page", any("contact" in link.lower() or link.startswith("mailto:") for link in links), "anchor href values"),
        ("Form on inspected page", bool(forms), "<form>"),
    ]
    return {
        "url": url,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "scope": "HTML of one public page; absence here does not mean a feature is absent sitewide",
        "title": title[:160],
        "description": description[:300],
        "findings": [
            {"check": name, "detected": detected, "evidence": evidence}
            for name, detected, evidence in checks
        ],
    }


def main():
    parser = argparse.ArgumentParser(description="Check one public website and save an evidence-based JSON report")
    parser.add_argument("url", help="Full http:// or https:// URL")
    parser.add_argument("--output", default="report.json", help="Output JSON path")
    args = parser.parse_args()
    try:
        final_url, html = fetch(args.url)
        report = inspect(final_url, html)
    except (ValueError, OSError, requests.RequestException) as exc:
        parser.exit(1, f"Check failed: {exc}\n")
    with open(args.output, "w", encoding="utf-8") as output:
        json.dump(report, output, indent=2)
        output.write("\n")
    print(f"Saved {args.output}: {len(report['findings'])} checks of {final_url}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Hot Springs Village AR — Local Business AI Readiness Crawler
Scores business websites 1-10 for AI opportunity and prints a lead report.
"""

import re
import sys
import time
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from dataclasses import dataclass, field
from typing import Optional

# ── Configuration ─────────────────────────────────────────────────────────────

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2.5:0.5b"
REQUEST_TIMEOUT = 12
CRAWL_DELAY = 1.5  # seconds between requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; AIReadinessCrawler/1.0; research)",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
}

# ── Business list ──────────────────────────────────────────────────────────────
# Hot Springs Village, AR local businesses and key organizations.
# Add or remove URLs as needed.

BUSINESSES = [
    ("Hot Springs Village POA",         "https://www.hsvpoa.org"),
    ("HSV Real Estate (DeSoto Club)",   "https://www.hsvrealty.com"),
    ("Diamante Country Club",           "https://www.diamantecountryclub.com"),
    ("The Village Voice (local paper)", "https://thevillagevoice.com"),
    ("HSV Golf (Coronado Course)",      "https://www.hsvgolf.com"),
    ("Balboa Club Restaurant",          "https://www.balboaclub.com"),
    ("Hot Springs Village Chamber",     "https://www.hotspringsvillagechamber.com"),
    ("HSV Real Estate Advantage",       "https://www.hsvadvantage.com"),
    ("The Woodlands Audiology",         "https://www.woodlandsaudiologyar.com"),
    ("HSV Farmers Market",              "https://www.hsvfarmersmarket.com"),
    ("Village Dentistry",               "https://www.villagedentistryar.com"),
    ("Ouachita Lakes Insurance",        "https://www.ouachitalakesinsurance.com"),
    ("HSV Animal Welfare League",       "https://www.hsvawl.org"),
    ("Coronado Community Center",       "https://www.hsvpoa.org/amenities/coronado"),
    ("Alegria Mexican Restaurant HSV",  "https://www.alegriarestaurantarkansas.com"),
]

# ── Data model ─────────────────────────────────────────────────────────────────

@dataclass
class SiteFeatures:
    url: str
    reachable: bool = False
    status_code: int = 0
    title: str = ""
    has_contact_form: bool = False
    has_chatbot: bool = False
    has_booking: bool = False
    has_ecommerce: bool = False
    has_analytics: bool = False
    has_social_links: bool = False
    has_mobile_viewport: bool = False
    has_schema_markup: bool = False
    has_newsletter: bool = False
    has_ssl: bool = False
    word_count: int = 0
    cms_hint: str = ""
    page_snippet: str = ""
    error: str = ""

@dataclass
class LeadResult:
    name: str
    url: str
    score: int = 0
    reasoning: str = ""
    features: SiteFeatures = field(default_factory=SiteFeatures)

# ── Crawling ───────────────────────────────────────────────────────────────────

def fetch_site(url: str) -> SiteFeatures:
    feat = SiteFeatures(url=url, has_ssl=url.startswith("https://"))
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        feat.reachable = True
        feat.status_code = resp.status_code
        if resp.status_code != 200:
            feat.error = f"HTTP {resp.status_code}"
            return feat

        soup = BeautifulSoup(resp.text, "html.parser")
        html_lower = resp.text.lower()

        feat.title = (soup.title.string.strip() if soup.title and soup.title.string else "")[:120]

        # Mobile viewport
        feat.has_mobile_viewport = bool(soup.find("meta", attrs={"name": "viewport"}))

        # Schema.org markup
        feat.has_schema_markup = bool(
            soup.find("script", attrs={"type": "application/ld+json"})
            or re.search(r'itemtype=["\']https?://schema\.org', resp.text, re.I)
        )

        # Analytics
        analytics_patterns = ["google-analytics", "gtag(", "googletagmanager", "mixpanel",
                               "segment.com", "hotjar", "clarity.ms", "plausible"]
        feat.has_analytics = any(p in html_lower for p in analytics_patterns)

        # Chatbot / live chat
        chat_patterns = ["intercom", "zendesk", "tawk.to", "livechat", "drift.com",
                         "crisp.chat", "tidio", "freshchat", "olark", "hubspot.com/conversations",
                         "chatbot", "chat widget"]
        feat.has_chatbot = any(p in html_lower for p in chat_patterns)

        # Online booking / scheduling
        booking_patterns = ["calendly", "acuityscheduling", "mindbody", "booker",
                            "opentable", "resy", "yelp.com/reservations", "book now",
                            "schedule appointment", "online booking", "reserve a table",
                            "book online", "make a reservation"]
        feat.has_booking = any(p in html_lower for p in booking_patterns)

        # E-commerce
        ecom_patterns = ["shopify", "woocommerce", "add to cart", "checkout", "paypal",
                         "stripe.com", "square.com/commerce", "shop now", "buy now"]
        feat.has_ecommerce = any(p in html_lower for p in ecom_patterns)

        # Contact form
        forms = soup.find_all("form")
        feat.has_contact_form = any(
            f.find("input", attrs={"type": re.compile(r"email|text", re.I)}) for f in forms
        )

        # Social links
        social_domains = ["facebook.com", "instagram.com", "twitter.com", "x.com",
                          "linkedin.com", "youtube.com", "tiktok.com"]
        links = [a.get("href", "") for a in soup.find_all("a", href=True)]
        feat.has_social_links = any(any(s in lnk for s in social_domains) for lnk in links)

        # Newsletter / email capture
        newsletter_patterns = ["newsletter", "subscribe", "mailchimp", "constantcontact",
                               "klaviyo", "email list", "sign up for"]
        feat.has_newsletter = any(p in html_lower for p in newsletter_patterns)

        # CMS hint
        if "wp-content" in html_lower or "wp-json" in html_lower:
            feat.cms_hint = "WordPress"
        elif "squarespace" in html_lower:
            feat.cms_hint = "Squarespace"
        elif "wix.com" in html_lower:
            feat.cms_hint = "Wix"
        elif "webflow" in html_lower:
            feat.cms_hint = "Webflow"
        elif "shopify" in html_lower:
            feat.cms_hint = "Shopify"
        elif "joomla" in html_lower:
            feat.cms_hint = "Joomla"
        elif "drupal" in html_lower:
            feat.cms_hint = "Drupal"

        # Word count (rough)
        text = soup.get_text(separator=" ")
        feat.word_count = len(text.split())

        # Page snippet for LLM context (clean text, trimmed)
        snippet_text = " ".join(text.split())[:800]
        feat.page_snippet = snippet_text

    except requests.exceptions.ConnectionError:
        feat.error = "Connection refused / DNS failure"
    except requests.exceptions.Timeout:
        feat.error = "Timeout"
    except Exception as exc:
        feat.error = str(exc)[:80]

    return feat

# ── Ollama scoring ─────────────────────────────────────────────────────────────

def build_prompt(name: str, feat: SiteFeatures) -> str:
    flags = {
        "Contact form": feat.has_contact_form,
        "Chatbot / live chat": feat.has_chatbot,
        "Online booking": feat.has_booking,
        "E-commerce": feat.has_ecommerce,
        "Analytics": feat.has_analytics,
        "Social media links": feat.has_social_links,
        "Mobile-friendly (viewport)": feat.has_mobile_viewport,
        "Schema.org markup": feat.has_schema_markup,
        "Newsletter / email capture": feat.has_newsletter,
        "SSL / HTTPS": feat.has_ssl,
    }
    present = [k for k, v in flags.items() if v]
    absent = [k for k, v in flags.items() if not v]

    prompt = f"""You are an AI-readiness analyst for small local businesses.

Business: {name}
Website: {feat.url}
CMS: {feat.cms_hint or 'unknown'}
Approx. word count: {feat.word_count}
Reachable: {feat.reachable}
{f'Error: {feat.error}' if feat.error else ''}

Digital features PRESENT: {', '.join(present) if present else 'none detected'}
Digital features ABSENT:  {', '.join(absent) if absent else 'none'}

Page excerpt:
{feat.page_snippet[:400]}

Score this business 1-10 for AI readiness (how much they could benefit from AI tools like chatbots, automated scheduling, AI-generated content, or predictive analytics).
- 1-3 = very low tech, big opportunity
- 4-6 = moderate digital presence, room to grow
- 7-9 = digitally mature, targeted AI add-ons possible
- 10 = already using AI extensively

Reply in this exact format (two lines only):
SCORE: <number>
REASON: <one sentence explaining the score>"""
    return prompt

def score_with_ollama(name: str, feat: SiteFeatures) -> tuple[int, str]:
    if not feat.reachable:
        # Still score based on what we know (unreachable sites are big opportunities)
        prompt = (
            f"Business '{name}' at {feat.url} could not be reached (error: {feat.error}). "
            "Score it 1-10 for AI readiness. An unreachable or missing website means the "
            "business likely has very low digital maturity.\n"
            "Reply in this exact format:\nSCORE: <number>\nREASON: <one sentence>"
        )
    else:
        prompt = build_prompt(name, feat)

    try:
        resp = requests.post(
            OLLAMA_URL,
            json={"model": MODEL, "prompt": prompt, "stream": False},
            timeout=60,
        )
        resp.raise_for_status()
        text = resp.json().get("response", "")
    except Exception as exc:
        return 0, f"Ollama error: {exc}"

    score_match = re.search(r"SCORE:\s*(\d+)", text, re.I)
    reason_match = re.search(r"REASON:\s*(.+)", text, re.I)
    score = int(score_match.group(1)) if score_match else 0
    score = max(1, min(10, score))  # clamp
    reason = reason_match.group(1).strip() if reason_match else text.strip()[:150]
    return score, reason

# ── Report ─────────────────────────────────────────────────────────────────────

def print_report(results: list[LeadResult]) -> None:
    # Sort: lowest score first (biggest AI opportunity at top)
    results.sort(key=lambda r: (r.score, r.name))

    width = 78
    print("\n" + "═" * width)
    print("  HOT SPRINGS VILLAGE AR — AI READINESS LEAD REPORT")
    print(f"  Model: {MODEL}  |  Businesses scanned: {len(results)}")
    print("═" * width)

    for r in results:
        f = r.features
        bar = "█" * r.score + "░" * (10 - r.score)
        reachability = "✓ online" if f.reachable else f"✗ offline ({f.error})"

        print(f"\n  [{r.score:>2}/10] {bar}  {r.name}")
        print(f"         {r.url}")
        print(f"         {reachability}", end="")
        if f.cms_hint:
            print(f"  |  CMS: {f.cms_hint}", end="")
        if f.word_count:
            print(f"  |  ~{f.word_count} words", end="")
        print()

        # Feature badges
        badges = []
        if f.has_chatbot:      badges.append("chatbot")
        if f.has_booking:      badges.append("booking")
        if f.has_ecommerce:    badges.append("e-comm")
        if f.has_analytics:    badges.append("analytics")
        if f.has_contact_form: badges.append("form")
        if f.has_social_links: badges.append("social")
        if f.has_newsletter:   badges.append("newsletter")
        if f.has_schema_markup:badges.append("schema")
        if f.has_ssl:          badges.append("ssl")
        if f.has_mobile_viewport: badges.append("mobile")
        if badges:
            print(f"         Features: {', '.join(badges)}")

        print(f"         AI take: {r.reasoning}")

    # Summary table
    print("\n" + "─" * width)
    print(f"  {'BUSINESS':<38} {'SCORE':>5}  {'STATUS'}")
    print("─" * width)
    for r in results:
        status = "online" if r.features.reachable else "offline"
        print(f"  {r.name:<38} {r.score:>5}/10  {status}")

    print("─" * width)
    scored = [r for r in results if r.score > 0]
    if scored:
        avg = sum(r.score for r in scored) / len(scored)
        lowest = results[0]
        print(f"  Average score: {avg:.1f}/10")
        print(f"  Top lead (lowest score = biggest AI gap): {lowest.name} ({lowest.score}/10)")
    print("═" * width + "\n")

# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    print(f"Starting crawl of {len(BUSINESSES)} Hot Springs Village businesses...")
    print(f"Using model: {MODEL}\n")

    results: list[LeadResult] = []

    for i, (name, url) in enumerate(BUSINESSES, 1):
        print(f"[{i:>2}/{len(BUSINESSES)}] {name} ...", end=" ", flush=True)

        feat = fetch_site(url)

        if feat.reachable:
            print(f"HTTP {feat.status_code}", end=" → scoring... ", flush=True)
        else:
            print(f"unreachable ({feat.error})", end=" → scoring... ", flush=True)

        score, reason = score_with_ollama(name, feat)
        print(f"{score}/10")

        results.append(LeadResult(name=name, url=url, score=score,
                                  reasoning=reason, features=feat))

        if i < len(BUSINESSES):
            time.sleep(CRAWL_DELAY)

    print_report(results)

if __name__ == "__main__":
    main()

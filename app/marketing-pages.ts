export type MarketingPage = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

export const marketingPages: MarketingPage[] = [
  {
    slug: "free-website-checker",
    eyebrow: "Free Tool",
    title: "Free website checker for small businesses",
    description:
      "Run a fast evidence-based scan for missing SEO basics, trust signals, links, images, and lead capture paths.",
    primaryCta: "Run the free check",
    sections: [
      {
        title: "Built for quick answers",
        body: "Paste one public page and get a plain-English report that shows what was checked, what was detected, and what needs attention.",
      },
      {
        title: "No guessing",
        body: "Every finding is tied to evidence like page titles, meta descriptions, headings, robots.txt, sitemap.xml, forms, contact links, and CTA language.",
      },
      {
        title: "Useful before a sales call",
        body: "The report can be copied, downloaded, or sent with a help request when a business wants a fix plan.",
      },
    ],
  },
  {
    slug: "small-business-website-audit",
    eyebrow: "Audit",
    title: "Small business website audit without the runaround",
    description:
      "Find common website problems that can make customers hesitate: missing contact paths, weak page structure, thin trust signals, and unclear next steps.",
    primaryCta: "Audit my website",
    sections: [
      {
        title: "What gets checked",
        body: "Crawler Fleet looks for technical basics, content structure, trust markers, and conversion paths on the inspected page.",
      },
      {
        title: "What you get",
        body: "You get a report with detected and missing items, evidence notes, and a summary that can become a fix plan.",
      },
      {
        title: "Who it helps",
        body: "Local service businesses, authors, consultants, contractors, shops, and new websites that need a fast first pass before spending money on ads.",
      },
    ],
  },
  {
    slug: "seo-readiness-check",
    eyebrow: "SEO",
    title: "SEO readiness check for one public page",
    description:
      "Check whether a page has the basic signals search engines expect before you start pushing traffic toward it.",
    primaryCta: "Check SEO readiness",
    sections: [
      {
        title: "Search basics",
        body: "The scanner checks titles, meta descriptions, canonical tags, headings, links, sitemap reachability, and robots.txt reachability.",
      },
      {
        title: "Better first impressions",
        body: "Clear titles, descriptions, and social preview tags help people understand the page before they click.",
      },
      {
        title: "Fast enough to repeat",
        body: "Run the check after every site update and keep the report as a simple before-and-after record.",
      },
    ],
  },
  {
    slug: "website-trust-check",
    eyebrow: "Trust",
    title: "Website trust check for contact, policy, and credibility signals",
    description:
      "See whether a page gives visitors enough confidence to contact the business or keep moving toward a purchase.",
    primaryCta: "Check trust signals",
    sections: [
      {
        title: "Contact paths matter",
        body: "A missing contact link, email path, phone path, about page, or privacy link can make a legitimate business look harder to trust.",
      },
      {
        title: "Good for payment reviews",
        body: "Trust basics also help when setting up payment accounts, business profiles, and customer-facing services.",
      },
      {
        title: "Simple evidence",
        body: "The report shows what was detected on the inspected page, so the next fix is easier to understand.",
      },
    ],
  },
  {
    slug: "website-lead-capture-check",
    eyebrow: "Conversion",
    title: "Website lead capture check",
    description:
      "Find out whether a page gives interested visitors a clear action path through forms, contact links, phone links, or call-to-action language.",
    primaryCta: "Check lead capture",
    sections: [
      {
        title: "Traffic needs a next step",
        body: "A page can look good and still lose leads if it does not tell people what to do next.",
      },
      {
        title: "CTA language",
        body: "Crawler Fleet looks for action words like contact, book, schedule, request, quote, get started, and call now.",
      },
      {
        title: "From report to request",
        body: "The free report can turn into a help request without forcing a phone call first.",
      },
    ],
  },
  {
    slug: "examples",
    eyebrow: "Examples",
    title: "Example website checkup reports",
    description:
      "See how Crawler Fleet turns one inspected page into a clear list of missing technical, content, trust, and conversion signals.",
    primaryCta: "Run a sample check",
    sections: [
      {
        title: "Local service business",
        body: "Use the scanner to find missing contact paths, weak CTA language, no policy links, or missing SEO basics before buying ads.",
      },
      {
        title: "Author or creator website",
        body: "Check whether readers can find the book, understand the page, and contact or follow the author.",
      },
      {
        title: "New business website",
        body: "Use the report as a launch checklist before sharing the site on social media or submitting it to search engines.",
      },
    ],
  },
  {
    slug: "pricing",
    eyebrow: "Pricing",
    title: "Simple website checkup services",
    description:
      "Start with the free scanner, then request help when you want the report turned into fixes, copy, or a cleaner landing page.",
    primaryCta: "Start with a free scan",
    sections: [
      {
        title: "Free scan",
        body: "$0. Run the public checker, copy the report, and see what needs attention.",
      },
      {
        title: "Quick fix review",
        body: "$25 target offer. A plain-English review of the report with the highest-impact fixes listed first.",
      },
      {
        title: "Website action plan",
        body: "$75 target offer. A deeper fix plan for SEO basics, trust signals, page copy, and lead capture.",
      },
    ],
  },
  {
    slug: "about",
    eyebrow: "About",
    title: "Evidence-first website recon by Crawler Fleet",
    description:
      "Crawler Fleet is a small website analysis system built to help small businesses find practical website problems fast.",
    primaryCta: "Use the scanner",
    sections: [
      {
        title: "The mission",
        body: "Give small businesses a fast, understandable first look at the issues that can keep a website from earning trust or leads.",
      },
      {
        title: "The method",
        body: "The scanner stays scoped, records what it checked, and avoids pretending absence on one page means absence across the whole site.",
      },
      {
        title: "The path",
        body: "Free check first, clear evidence next, paid help only when the business wants a fix plan.",
      },
    ],
  },
];

export function getMarketingPage(slug: string) {
  return marketingPages.find((page) => page.slug === slug);
}

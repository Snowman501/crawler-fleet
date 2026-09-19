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
    slug: "launch-promo",
    eyebrow: "Launch Promo",
    title: "Launch promo website checkups for early users",
    description:
      "Try the free scanner, then request a discounted first-pass review while Crawler Fleet is launching.",
    primaryCta: "Claim launch promo",
    sections: [
      {
        title: "Free scan first",
        body: "Run the public checker before paying for anything. The report shows what was detected and what needs attention.",
      },
      {
        title: "Launch review",
        body: "Early users can request a quick fix review based on the report so they know the highest-impact next steps.",
      },
      {
        title: "No pressure path",
        body: "If the scan does not show anything worth fixing, keep the report and move on. Paid help starts only when a business chooses it.",
      },
    ],
  },
  {
    slug: "what-to-do-next",
    eyebrow: "Help",
    title: "What to do after your website checkup",
    description:
      "A simple guide for business owners who ran a scan but are not sure which missing items matter first.",
    primaryCta: "Run a checkup",
    sections: [
      {
        title: "Start with trust",
        body: "If contact, about, privacy, email, phone, or policy paths are missing, fix those before spending money on traffic.",
      },
      {
        title: "Then fix search basics",
        body: "Titles, meta descriptions, headings, social preview tags, robots.txt, and sitemap.xml help people and crawlers understand the page.",
      },
      {
        title: "Then fix lead capture",
        body: "If the page has no form, phone link, email link, or clear call to action, visitors may leave without knowing what to do.",
      },
    ],
  },
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
        title: "Useful before spending money",
        body: "The report can be copied, downloaded, or sent with a help request before a business buys ads, redesigns a site, or pays for fixes.",
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
    slug: "contractor-website-checker",
    eyebrow: "Contractors",
    title: "Contractor website checker for calls, quotes, and trust",
    description:
      "Check whether a contractor website makes it easy for homeowners to trust the business, request a quote, or call fast.",
    primaryCta: "Check my contractor site",
    sections: [
      {
        title: "Quote paths",
        body: "The scanner looks for forms, contact links, phone paths, and clear action language that help visitors request work.",
      },
      {
        title: "Trust basics",
        body: "About, contact, privacy, page titles, and visible structure all help a contractor website feel legitimate.",
      },
      {
        title: "Before ads",
        body: "Run the check before paying for Google or social ads so traffic has somewhere useful to land.",
      },
    ],
  },
  {
    slug: "author-website-checker",
    eyebrow: "Authors",
    title: "Author website checker for books, bios, and reader paths",
    description:
      "Check whether an author page helps readers understand the book, find buying links, and trust the author brand.",
    primaryCta: "Check my author site",
    sections: [
      {
        title: "Reader path",
        body: "A reader should quickly see what the book is, why it matters, and where to buy or learn more.",
      },
      {
        title: "Search basics",
        body: "Titles, descriptions, headings, and share previews help book pages make a better first impression.",
      },
      {
        title: "Platform cleanup",
        body: "Use the report before sending traffic from Books2Read, Amazon, social posts, or an author bio.",
      },
    ],
  },
  {
    slug: "restaurant-website-checker",
    eyebrow: "Restaurants",
    title: "Restaurant website checker for menus, location, and fast action",
    description:
      "Check whether hungry customers can quickly find what they need: menu paths, contact options, hours, location clues, and calls to action.",
    primaryCta: "Check my restaurant site",
    sections: [
      {
        title: "Fast decisions",
        body: "Restaurant visitors often need to act quickly. Missing contact paths or weak CTA language can cost orders.",
      },
      {
        title: "Mobile first",
        body: "Many food searches happen on phones, so viewport, headings, and simple action paths matter.",
      },
      {
        title: "Trust and clarity",
        body: "Clear links, policy paths, and page structure make the business easier to understand before a customer arrives.",
      },
    ],
  },
  {
    slug: "local-business-website-checker",
    eyebrow: "Local Business",
    title: "Local business website checker for trust and leads",
    description:
      "Run a quick check for the basics local customers expect before they call, visit, request a quote, or book service.",
    primaryCta: "Check my local business",
    sections: [
      {
        title: "Local trust",
        body: "Contact paths, about links, policy links, and simple page structure help visitors believe the business is real.",
      },
      {
        title: "Lead capture",
        body: "Forms, phone links, email links, and CTA language tell customers what to do next.",
      },
      {
        title: "Launch readiness",
        body: "Use the scanner before putting the site on social profiles, business cards, local listings, or paid ads.",
      },
    ],
  },
  {
    slug: "ecommerce-trust-check",
    eyebrow: "Ecommerce",
    title: "Ecommerce trust check for policy links and buyer confidence",
    description:
      "Check whether a shop page has basic trust signals that can reduce hesitation before someone buys.",
    primaryCta: "Check ecommerce trust",
    sections: [
      {
        title: "Buyer confidence",
        body: "Policy links, clear headings, contact paths, and social preview tags can make a shop feel safer.",
      },
      {
        title: "Conversion friction",
        body: "Missing calls to action or unclear lead paths can make even good products harder to buy.",
      },
      {
        title: "Simple first pass",
        body: "Crawler Fleet does not replace a full store audit, but it shows obvious page-level gaps fast.",
      },
    ],
  },
  {
    slug: "mobile-website-checker",
    eyebrow: "Mobile",
    title: "Mobile website checker for phone-first visitors",
    description:
      "Check whether a page has basic mobile readiness signals and clear paths for people visiting from a phone.",
    primaryCta: "Check mobile readiness",
    sections: [
      {
        title: "Phone traffic",
        body: "A mobile visitor needs a clear page title, readable structure, contact path, and action button fast.",
      },
      {
        title: "Basic readiness",
        body: "The scanner checks for viewport, headings, links, and conversion paths that affect phone visitors.",
      },
      {
        title: "Simple next step",
        body: "Use the report to decide whether the page needs a quick cleanup before sharing it again.",
      },
    ],
  },
  {
    slug: "landing-page-audit",
    eyebrow: "Landing Pages",
    title: "Landing page audit for trust, SEO, and lead capture",
    description:
      "Check whether one landing page has the basic evidence, structure, and action path needed before you send traffic to it.",
    primaryCta: "Audit my landing page",
    sections: [
      {
        title: "One page focus",
        body: "The scanner is intentionally scoped to one public page, which makes it useful for landing pages and campaign pages.",
      },
      {
        title: "Traffic leaks",
        body: "Missing forms, weak CTA language, or unclear trust paths can waste visitors from ads, posts, and links.",
      },
      {
        title: "Action plan ready",
        body: "The report gives enough evidence to request a fix plan without starting from a blank conversation.",
      },
    ],
  },
  {
    slug: "new-business-website-launch-check",
    eyebrow: "Launch",
    title: "New business website launch check",
    description:
      "Run a practical readiness check before announcing a new business website, sharing it publicly, or putting it on profiles.",
    primaryCta: "Check launch readiness",
    sections: [
      {
        title: "Before you share",
        body: "A quick scan can catch missing titles, descriptions, contact paths, policy links, forms, and sitemap basics.",
      },
      {
        title: "Pre-revenue friendly",
        body: "Start with free evidence and only request paid help when the report shows a fix worth doing.",
      },
      {
        title: "Built for momentum",
        body: "Use the report as a launch checklist and keep improving the page as the business grows.",
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

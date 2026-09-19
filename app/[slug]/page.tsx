import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarketingPage, marketingPages } from "../marketing-pages";
import { serviceOffers } from "../service-offers";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return marketingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getMarketingPage(slug);
  if (!page) {
    return {};
  }
  return {
    title: `${page.title} | Crawler Fleet`,
    description: page.description,
  };
}

export default async function MarketingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getMarketingPage(slug);
  if (!page) {
    notFound();
  }

  return (
    <main className="shell marketing-shell">
      <section className="marketing-hero">
        <div className="topbar">
          <p className="eyebrow">{page.eyebrow}</p>
          <a className="nav-link" href="/">
            Scanner
          </a>
        </div>
        <div>
          <h1>{page.title}</h1>
          <p className="intro">{page.description}</p>
        </div>
        <div className="cta-row">
          <a className="button-link" href="/">
            {page.primaryCta}
          </a>
          <a className="nav-link" href="/pricing">
            View pricing
          </a>
        </div>
      </section>

      <section className="marketing-grid" aria-label="Service details">
        {page.sections.map((section) => (
          <article className="marketing-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-head">
          <p className="eyebrow">{page.slug === "pricing" ? "Service Menu" : "Fix This For Me"}</p>
          <h2>{page.slug === "pricing" ? "Simple fixed-price starting points." : "Turn the report into action."}</h2>
        </div>
        <p className="panel-copy">
          {page.slug === "pricing"
            ? "Start with the free scan, then choose a specific help request when you want a plain-English review, cleanup plan, or page repair."
            : "Paste a public website URL, run the report, and choose the service that best matches what needs fixing."}
        </p>
        <div className="offer-grid">
          {serviceOffers.map((offer) => (
            <article className="offer-card" key={offer.name}>
              <div>
                <p className="offer-price">{offer.price}</p>
                <h3>{offer.name}</h3>
                <p>{offer.promise}</p>
              </div>
              <a className="button-link" href={`/?service=${encodeURIComponent(offer.name)}`}>
                {page.slug === "pricing" ? "Start request" : "Request this"}
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarketingPage, marketingPages } from "../marketing-pages";

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
          <p className="eyebrow">Free Checkup</p>
          <h2>Start with one page.</h2>
        </div>
        <p className="panel-copy">
          Paste a public website URL, run the report, and use the evidence to decide whether the page needs a quick
          cleanup, a fix plan, or a deeper review.
        </p>
        <a className="button-link" href="/">
          Run Crawler Fleet
        </a>
      </section>
    </main>
  );
}

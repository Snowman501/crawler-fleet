import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarketingPage, marketingPages } from "../marketing-pages";
import { PAID_SERVICES_PAUSED } from "../service-offers";

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
    title: `${page.title} | SL NextGen Web Intel`,
    description: page.description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      type: "website",
      url: `https://questforgeai.vercel.app/${slug}`,
      title: `${page.title} | SL NextGen Web Intel`,
      description: page.description,
    },
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
            Service availability
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
          <h2>Paid services are temporarily paused.</h2>
        </div>
        <p className="panel-copy">
          {PAID_SERVICES_PAUSED
            ? "No paid orders are being accepted through this website while checkout and fulfillment are reviewed. The public website scanner remains free. Please do not purchase through any older Gumroad link."
            : "The free scanner is available."}
        </p>
        <a className="button-link" href="/">Run a free website scan</a>
      </section>
    </main>
  );
}

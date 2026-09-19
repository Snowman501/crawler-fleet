export type ServiceOffer = {
  name: string;
  price: string;
  promise: string;
  request: string;
};

export const serviceOffers: ServiceOffer[] = [
  {
    name: "Quick Fix Review",
    price: "$25",
    promise: "Top 5 fixes from your report, written in plain English.",
    request: "I want the $25 Quick Fix Review for this report.",
  },
  {
    name: "Website Action Plan",
    price: "$75",
    promise: "A step-by-step cleanup plan for SEO basics, trust signals, copy, and lead capture.",
    request: "I want the $75 Website Action Plan for this report.",
  },
  {
    name: "Homepage Cleanup",
    price: "$150",
    promise: "Rewrite and restructure one page so visitors know who you help and what to do next.",
    request: "I want help with a $150 Homepage Cleanup.",
  },
  {
    name: "Lead Path Setup",
    price: "$150+",
    promise: "Plan the contact path, call-to-action, form, and trust links your page needs.",
    request: "I want help setting up a lead path for this website.",
  },
  {
    name: "Launch Check",
    price: "$300+",
    promise: "Audit, fix plan, final checklist, and readiness review before you share or advertise.",
    request: "I want the full small business launch check.",
  },
];

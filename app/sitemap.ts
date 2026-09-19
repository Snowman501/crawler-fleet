import type { MetadataRoute } from "next";
import { marketingPages } from "./marketing-pages";

const baseUrl = "https://questforgeai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    },
    ...marketingPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: page.slug === "free-website-checker" ? 0.9 : 0.75,
    })),
  ];
}

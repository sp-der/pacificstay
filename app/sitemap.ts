import type { MetadataRoute } from "next";
import { listManagedProperties } from "../lib/server/properties";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://pacificstayproperties.com";
  const pages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/stays`, changeFrequency: "weekly", priority: 0.7 },
  ];

  try {
    const properties = await listManagedProperties();
    return [
      ...pages,
      ...properties.map((property) => ({
        url: `${base}/properties/${encodeURIComponent(property.slug)}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // Keep the marketing pages discoverable if the property API is temporarily down.
    return pages;
  }
}

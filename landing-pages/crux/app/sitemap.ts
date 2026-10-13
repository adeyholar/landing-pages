import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) return [];
  return [
    "/",
    "/visit",
    "/groups",
    "/faq",
    "/privacy",
    "/terms",
    "/accessibility",
    "/credits",
  ].map((path) => ({ url: origin.replace(/\/$/, "") + path }));
}

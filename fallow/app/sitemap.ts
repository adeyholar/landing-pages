import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  return origin
    ? [""].map((path) => ({ url: origin.replace(/\/$/, "") + path }))
    : [];
}

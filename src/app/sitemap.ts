import type { MetadataRoute } from "next";

const SITE_URL = "https://founda21.com";

// Public marketing/documentation routes only — authenticated app routes
// (dashboard, admin, founder) are excluded, matching robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/assessment", "/why-us", "/institutions", "/founders", "/provenance", "/terms", "/privacy", "/get-started"];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/admin-login",
        "/account",
        "/login",
        "/auth/",
        "/api/",
      ],
    },
    sitemap: "https://www.irpintennis.com/sitemap.xml",
    host: "https://www.irpintennis.com",
  };
}

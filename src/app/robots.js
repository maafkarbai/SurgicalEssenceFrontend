const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://surgicalessence.com";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/my-account"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

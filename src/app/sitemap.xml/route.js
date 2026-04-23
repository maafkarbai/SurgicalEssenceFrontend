import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://surgicalessence.com";

function xmlEntry({ url, lastModified, changeFrequency, priority }) {
  return [
    "  <url>",
    `    <loc>${url}</loc>`,
    lastModified ? `    <lastmod>${new Date(lastModified).toISOString().split("T")[0]}</lastmod>` : "",
    changeFrequency ? `    <changefreq>${changeFrequency}</changefreq>` : "",
    priority !== undefined ? `    <priority>${priority}</priority>` : "",
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function GET() {
  const [products, pressReleases] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.pressRelease.findMany({
      where: { published: true },
      select: { id: true, slug: true, updatedAt: true },
    }),
  ]);

  const entries = [
    { url: `${BASE_URL}/`,                changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/about`,           changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/contact`,         changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/catalog`,         changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/distributor`,     changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/quality-control`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/press-releases`,  changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE_URL}/sitemap`,         changeFrequency: "monthly", priority: 0.3 },
    ...products.map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    })),
    ...pressReleases.map((pr) => ({
      url: `${BASE_URL}/press-releases/${pr.slug ?? pr.id}`,
      lastModified: pr.updatedAt,
      changeFrequency: "yearly",
      priority: 0.5,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(xmlEntry).join("\n")}\n</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

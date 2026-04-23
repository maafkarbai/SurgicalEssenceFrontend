import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://surgicalessence.com";

export default async function sitemap() {
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

  const staticRoutes = [
    { url: `${BASE_URL}/`,                changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/about`,           changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/contact`,         changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/catalog`,         changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/distributor`,     changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/quality-control`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/press-releases`,  changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE_URL}/site-map`,        changeFrequency: "monthly", priority: 0.3 },
  ];

  const productRoutes = products.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const pressReleaseRoutes = pressReleases.map((pr) => ({
    url: `${BASE_URL}/press-releases/${pr.slug ?? pr.id}`,
    lastModified: pr.updatedAt,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...pressReleaseRoutes];
}

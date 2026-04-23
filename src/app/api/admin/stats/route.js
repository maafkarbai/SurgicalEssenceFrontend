import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET || "dev_secret");
  } catch { return null; }
}

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  try {
    const [
      totalLeads,
      newLeadsThisWeek,
      totalQuotes,
      newQuotesThisWeek,
      activeProducts,
      publishedPressReleases,
      recentLeads,
      recentQuotes,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.quoteRequest.count(),
      prisma.quoteRequest.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.product.count({ where: { active: true } }),
      prisma.pressRelease.count({ where: { published: true } }),
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.quoteRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      }),
    ]);

    return Response.json({
      stats: {
        totalLeads,
        newLeadsThisWeek,
        totalQuotes,
        newQuotesThisWeek,
        activeProducts,
        publishedPressReleases,
      },
      recentLeads,
      recentQuotes,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

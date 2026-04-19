import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: { where: { active: true } } } },
        subcategories: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return Response.json({ categories });
  } catch (err) {
    console.error("[categories/GET]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

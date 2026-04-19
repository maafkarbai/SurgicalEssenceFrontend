import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug, active: true },
      include: {
        category:    { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
        variants:    {
          where: { active: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, sku: true, name: true, description: true, imageUrls: true },
        },
      },
    });

    if (!product) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ product });
  } catch (err) {
    console.error("[products/[slug]/GET]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

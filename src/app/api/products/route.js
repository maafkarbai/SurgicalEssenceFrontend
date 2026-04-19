import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const cat    = searchParams.get("cat")    ?? undefined;
    const search = searchParams.get("search") ?? "";
    const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit  = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 24)));
    const skip   = (page - 1) * limit;

    const where = {
      active: true,
      ...(cat && { category: { slug: cat } }),
      ...(search.trim() && {
        OR: [
          { name:        { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { sku:         { contains: search, mode: "insensitive" } },
          { material:    { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        select: {
          id: true, sku: true, name: true, slug: true,
          description: true, material: true, certifications: true,
          imageUrls: true, featured: true,
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return Response.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[products/GET]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const cat       = searchParams.get("cat")       ?? undefined;
    const subcat    = searchParams.get("subcat")    ?? undefined;
    const search    = (searchParams.get("search")   ?? "").trim();
    const type      = (searchParams.get("type")     ?? "").trim();
    const procedure = (searchParams.get("procedure") ?? "").trim();
    const material  = searchParams.get("material")  ?? "";
    const cert      = searchParams.get("cert")      ?? "";
    const sort      = searchParams.get("sort")      ?? "featured";
    const page      = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit     = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 24)));
    const skip      = (page - 1) * limit;

    const materials = material.split(",").map((s) => s.trim()).filter(Boolean);
    const certs     = cert.split(",").map((s) => s.trim()).filter(Boolean);

    // Each item in andConditions is AND-ed at the top level; within each item is an OR.
    const andConditions = [];

    if (materials.length > 0) {
      andConditions.push({
        OR: materials.map((m) => ({ material: { contains: m, mode: "insensitive" } })),
      });
    }
    if (search) {
      andConditions.push({ OR: [
        { name:        { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku:         { contains: search, mode: "insensitive" } },
        { material:    { contains: search, mode: "insensitive" } },
      ]});
    }
    if (type) {
      andConditions.push({ OR: [
        { name:        { contains: type, mode: "insensitive" } },
        { description: { contains: type, mode: "insensitive" } },
      ]});
    }
    if (procedure) {
      andConditions.push({ OR: [
        { name:        { contains: procedure, mode: "insensitive" } },
        { description: { contains: procedure, mode: "insensitive" } },
        { usage:       { contains: procedure, mode: "insensitive" } },
      ]});
    }

    const where = {
      active: true,
      ...(subcat
        ? { subcategory: { slug: subcat } }
        : cat
        ? { category: { slug: cat } }
        : {}),
      ...(certs.length > 0 && { certifications: { hasSome: certs } }),
      ...(andConditions.length > 0 && { AND: andConditions }),
    };

    const orderBy =
      sort === "newest"    ? [{ createdAt: "desc" }]
      : sort === "name-asc"  ? [{ name: "asc"  }]
      : sort === "name-desc" ? [{ name: "desc" }]
      : [{ featured: "desc" }, { createdAt: "desc" }];

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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

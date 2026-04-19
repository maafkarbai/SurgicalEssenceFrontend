import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { slugify } from "@/lib/slugify";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET || "dev_secret");
  } catch { return null; }
}

// GET /api/admin/products — all products (including inactive)
export async function GET(request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cat    = searchParams.get("cat")    ?? undefined;
  const search = searchParams.get("search") ?? "";
  const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit  = Math.min(100, Number(searchParams.get("limit") ?? 20));

  const where = {
    ...(cat && { category: { slug: cat } }),
    ...(search.trim() && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { sku:  { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { createdAt: "desc" },
        include: { category: { select: { name: true, slug: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    return Response.json({ products, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[admin/products/GET]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

// POST /api/admin/products — create product
export async function POST(request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  try {
    const body = await request.json();
    const { name, sku, description, material, usage, sterilization,
            certifications, imageUrls, pdfUrl, categoryId, subcategoryId,
            active, featured } = body;

    if (!name?.trim()) return Response.json({ error: "Name is required." }, { status: 422 });
    if (!sku?.trim())  return Response.json({ error: "SKU is required."  }, { status: 422 });

    const slug = slugify(name);

    const product = await prisma.product.create({
      data: {
        sku:            sku.trim().toUpperCase(),
        name:           name.trim(),
        slug,
        description:    description?.trim() || null,
        material:       material?.trim()    || null,
        usage:          usage?.trim()       || null,
        sterilization:  sterilization?.trim() || null,
        certifications: Array.isArray(certifications) ? certifications : [],
        imageUrls:      Array.isArray(imageUrls)      ? imageUrls      : [],
        pdfUrl:         pdfUrl?.trim()      || null,
        categoryId:     categoryId          || null,
        subcategoryId:  subcategoryId       || null,
        active:         active  !== false,
        featured:       featured === true,
      },
      include: { category: { select: { name: true, slug: true } } },
    });

    return Response.json({ product }, { status: 201 });
  } catch (err) {
    if (err.code === "P2002") {
      return Response.json({ error: "A product with that SKU or name already exists." }, { status: 409 });
    }
    console.error("[admin/products/POST]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

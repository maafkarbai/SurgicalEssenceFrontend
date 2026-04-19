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

// GET /api/admin/products/[id]
export async function GET(request, { params }) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category:    { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
        variants:    { orderBy: { createdAt: "asc" } },
      },
    });
    if (!product) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ product });
  } catch (err) {
    console.error("[admin/products/[id]/GET]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

// PUT /api/admin/products/[id] — update
export async function PUT(request, { params }) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const { name, sku, description, material, usage, sterilization,
            certifications, imageUrls, pdfUrl, categoryId, subcategoryId,
            active, featured } = body;

    const data = {};
    if (name         !== undefined) { data.name          = name.trim(); data.slug = slugify(name); }
    if (sku          !== undefined)   data.sku            = sku.trim().toUpperCase();
    if (description  !== undefined)   data.description    = description?.trim()  || null;
    if (material     !== undefined)   data.material       = material?.trim()     || null;
    if (usage        !== undefined)   data.usage          = usage?.trim()        || null;
    if (sterilization !== undefined)  data.sterilization  = sterilization?.trim() || null;
    if (certifications !== undefined) data.certifications = Array.isArray(certifications) ? certifications : [];
    if (imageUrls    !== undefined)   data.imageUrls      = Array.isArray(imageUrls) ? imageUrls : [];
    if (pdfUrl       !== undefined)   data.pdfUrl         = pdfUrl?.trim()       || null;
    if (categoryId   !== undefined)   data.categoryId     = categoryId           || null;
    if (subcategoryId !== undefined)  data.subcategoryId  = subcategoryId        || null;
    if (active       !== undefined)   data.active         = Boolean(active);
    if (featured     !== undefined)   data.featured       = Boolean(featured);

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: { select: { name: true, slug: true } } },
    });

    return Response.json({ product });
  } catch (err) {
    if (err.code === "P2025") return Response.json({ error: "Not found." }, { status: 404 });
    if (err.code === "P2002") return Response.json({ error: "SKU or slug already in use." }, { status: 409 });
    console.error("[admin/products/[id]/PUT]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] — soft delete
export async function DELETE(request, { params }) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.product.update({ where: { id }, data: { active: false } });
    return Response.json({ success: true });
  } catch (err) {
    if (err.code === "P2025") return Response.json({ error: "Not found." }, { status: 404 });
    console.error("[admin/products/[id]/DELETE]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

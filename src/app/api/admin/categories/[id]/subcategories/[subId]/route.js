import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try { return jwt.verify(token, process.env.NEXTAUTH_SECRET || "dev_secret"); }
  catch { return null; }
}

// PUT /api/admin/categories/[id]/subcategories/[subId] — patch-style update
export async function PUT(request, { params }) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { subId } = await params; // Next.js v16: params is a Promise

  try {
    const body = await request.json();
    const { name, description, sortOrder, active } = body;
    let { slug } = body;

    const data = {};
    if (name        !== undefined) {
      data.name = name.trim();
      if (slug === undefined) data.slug = slugify(name.trim());
    }
    if (slug        !== undefined) data.slug        = slugify(slug.trim());
    if (description !== undefined) data.description = description?.trim() || null;
    if (sortOrder   !== undefined) data.sortOrder   = Number(sortOrder);
    if (active      !== undefined) data.active      = Boolean(active);

    const subcategory = await prisma.subcategory.update({
      where: { id: subId },
      data,
      include: { _count: { select: { products: true } } },
    });

    return Response.json({ subcategory });
  } catch (err) {
    if (err.code === "P2025") return Response.json({ error: "Subcategory not found." }, { status: 404 });
    if (err.code === "P2002") return Response.json({ error: "Slug already in use." }, { status: 409 });
    console.error("[admin/categories/[id]/subcategories/[subId]/PUT]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id]/subcategories/[subId] — soft delete
export async function DELETE(request, { params }) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { subId } = await params;

  try {
    await prisma.subcategory.update({ where: { id: subId }, data: { active: false } });
    return Response.json({ success: true });
  } catch (err) {
    if (err.code === "P2025") return Response.json({ error: "Subcategory not found." }, { status: 404 });
    console.error("[admin/categories/[id]/subcategories/[subId]/DELETE]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

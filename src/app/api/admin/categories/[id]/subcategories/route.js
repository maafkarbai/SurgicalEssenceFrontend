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

// POST /api/admin/categories/[id]/subcategories — create subcategory under a category
export async function POST(request, { params }) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { id: categoryId } = await params; // Next.js v16: params is a Promise

  try {
    // Verify parent category exists
    const parent = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!parent) return Response.json({ error: "Category not found." }, { status: 404 });

    const body = await request.json();
    const { name, description, sortOrder } = body;
    let { slug } = body;

    if (!name?.trim()) {
      return Response.json({ error: "Name is required." }, { status: 422 });
    }

    slug = slug?.trim() ? slugify(slug.trim()) : slugify(name.trim());

    const subcategory = await prisma.subcategory.create({
      data: {
        name:        name.trim(),
        slug,
        description: description?.trim() || null,
        sortOrder:   Number.isInteger(sortOrder) ? sortOrder : 0,
        categoryId,
      },
      include: { _count: { select: { products: true } } },
    });

    return Response.json({ subcategory }, { status: 201 });
  } catch (err) {
    if (err.code === "P2002") {
      return Response.json({ error: "A subcategory with that slug already exists." }, { status: 409 });
    }
    console.error("[admin/categories/[id]/subcategories/POST]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

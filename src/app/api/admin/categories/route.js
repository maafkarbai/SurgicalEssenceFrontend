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

// GET /api/admin/categories — all categories (active + inactive) with subcategories + product counts
export async function GET() {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: true } },
        subcategories: {
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { products: true } } },
        },
      },
    });
    return Response.json({ categories });
  } catch (err) {
    console.error("[admin/categories/GET]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

// POST /api/admin/categories — create a new category
export async function POST(request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  try {
    const body = await request.json();
    const { name, description, sortOrder } = body;
    let { slug } = body;

    if (!name?.trim()) {
      return Response.json({ error: "Name is required." }, { status: 422 });
    }

    // Always normalise slug server-side
    slug = slug?.trim() ? slugify(slug.trim()) : slugify(name.trim());

    const category = await prisma.category.create({
      data: {
        name:        name.trim(),
        slug,
        description: description?.trim() || null,
        sortOrder:   Number.isInteger(sortOrder) ? sortOrder : 0,
      },
      include: {
        _count: { select: { products: true } },
        subcategories: { orderBy: { sortOrder: "asc" } },
      },
    });

    return Response.json({ category }, { status: 201 });
  } catch (err) {
    if (err.code === "P2002") {
      return Response.json({ error: "A category with that slug already exists." }, { status: 409 });
    }
    console.error("[admin/categories/POST]", err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

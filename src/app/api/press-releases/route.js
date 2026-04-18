import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import DOMPurify from "isomorphic-dompurify";
import { uniqueSlug } from "@/lib/slugify";

// Sanitise plain strings (title, imageUrl)
function sanitise(str) {
  return String(str ?? "").trim();
}

// Sanitise rich HTML content — strips XSS vectors while keeping safe formatting tags
function sanitiseHtml(html) {
  return DOMPurify.sanitize(String(html ?? ""), {
    ALLOWED_TAGS: [
      "p", "br", "strong", "b", "em", "i", "u", "s",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "pre", "code",
      "a", "img", "figure", "figcaption", "hr",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class", "width", "height"],
    ALLOW_DATA_ATTR: false,
  });
}

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET || "dev_secret");
  } catch { return null; }
}

// GET /api/press-releases?page=1&limit=12 — public, published only
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10)));
  const skip  = (page - 1) * limit;

  try {
    const [items, total] = await Promise.all([
      prisma.pressRelease.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true, slug: true, title: true, imageUrl: true,
          publishedAt: true, createdAt: true,
          author: { select: { email: true } },
        },
      }),
      prisma.pressRelease.count({ where: { published: true } }),
    ]);

    return Response.json({
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

// POST /api/press-releases — admin only
export async function POST(request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const body = await request.json();
  const title   = sanitise(body.title);
  const content = sanitiseHtml(body.content);
  const imageUrl    = body.imageUrl    ? sanitise(body.imageUrl)    : null;
  const published   = body.published   === true;

  if (!title)   return Response.json({ error: "Title required." },   { status: 422 });
  if (!content) return Response.json({ error: "Content required." }, { status: 422 });

  try {
    const user = await prisma.user.findUnique({ where: { email: admin.email } });
    if (!user) return Response.json({ error: "Author not found." }, { status: 404 });

    const slug = await uniqueSlug(title, async (s) => {
      const existing = await prisma.pressRelease.findUnique({ where: { slug: s } });
      return !!existing;
    });

    const item = await prisma.pressRelease.create({
      data: {
        slug,
        title,
        content,
        imageUrl,
        published,
        publishedAt: published ? new Date() : null,
        authorId: user.id,
      },
    });
    return Response.json({ data: item }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

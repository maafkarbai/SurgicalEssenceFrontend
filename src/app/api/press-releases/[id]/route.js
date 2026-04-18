import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import DOMPurify from "isomorphic-dompurify";
import { uniqueSlug } from "@/lib/slugify";

function sanitise(str) {
  return String(str ?? "").trim();
}

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

// GET /api/press-releases/[id] — accepts slug or cuid, public if published
export async function GET(request, { params }) {
  const { id } = await params;
  try {
    // Try slug first, fall back to cuid id (for old records with no slug)
    const item = await prisma.pressRelease.findFirst({
      where: { OR: [{ slug: id }, { id }] },
      include: { author: { select: { email: true } } },
    });
    if (!item) return Response.json({ error: "Not found." }, { status: 404 });

    const admin = await getAdmin();
    if (!item.published && !admin) {
      return Response.json({ error: "Not found." }, { status: 404 });
    }

    return Response.json({ data: item });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

// PUT /api/press-releases/[id] — admin only
export async function PUT(request, { params }) {
  const { id } = await params;
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const body = await request.json();
  const title    = sanitise(body.title);
  const content  = sanitiseHtml(body.content);
  const imageUrl = body.imageUrl ? sanitise(body.imageUrl) : null;
  const published = body.published === true;

  if (!title)   return Response.json({ error: "Title required." },   { status: 422 });
  if (!content) return Response.json({ error: "Content required." }, { status: 422 });

  try {
    const existing = await prisma.pressRelease.findUnique({ where: { id } });
    if (!existing) return Response.json({ error: "Not found." }, { status: 404 });

    const publishedAt = published && !existing.published ? new Date() : existing.publishedAt;

    // Backfill slug if missing (old records created before slug feature)
    const slug = existing.slug ?? await uniqueSlug(title, async (s) => {
      const clash = await prisma.pressRelease.findUnique({ where: { slug: s } });
      return !!clash;
    });

    const item = await prisma.pressRelease.update({
      where: { id },
      data: { slug, title, content, imageUrl, published, publishedAt },
    });
    return Response.json({ data: item });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

// DELETE /api/press-releases/[id] — admin only
export async function DELETE(request, { params }) {
  const { id } = await params;
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  try {
    await prisma.pressRelease.delete({ where: { id } });
    return Response.json({ message: "Deleted." });
  } catch (err) {
    if (err.code === "P2025") return Response.json({ error: "Not found." }, { status: 404 });
    console.error(err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

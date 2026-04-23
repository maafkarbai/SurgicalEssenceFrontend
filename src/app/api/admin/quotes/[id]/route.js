import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET || "dev_secret");
  } catch { return null; }
}

const VALID_STATUSES = ["NEW", "CONTACTED", "NEGOTIATION", "CLOSED"];

// GET /api/admin/quotes/[id] — single quote with all items
export async function GET(request, { params }) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  try {
    const quote = await prisma.quoteRequest.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!quote) return Response.json({ error: "Not found." }, { status: 404 });
    return Response.json({ data: quote });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

// PATCH /api/admin/quotes/[id] — update status
export async function PATCH(request, { params }) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { status } = body ?? {};
  if (!status || !VALID_STATUSES.includes(status.toUpperCase())) {
    return Response.json(
      { error: `Status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 422 }
    );
  }

  try {
    const updated = await prisma.quoteRequest.update({
      where: { id },
      data: { status: status.toUpperCase() },
      include: { items: true },
    });
    return Response.json({ data: updated });
  } catch (err) {
    if (err.code === "P2025") return Response.json({ error: "Not found." }, { status: 404 });
    console.error(err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

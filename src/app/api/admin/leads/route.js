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

// GET /api/admin/leads?page=1&limit=25&q=search&country=Pakistan&from=2025-01-01&to=2025-12-31
export async function GET(request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page    = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit   = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)));
  const skip    = (page - 1) * limit;
  const q       = searchParams.get("q")?.trim() ?? "";
  const country = searchParams.get("country")?.trim() ?? "";
  const from    = searchParams.get("from");
  const to      = searchParams.get("to");

  const where = {
    ...(q && {
      OR: [
        { name:    { contains: q, mode: "insensitive" } },
        { email:   { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(country && { country: { equals: country, mode: "insensitive" } }),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to   ? { lte: new Date(new Date(to).setHours(23, 59, 59, 999)) } : {}),
          },
        }
      : {}),
  };

  try {
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return Response.json({
      data: leads,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

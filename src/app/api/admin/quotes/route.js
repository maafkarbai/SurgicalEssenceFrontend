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

// GET /api/admin/quotes?page=1&limit=25&status=NEW&q=search
export async function GET(request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)));
  const skip   = (page - 1) * limit;
  const status = searchParams.get("status")?.trim().toUpperCase() ?? "";
  const q      = searchParams.get("q")?.trim() ?? "";

  const where = {
    ...(status && VALID_STATUSES.includes(status) && { status }),
    ...(q && {
      OR: [
        { name:         { contains: q, mode: "insensitive" } },
        { email:        { contains: q, mode: "insensitive" } },
        { organization: { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  try {
    const [quotes, total] = await Promise.all([
      prisma.quoteRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { items: true },
      }),
      prisma.quoteRequest.count({ where }),
    ]);

    // Status counts for filter tabs
    const statusCounts = await prisma.quoteRequest.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const counts = Object.fromEntries(
      statusCounts.map(({ status: s, _count }) => [s, _count.status])
    );

    return Response.json({
      data: quotes,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      counts,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

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

// GET /api/admin/press-releases — all including drafts
export async function GET() {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  try {
    const items = await prisma.pressRelease.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { email: true } } },
    });
    return Response.json({ data: items });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

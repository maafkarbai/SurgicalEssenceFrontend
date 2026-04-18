import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyBuyerToken } from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("se_buyer")?.value;
    if (!token) return Response.json({ user: null });

    const payload = await verifyBuyerToken(token);
    const user = await prisma.buyerUser.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, company: true, country: true, phone: true },
    });

    return Response.json({ user: user ?? null });
  } catch {
    return Response.json({ user: null });
  }
}

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyBuyerToken } from "@/lib/jwt";
import { sendQuoteEmails } from "@/lib/quoteEmail";

// ─── POST: submit a quote ──────────────────────────────────────────────────────

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, organization, country, message, items } = body;

    if (!name?.trim()) return Response.json({ error: "Name is required." }, { status: 400 });
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return Response.json({ error: "Valid email is required." }, { status: 400 });
    if (!Array.isArray(items) || items.length === 0)
      return Response.json({ error: "Quote cart is empty." }, { status: 400 });

    // Resolve buyer user if authenticated
    let buyerUserId = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("se_buyer")?.value;
      if (token) {
        const payload = await verifyBuyerToken(token);
        buyerUserId = payload.sub ?? null;
      }
    } catch {
      // Not authenticated — quote still accepted
    }

    const quote = await prisma.quoteRequest.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        organization: organization?.trim() || null,
        country: country?.trim() || null,
        message: message?.trim() || null,
        buyerUserId,
        items: {
          create: items.map((item) => ({
            productId:   item.productId,
            productName: item.productName,
            productSku:  item.productSku || null,
            quantity:    Math.max(1, Number(item.quantity) || 1),
            notes:       item.notes?.trim() || null,
          })),
        },
      },
      include: { items: true },
    });

    // Fire-and-forget lead email — never blocks the response
    sendQuoteEmails({
      ...quote,
      createdAt: quote.createdAt.toISOString(),
    }).catch((err) => console.error("[quotes] email error:", err));

    return Response.json({ success: true, quoteId: quote.id }, { status: 201 });
  } catch (err) {
    console.error("[quotes/POST]", err);
    return Response.json({ error: "Failed to submit quote. Please try again." }, { status: 500 });
  }
}

// ─── GET: fetch authenticated user's quote history ────────────────────────────

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("se_buyer")?.value;
    if (!token) return Response.json({ error: "Not authenticated." }, { status: 401 });

    const payload = await verifyBuyerToken(token);
    const quotes = await prisma.quoteRequest.findMany({
      where: { buyerUserId: payload.sub },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ quotes });
  } catch {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }
}

import { prisma } from "@/lib/prisma";

// Basic email format check — full validation happens client-side; this is the boundary guard
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/newsletter — subscribe an email address
export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body?.email?.trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return Response.json({ error: "A valid email address is required." }, { status: 422 });
  }

  try {
    await prisma.subscriber.upsert({
      where:  { email },
      update: { active: true },   // re-activates if they previously unsubscribed
      create: { email },
    });

    return Response.json({ message: "Subscribed successfully." });
  } catch (err) {
    console.error("[newsletter/POST]", err);
    return Response.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signBuyerToken } from "@/lib/jwt";

const DUMMY_HASH = "$2b$12$invalidhashfortimingnormalization000000000000000000000";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password)
      return Response.json({ error: "Email and password are required." }, { status: 400 });

    const user = await prisma.buyerUser.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    // Constant-time comparison even when user not found (prevents enumeration)
    const hash = user?.passwordHash ?? DUMMY_HASH;
    const valid = await bcrypt.compare(password, hash);

    if (!user || !valid)
      return Response.json({ error: "Invalid email or password." }, { status: 401 });

    const token = await signBuyerToken({ sub: user.id, email: user.email });

    const res = Response.json({
      user: { id: user.id, email: user.email, name: user.name, company: user.company, country: user.country },
    });

    const response = new NextResponse(res.body, res);
    response.cookies.set("se_buyer", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("[auth/login]", err);
    return Response.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}

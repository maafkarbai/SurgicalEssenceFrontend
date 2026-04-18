import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signBuyerToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    const { name, email, password, company, country, phone } = await req.json();

    if (!name?.trim()) return Response.json({ error: "Name is required." }, { status: 400 });
    if (!email?.trim()) return Response.json({ error: "Email is required." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return Response.json({ error: "Invalid email address." }, { status: 400 });
    if (!password || password.length < 8)
      return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const existing = await prisma.buyerUser.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) return Response.json({ error: "An account with this email already exists." }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.buyerUser.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        name: name.trim(),
        company: company?.trim() || null,
        country: country?.trim() || null,
        phone: phone?.trim() || null,
      },
    });

    const token = await signBuyerToken({ sub: user.id, email: user.email });

    const res = Response.json({
      user: { id: user.id, email: user.email, name: user.name, company: user.company, country: user.country },
    }, { status: 201 });

    // Set httpOnly cookie
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
    console.error("[auth/register]", err);
    return Response.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}

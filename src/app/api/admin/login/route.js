import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { verifyHcaptcha } from "@/lib/hcaptcha";

export async function POST(request) {
  const { email, password, captchaToken } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "Email and password required." }, { status: 422 });
  }

  const captcha = await verifyHcaptcha(captchaToken);
  if (!captcha.success) {
    return Response.json({ error: captcha.error }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

  const dummy = "$2a$12$invalidhashfortimingreasons000000000000000000000000000";
  const valid = user
    ? await bcrypt.compare(password, user.passwordHash)
    : await bcrypt.compare(password, dummy);

  if (!user || !valid) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.NEXTAUTH_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );

  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return Response.json({ user: { id: user.id, email: user.email, role: user.role } });
}

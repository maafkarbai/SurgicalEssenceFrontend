import { SignJWT, jwtVerify } from "jose";

function secret() {
  const raw = process.env.BUYER_JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!raw) throw new Error("BUYER_JWT_SECRET env var is not set");
  return new TextEncoder().encode(raw);
}

export async function signBuyerToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyBuyerToken(token) {
  const { payload } = await jwtVerify(token, secret());
  return payload;
}

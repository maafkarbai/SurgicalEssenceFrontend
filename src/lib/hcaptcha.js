/**
 * Verify an hCaptcha token server-side.
 * Returns { success: true } or { success: false, error: string }
 */
export async function verifyHcaptcha(token) {
  // Skip verification in development — hCaptcha requires valid keys in production
  if (process.env.NODE_ENV !== "production") return { success: true };

  if (!token) return { success: false, error: "Please complete the CAPTCHA." };

  const res = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret:   process.env.HCAPTCHA_SECRET_KEY ?? "",
      response: token,
    }),
  });

  const data = await res.json();
  if (!data.success) {
    return { success: false, error: "CAPTCHA verification failed. Please try again." };
  }
  return { success: true };
}

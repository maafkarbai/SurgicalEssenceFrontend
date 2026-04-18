import { prisma } from "@/lib/prisma";
import { verifyHcaptcha } from "@/lib/hcaptcha";
import { sendLeadEmails } from "@/lib/email";

// Simple input sanitiser — strips tags and trims whitespace
function sanitise(str) {
  return String(str ?? "").replace(/<[^>]*>/g, "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const ALLOWED_BUSINESS_TYPES = new Set([
  "Distributor", "Hospital", "Clinic", "Supplier",
  "Retailer", "Government / Tender", "Other",
]);

const ALLOWED_CATEGORIES = new Set([
  "Surgical Instruments", "Dental Instruments", "Beauty Care Instruments",
  "Ophthalmic Instruments", "Single Use Instruments", "Multiple / All Categories",
]);

// Basic rate limit: max 5 submissions per IP per 10 minutes (in-memory, resets on redeploy)
const rateMap = new Map(); // ip -> [timestamps]
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const times = (rateMap.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (times.length >= RATE_LIMIT) return true;
  rateMap.set(ip, [...times, now]);
  return false;
}

export async function POST(request) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Too many submissions. Please wait a few minutes before trying again." },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // hCaptcha verification
  const captcha = await verifyHcaptcha(body.captchaToken);
  if (!captcha.success) {
    return Response.json({ error: captcha.error }, { status: 400 });
  }

  const name         = sanitise(body.name);
  const company      = sanitise(body.company);
  const email        = sanitise(body.email).toLowerCase();
  const country      = sanitise(body.country);
  const phone        = sanitise(body.phone);
  const businessType = sanitise(body.businessType);
  const category     = sanitise(body.category);
  const message      = sanitise(body.message);

  // Server-side validation (mirrors client)
  if (!name)
    return Response.json({ error: "Full name is required." }, { status: 422 });
  if (!company)
    return Response.json({ error: "Company name is required." }, { status: 422 });
  if (!email || !isValidEmail(email))
    return Response.json({ error: "A valid email address is required." }, { status: 422 });
  if (!country)
    return Response.json({ error: "Country is required." }, { status: 422 });
  if (!ALLOWED_BUSINESS_TYPES.has(businessType))
    return Response.json({ error: "Invalid business type." }, { status: 422 });
  if (!ALLOWED_CATEGORIES.has(category))
    return Response.json({ error: "Invalid product category." }, { status: 422 });
  if (!message || message.length < 20)
    return Response.json({ error: "Please provide more detail in your message." }, { status: 422 });

  try {
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone:   phone || null,
        company,
        country,
        message: `Business Type: ${businessType}\nCategory: ${category}\n\n${message}`,
      },
    });

    // Fire-and-forget — email failure never blocks the 201 response
    sendLeadEmails({
      ...lead,
      businessType,
      category,
      // Expose raw message separately so the email template can use it cleanly
      message,
    });

    return Response.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Failed to save lead:", err);
    return Response.json(
      { error: "Failed to save your enquiry. Please try again or email us directly." },
      { status: 500 }
    );
  }
}

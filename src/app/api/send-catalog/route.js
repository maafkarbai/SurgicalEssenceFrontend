import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

// Map catalog keys to their actual PDF filenames
const PDF_FILES = {
  surgical:    "surgical.pdf",
  dental:      "dental.pdf",
  beauty:      "beauty.pdf",
  ophthalmic:  "Ophthalmic.pdf",
  "single-use": "singleuse.pdf",
};

const CATALOG_LABELS = {
  surgical:    "Surgical Instruments",
  dental:      "Dental Instruments",
  beauty:      "Beauty Care Instruments",
  ophthalmic:  "Ophthalmic Instruments",
  "single-use": "Single Use Instruments",
};

// Basic email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, catalogKey } = body;

  // Validate inputs
  if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
    return Response.json({ error: "A valid email address is required." }, { status: 400 });
  }

  if (!catalogKey || !PDF_FILES[catalogKey]) {
    return Response.json({ error: "Invalid catalog selection." }, { status: 400 });
  }

  // Locate the PDF on disk
  const pdfFilename = PDF_FILES[catalogKey];
  const pdfPath = path.join(process.cwd(), "public", "documents", pdfFilename);

  if (!fs.existsSync(pdfPath)) {
    return Response.json(
      { error: "Catalog PDF is not available yet. Please try again later." },
      { status: 404 }
    );
  }

  // Check SMTP config
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP environment variables are not configured.");
    return Response.json(
      { error: "Email service is not configured. Please contact us directly." },
      { status: 503 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const catalogLabel = CATALOG_LABELS[catalogKey];
  const recipientEmail = email.trim().toLowerCase();

  try {
    await transporter.sendMail({
      from: `"Surgical Essence" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Your ${catalogLabel} Catalog — Surgical Essence`,
      text: [
        `Thank you for your interest in Surgical Essence.`,
        ``,
        `Please find the ${catalogLabel} catalog attached to this email.`,
        ``,
        `We manufacture high-quality surgical instruments in Sialkot, Pakistan`,
        `and export to healthcare professionals worldwide.`,
        ``,
        `For bulk pricing, custom orders, or any enquiries, please contact us at:`,
        `https://surgicalessence.com/contact`,
        ``,
        `Best regards,`,
        `Surgical Essence Team`,
        `Sialkot, Pakistan`,
      ].join("\n"),
      html: `
        <div style="font-family: 'IBM Plex Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
          <div style="background: #1E3A5F; padding: 32px 40px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">
              Surgical Essence
            </h1>
            <p style="margin: 4px 0 0; color: #bfdbfe; font-size: 13px;">
              Sialkot, Pakistan &mdash; Precision Surgical Instruments
            </p>
          </div>

          <div style="background: #ffffff; padding: 36px 40px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="margin: 0 0 16px; font-size: 15px; color: #374151;">
              Thank you for your interest in Surgical Essence.
            </p>

            <p style="margin: 0 0 24px; font-size: 15px; color: #374151;">
              Please find the <strong style="color: #1E3A5F;">${catalogLabel}</strong> catalog attached to this email.
            </p>

            <div style="background: #f0f4f8; border-left: 4px solid #1E3A5F; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 28px;">
              <p style="margin: 0; font-size: 14px; color: #1e40af; font-weight: 600;">
                Looking for bulk pricing or custom orders?
              </p>
              <p style="margin: 6px 0 0; font-size: 13px; color: #374151;">
                Our team is ready to assist hospitals, distributors, and healthcare businesses worldwide.
              </p>
            </div>

            <a href="https://surgicalessence.com/contact"
              style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none;
                     padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px;">
              Get a Quote
            </a>

            <p style="margin: 32px 0 0; font-size: 13px; color: #6b7280;">
              Best regards,<br>
              <strong style="color: #111827;">Surgical Essence Team</strong><br>
              Sialkot, Pakistan
            </p>
          </div>

          <div style="padding: 16px 40px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
              You received this email because you requested our product catalog at surgicalessence.com.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `${catalogLabel.replace(/ /g, "-")}-Catalog.pdf`,
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to send catalog email:", err);
    return Response.json(
      { error: "Failed to send email. Please try again or download the PDF directly." },
      { status: 500 }
    );
  }
}

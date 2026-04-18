import nodemailer from "nodemailer";

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user, pass },
  });
}

// ─── Admin notification email ──────────────────────────────────────────────

function leadNotificationHtml(lead) {
  const {
    name,
    email,
    phone,
    company,
    country,
    businessType,
    category,
    message,
    createdAt,
  } = lead;

  const date = new Date(createdAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const row = (label, value) =>
    value
      ? `<tr>
           <td style="padding:8px 12px;font-size:13px;color:#6b7280;font-weight:600;
                      white-space:nowrap;vertical-align:top;width:140px;">${label}</td>
           <td style="padding:8px 12px;font-size:13px;color:#111827;">${value}</td>
         </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="background:#1E3A5F;border-radius:12px 12px 0 0;padding:28px 32px;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;
                    text-transform:uppercase;color:#93c5fd;">New Enquiry</p>
          <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ffffff;">
            ${name}
          </h1>
          <p style="margin:4px 0 0;font-size:14px;color:#bfdbfe;">${company} &mdash; ${country}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:28px 32px;">

          <!-- Details table -->
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:collapse;overflow:hidden;">
            ${row("Business type", businessType)}
            ${row("Category", category)}
            ${row("Email", `<a href="mailto:${email}" style="color:#1E3A5F;">${email}</a>`)}
            ${row("Phone", phone ? `<a href="tel:${phone}" style="color:#1E3A5F;">${phone}</a>` : "")}
            ${row("Country", country)}
            ${row("Received", date)}
          </table>

          <!-- Message -->
          <div style="margin-top:20px;background:#f9fafb;border:1px solid #e5e7eb;
                      border-radius:8px;padding:16px 20px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;
                      text-transform:uppercase;color:#9ca3af;">Message</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${message}</p>
          </div>

          <!-- CTA -->
          <div style="margin-top:24px;text-align:center;">
            <a href="mailto:${email}?subject=Re: Your enquiry to Surgical Essence"
               style="display:inline-block;background:#1E3A5F;color:#ffffff;font-weight:700;
                      font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Reply to ${name}
            </a>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;
                        border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">
            Surgical Essence &middot; Sialkot, Pakistan &middot;
            This notification was sent automatically.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Lead confirmation email ───────────────────────────────────────────────

function leadConfirmationHtml(lead) {
  const { name, company } = lead;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="background:#1E3A5F;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">
            We've received your enquiry
          </h1>
          <p style="margin:8px 0 0;font-size:14px;color:#bfdbfe;">
            Our team will get back to you within 24 hours.
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;">Dear ${name},</p>
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
            Thank you for reaching out to Surgical Essence. We've received your enquiry
            from <strong>${company}</strong> and our export team will review it shortly.
          </p>
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
            You can expect a response within <strong>24 hours</strong> with pricing,
            minimum order quantities, and lead time information.
          </p>

          <!-- What's next -->
          <div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:8px;padding:20px 24px;margin:24px 0;">
            <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:1.5px;
                      text-transform:uppercase;color:#3b82f6;">What happens next</p>
            <ol style="margin:0;padding-left:20px;">
              <li style="font-size:14px;color:#1e40af;margin-bottom:8px;line-height:1.5;">
                We match your enquiry to the right product line and pricing tier.
              </li>
              <li style="font-size:14px;color:#1e40af;margin-bottom:8px;line-height:1.5;">
                Our export team sends you a detailed quotation within 24 hours.
              </li>
              <li style="font-size:14px;color:#1e40af;line-height:1.5;">
                We arrange samples if required before bulk ordering.
              </li>
            </ol>
          </div>

          <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
            If you have any urgent questions, feel free to reply to this email or
            contact us on WhatsApp at
            <a href="https://wa.me/923036029756" style="color:#1E3A5F;">+92 303 602 9756</a>.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;
                        border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#374151;">Surgical Essence</p>
          <p style="margin:0;font-size:12px;color:#9ca3af;">Sialkot, Punjab, Pakistan</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Send a lead notification to the admin and a confirmation to the lead.
 * Never throws — email failures are logged but don't break the API response.
 */
export async function sendLeadEmails(lead) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping lead notification.");
    return;
  }

  const from = `"Surgical Essence" <${process.env.EMAIL_FROM}>`;
  const adminTo =
    process.env.LEAD_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;

  const results = await Promise.allSettled([
    // 1. Admin notification
    transporter.sendMail({
      from,
      to: adminTo,
      subject: `New lead: ${lead.name} — ${lead.company} (${lead.country})`,
      html: leadNotificationHtml(lead),
      text: [
        `New enquiry from ${lead.name} at ${lead.company}`,
        `Country: ${lead.country}`,
        `Business type: ${lead.businessType}`,
        `Category: ${lead.category}`,
        `Email: ${lead.email}`,
        lead.phone ? `Phone: ${lead.phone}` : "",
        ``,
        lead.message,
      ]
        .filter(Boolean)
        .join("\n"),
    }),

    // 2. Confirmation to the lead
    transporter.sendMail({
      from,
      to: lead.email,
      subject: "We've received your enquiry — Surgical Essence",
      html: leadConfirmationHtml(lead),
      text: `Dear ${lead.name},\n\nThank you for your enquiry. Our team will get back to you within 24 hours.\n\nSurgical Essence\nSialkot, Pakistan`,
    }),
  ]);

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`[email] Failed to send email #${i + 1}:`, result.reason);
    }
  });
}

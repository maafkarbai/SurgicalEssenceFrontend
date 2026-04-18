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

function itemsTable(items) {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6;">
          ${item.productName}${item.productSku ? ` <span style="color:#9ca3af;">(${item.productSku})</span>` : ""}
        </td>
        <td style="padding:8px 12px;font-size:13px;color:#111827;text-align:center;border-bottom:1px solid #f3f4f6;">
          ${item.quantity}
        </td>
        ${item.notes ? `<td style="padding:8px 12px;font-size:12px;color:#6b7280;border-bottom:1px solid #f3f4f6;">${item.notes}</td>` : `<td style="border-bottom:1px solid #f3f4f6;"></td>`}
      </tr>`
    )
    .join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:collapse;overflow:hidden;margin-top:16px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;
                     letter-spacing:1px;color:#6b7280;text-align:left;">Product</th>
          <th style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;
                     letter-spacing:1px;color:#6b7280;text-align:center;">Qty</th>
          <th style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;
                     letter-spacing:1px;color:#6b7280;text-align:left;">Notes</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function quoteNotificationHtml(quote) {
  const { name, email, phone, organization, country, message, items, createdAt } = quote;
  const date = new Date(createdAt).toLocaleString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
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
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr><td style="background:#1E3A5F;border-radius:12px 12px 0 0;padding:28px 32px;">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#93c5fd;">New Quote Request</p>
          <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;color:#ffffff;">${name}</h1>
          <p style="margin:4px 0 0;font-size:14px;color:#bfdbfe;">${organization || "—"} &mdash; ${country || "—"}</p>
        </td></tr>
        <tr><td style="background:#ffffff;padding:28px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0"
                 style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:collapse;overflow:hidden;">
            ${row("Email", `<a href="mailto:${email}" style="color:#1E3A5F;">${email}</a>`)}
            ${row("Phone", phone ? `<a href="tel:${phone}" style="color:#1E3A5F;">${phone}</a>` : "")}
            ${row("Organisation", organization)}
            ${row("Country", country)}
            ${row("Received", date)}
          </table>
          <p style="margin:20px 0 4px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;">Requested Items</p>
          ${itemsTable(items)}
          ${message ? `
          <div style="margin-top:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;">Message</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${message}</p>
          </div>` : ""}
          <div style="margin-top:24px;text-align:center;">
            <a href="mailto:${email}?subject=Re: Your quote request — Surgical Essence"
               style="display:inline-block;background:#1E3A5F;color:#ffffff;font-weight:700;
                      font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Reply to ${name}
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;
                        border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">Surgical Essence &middot; Sialkot, Pakistan &middot; Automated notification</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function quoteConfirmationHtml(quote) {
  const { name, organization, items } = quote;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="background:#1E3A5F;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
          <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Quote Request Received</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#bfdbfe;">Our team will respond within 24 hours.</p>
        </td></tr>
        <tr><td style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
          <p style="margin:0 0 16px;font-size:15px;color:#374151;">Dear ${name},</p>
          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
            Thank you for your quote request${organization ? ` from <strong>${organization}</strong>` : ""}. Our export team will prepare a detailed quotation for the items below and respond within <strong>24 hours</strong>.
          </p>
          ${itemsTable(items)}
          <div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:8px;padding:20px 24px;margin:24px 0;">
            <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#3b82f6;">What happens next</p>
            <ol style="margin:0;padding-left:20px;">
              <li style="font-size:14px;color:#1e40af;margin-bottom:8px;line-height:1.5;">We review your items and match them to the correct product lines and pricing tiers.</li>
              <li style="font-size:14px;color:#1e40af;margin-bottom:8px;line-height:1.5;">Our export team sends you a detailed quotation within 24 hours.</li>
              <li style="font-size:14px;color:#1e40af;line-height:1.5;">Samples can be arranged before bulk ordering if required.</li>
            </ol>
          </div>
          <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
            Urgent questions? Reply to this email or reach us on WhatsApp:
            <a href="https://wa.me/923036029756" style="color:#1E3A5F;">+92 303 602 9756</a>
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;
                        border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#374151;">Surgical Essence</p>
          <p style="margin:0;font-size:12px;color:#9ca3af;">Sialkot, Punjab, Pakistan</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendQuoteEmails(quote) {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("[quoteEmail] SMTP not configured — skipping.");
    return;
  }

  const from = `"Surgical Essence" <${process.env.EMAIL_FROM}>`;
  const adminTo = process.env.LEAD_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
  const itemsSummary = quote.items.map((i) => `  - ${i.productName} x${i.quantity}`).join("\n");

  const results = await Promise.allSettled([
    transporter.sendMail({
      from,
      to: adminTo,
      subject: `New quote: ${quote.name} — ${quote.organization || quote.email}`,
      html: quoteNotificationHtml(quote),
      text: `New quote from ${quote.name}\nEmail: ${quote.email}\nOrg: ${quote.organization || "—"}\nCountry: ${quote.country || "—"}\n\nItems:\n${itemsSummary}\n\n${quote.message || ""}`,
    }),
    transporter.sendMail({
      from,
      to: quote.email,
      subject: "Your quote request — Surgical Essence",
      html: quoteConfirmationHtml(quote),
      text: `Dear ${quote.name},\n\nWe've received your quote request. Our team will respond within 24 hours.\n\nItems:\n${itemsSummary}\n\nSurgical Essence\nSialkot, Pakistan`,
    }),
  ]);

  results.forEach((r, i) => {
    if (r.status === "rejected")
      console.error(`[quoteEmail] Failed to send email #${i + 1}:`, r.reason);
  });
}

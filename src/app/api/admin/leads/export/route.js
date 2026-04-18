import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET || "dev_secret");
  } catch { return null; }
}

function escapeCell(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Wrap in quotes if the value contains a comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(leads) {
  const headers = ["ID", "Name", "Company", "Email", "Phone", "Country", "Message", "Received At"];
  const rows = leads.map((l) => [
    l.id,
    l.name,
    l.company ?? "",
    l.email,
    l.phone ?? "",
    l.country ?? "",
    l.message,
    new Date(l.createdAt).toISOString(),
  ].map(escapeCell).join(","));

  return [headers.join(","), ...rows].join("\r\n");
}

// GET /api/admin/leads/export?q=&country=&from=&to=
export async function GET(request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q       = searchParams.get("q")?.trim() ?? "";
  const country = searchParams.get("country")?.trim() ?? "";
  const from    = searchParams.get("from");
  const to      = searchParams.get("to");

  const where = {
    ...(q && {
      OR: [
        { name:    { contains: q, mode: "insensitive" } },
        { email:   { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(country && { country: { equals: country, mode: "insensitive" } }),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to   ? { lte: new Date(new Date(to).setHours(23, 59, 59, 999)) } : {}),
          },
        }
      : {}),
  };

  try {
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const csv      = toCSV(leads);
    const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}

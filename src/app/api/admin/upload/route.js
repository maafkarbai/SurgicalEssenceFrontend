import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = "press-releases";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET || "dev_secret");
  } catch { return null; }
}

export async function POST(request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: "Only JPEG, PNG, WebP, or GIF images are allowed." }, { status: 415 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return Response.json({ error: "File must be under 5 MB." }, { status: 413 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, arrayBuffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error(uploadError);
    return Response.json({ error: "Upload failed. " + uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  return Response.json({ url: publicUrl }, { status: 201 });
}

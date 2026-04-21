import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_PDF_TYPES   = ["application/pdf"];
const MAX_IMAGE_SIZE = 5  * 1024 * 1024; // 5 MB
const MAX_PDF_SIZE   = 20 * 1024 * 1024; // 20 MB

const VALID_FOLDERS = ["products", "press-releases", "blog", "banners", "team", "catalogs", "datasheets"];

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET || "dev_secret");
  } catch { return null; }
}

function uploadToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}

export async function POST(request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  const rawFolder = formData.get("folder") ?? "general";
  const folder = VALID_FOLDERS.includes(rawFolder)
    ? `surgical-essence/${rawFolder}`
    : "surgical-essence/general";

  if (!file || typeof file === "string") {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isPdf   = ALLOWED_PDF_TYPES.includes(file.type);

  if (!isImage && !isPdf) {
    return Response.json({ error: "Only JPEG, PNG, WebP, GIF images or PDF files are allowed." }, { status: 415 });
  }

  const maxSize = isPdf ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const limit = isPdf ? "20 MB" : "5 MB";
    return Response.json({ error: `File must be under ${limit}.` }, { status: 413 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const result = await uploadToCloudinary(buffer, {
      folder,
      resource_type: isPdf ? "raw" : "image",
      use_filename:    true,
      unique_filename: true,
    });

    return Response.json({ url: result.secure_url, publicId: result.public_id }, { status: 201 });
  } catch (err) {
    console.error("[admin/upload]", err);
    return Response.json({ error: "Upload failed. " + (err.message ?? "") }, { status: 500 });
  }
}

export async function DELETE(request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { publicId, resourceType = "image" } = await request.json();

  if (!publicId || typeof publicId !== "string") {
    return Response.json({ error: "publicId is required." }, { status: 400 });
  }

  if (!publicId.startsWith("surgical-essence/")) {
    return Response.json({ error: "Cannot delete assets outside this project." }, { status: 403 });
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return Response.json({ success: true });
  } catch (err) {
    console.error("[admin/upload/DELETE]", err);
    return Response.json({ error: "Delete failed." }, { status: 500 });
  }
}

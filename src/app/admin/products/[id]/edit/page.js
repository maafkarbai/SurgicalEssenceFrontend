import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import jwt from "jsonwebtoken";
import ProductForm from "../../ProductForm";

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET || "dev_secret");
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: product ? `Edit ${product.name} | Admin` : "Edit Product | Admin" };
}

export default async function EditProductPage({ params }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category:    { select: { id: true } },
      subcategory: { select: { id: true } },
    },
  });

  if (!product) notFound();

  const initial = {
    id:             product.id,
    name:           product.name,
    sku:            product.sku,
    description:    product.description    ?? "",
    material:       product.material       ?? "",
    usage:          product.usage          ?? "",
    sterilization:  product.sterilization  ?? "",
    certifications: product.certifications,
    imageUrls:      product.imageUrls,
    pdfUrl:         product.pdfUrl         ?? "",
    categoryId:     product.category?.id   ?? "",
    subcategoryId:  product.subcategory?.id ?? "",
    active:         product.active,
    featured:       product.featured,
  };

  return <ProductForm initial={initial} isEdit />;
}

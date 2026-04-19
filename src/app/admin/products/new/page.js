import ProductForm from "../ProductForm";

export const metadata = { title: "New Product | Admin — Surgical Essence" };

export default function NewProductPage() {
  return <ProductForm isEdit={false} />;
}

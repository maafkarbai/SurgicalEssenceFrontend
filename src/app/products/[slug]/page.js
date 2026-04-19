import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AddToQuoteButton from "./AddToQuoteButton";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    select: { name: true, description: true },
  });
  if (!product) return {};
  return {
    title: `${product.name} | Surgical Essence`,
    description: product.description?.slice(0, 155) ?? undefined,
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: {
      category:    { select: { id: true, name: true, slug: true } },
      subcategory: { select: { id: true, name: true, slug: true } },
      variants: {
        where: { active: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, sku: true, name: true, description: true, imageUrls: true },
      },
    },
  });

  if (!product) notFound();

  const mainImage = product.imageUrls?.[0] ?? null;

  const specs = [
    { label: "SKU",           value: product.sku                  },
    { label: "Material",      value: product.material             },
    { label: "Sterilization", value: product.sterilization        },
    { label: "Usage",         value: product.usage                },
    { label: "Category",      value: product.category?.name       },
    { label: "Subcategory",   value: product.subcategory?.name    },
  ].filter((s) => s.value);

  return (
    <div className="bg-bg-page min-h-screen">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <ol className="flex items-center gap-2 text-sm text-text-muted flex-wrap">
          <li>
            <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
          </li>
          <li aria-hidden="true" className="text-text-subtle">/</li>
          <li>
            <Link href="/products" className="hover:text-brand-primary transition-colors">Products</Link>
          </li>
          {product.category && (
            <>
              <li aria-hidden="true" className="text-text-subtle">/</li>
              <li>
                <Link
                  href={`/products?cat=${product.category.slug}`}
                  className="hover:text-brand-primary transition-colors"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true" className="text-text-subtle">/</li>
          <li className="text-text-heading font-semibold truncate max-w-[200px]" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Product hero ── */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Image */}
          <div className="relative aspect-square bg-surface-low rounded-xl overflow-hidden shadow-ambient-sm">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
                  className="w-24 h-24 text-brand-primary/20" aria-hidden="true">
                  <path d="M20 4L8.5 15.5" /><path d="M8.5 15.5L5 19" />
                  <path d="M14 4h6v6" /><path d="M9 9l-5 5" />
                  <circle cx="5" cy="19" r="1" fill="currentColor" stroke="none" />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">

            {/* Title */}
            <div>
              {product.category && (
                <span className="inline-block mb-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-secondary text-brand-primary">
                  {product.category.name}
                </span>
              )}
              <h1 className="font-extrabold text-text-heading leading-tight"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}>
                {product.name}
              </h1>
              {product.description && (
                <p className="mt-3 text-text-body leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Specs table */}
            {specs.length > 0 && (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {specs.map((s, i) => (
                      <tr key={s.label} className={i % 2 === 0 ? "bg-surface-lowest" : "bg-surface-low"}>
                        <td className="px-4 py-2.5 font-semibold text-text-muted w-36 align-top">{s.label}</td>
                        <td className="px-4 py-2.5 text-text-body">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Certifications */}
            {product.certifications?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">
                  Certifications
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert) => (
                    <span
                      key={cert}
                      className="px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-semibold"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="flex gap-3">
              <AddToQuoteButton
                product={{ id: product.id, name: product.name, sku: product.sku }}
              />
              {product.pdfUrl && (
                <a
                  href={product.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded border border-gray-200 text-sm font-semibold text-text-body hover:border-brand-primary hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Datasheet
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Variants ── */}
        {product.variants?.length > 0 && (
          <section aria-labelledby="variants-heading" className="mt-14">
            <h2 id="variants-heading" className="text-xl font-bold text-text-heading mb-5">
              Available Variants
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="bg-surface-lowest rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-ambient-sm transition-shadow"
                >
                  {variant.imageUrls?.[0] && (
                    <div className="relative h-28 rounded-lg overflow-hidden bg-surface-low">
                      <Image
                        src={variant.imageUrls[0]}
                        alt={variant.name}
                        fill
                        className="object-cover"
                        sizes="300px"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-text-heading text-sm">{variant.name}</p>
                    <p className="text-xs text-text-muted mt-0.5 font-mono">{variant.sku}</p>
                  </div>
                  {variant.description && (
                    <p className="text-sm text-text-body leading-relaxed flex-1">{variant.description}</p>
                  )}
                  <AddToQuoteButton
                    product={{ id: variant.id, name: `${product.name} — ${variant.name}`, sku: variant.sku }}
                    compact
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Back link ── */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to all products
          </Link>
        </div>
      </main>
    </div>
  );
}

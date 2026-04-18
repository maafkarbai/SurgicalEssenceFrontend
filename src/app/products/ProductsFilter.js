"use client";

import { useState, useId, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS } from "@/lib/products";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "all",        label: "All Instruments" },
  { key: "surgical",   label: "Surgical"        },
  { key: "dental",     label: "Dental"          },
  { key: "beauty",     label: "Beauty Care"     },
  { key: "ophthalmic", label: "Ophthalmic"      },
];

const CATEGORY_META = {
  surgical:   { badge: "bg-brand-secondary text-brand-primary", icon: <SurgicalIcon />, image: "/images/catalog/SurgicalInstrumentsBanner.png",  bg: "bg-surface-low" },
  dental:     { badge: "bg-brand-secondary text-brand-primary", icon: <ToothIcon />,    image: "/images/catalog/DentalInstrumentsBanner.png",    bg: "bg-surface-low" },
  beauty:     { badge: "bg-brand-secondary text-brand-primary", icon: <BeautyIcon />,   image: "/images/catalog/BeautyInstrumentsBanner.png",   bg: "bg-surface-low" },
  ophthalmic: { badge: "bg-brand-secondary text-brand-primary", icon: <EyeIcon />,      image: "/images/catalog/OpthalmicInstrumentsBanner.png", bg: "bg-surface-low" },
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function SurgicalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-10 h-10 opacity-60">
      <path d="M20 4L8.5 15.5" /><path d="M8.5 15.5L5 19" />
      <path d="M14 4h6v6" /><path d="M9 9l-5 5" />
      <circle cx="5" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ToothIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-10 h-10 opacity-60">
      <path d="M12 2C9 2 6 4 6 7c0 2 .5 3.5 1 5l1 8c.2 1 1 2 2 2h4c1 0 1.8-1 2-2l1-8c.5-1.5 1-3 1-5 0-3-3-5-6-5z" />
    </svg>
  );
}

function BeautyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-10 h-10 opacity-60">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-10 h-10 opacity-60">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ product }) {
  const meta  = CATEGORY_META[product.category];
  const label = CATEGORIES.find((c) => c.key === product.category)?.label ?? product.category;

  return (
    <article className="flex flex-col bg-surface-lowest rounded-md overflow-hidden shadow-ambient-sm hover:shadow-ambient hover:-translate-y-1 transition-all duration-200">
      <div className={`relative h-36 ${meta.bg} overflow-hidden`}>
        {meta.image ? (
          <Image
            src={meta.image}
            alt={`${label} instruments`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            {meta.icon}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
          {label}
        </span>

        <div className="flex-1">
          <h3 className="font-semibold text-text-heading text-base leading-snug">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-text-body leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-text-muted">{product.material}</span>
          <Link
            href="/contact"
            className="text-sm font-semibold text-brand-primary hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-colors"
          >
            Request Quote →
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Filter + Grid (needs useSearchParams → Client Component) ─────────────────

const VALID_CATS = new Set(["surgical", "dental", "beauty", "ophthalmic"]);

function ProductsFilterContent() {
  const searchParams = useSearchParams();
  const catParam     = searchParams.get("cat");
  const initialTab   = VALID_CATS.has(catParam) ? catParam : "all";

  const [activeTab, setActiveTab] = useState(initialTab);
  const tablistId = useId();

  useEffect(() => {
    const cat = searchParams.get("cat");
    setActiveTab(VALID_CATS.has(cat) ? cat : "all");
  }, [searchParams]);

  const filtered = activeTab === "all"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Filter by product category"
        id={tablistId}
        className="flex flex-wrap gap-2 mb-6 pb-4"
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeTab === cat.key;
          const count = cat.key === "all"
            ? PRODUCTS.length
            : PRODUCTS.filter((p) => p.category === cat.key).length;

          return (
            <button
              key={cat.key}
              role="tab"
              aria-selected={isActive}
              aria-controls="product-grid"
              onClick={() => setActiveTab(cat.key)}
              style={isActive ? { background: "linear-gradient(135deg, #003b72, #00529B)" } : {}}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
                isActive
                  ? "text-white shadow-ambient-sm"
                  : "bg-surface-low text-text-body hover:bg-surface-high"
              }`}
            >
              {cat.label}
              <span className={`ml-1.5 text-xs ${isActive ? "text-white/70" : "text-gray-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-sm text-text-muted mb-5" aria-live="polite" aria-atomic="true">
        Showing <span className="font-semibold text-text-heading">{filtered.length}</span> instrument{filtered.length !== 1 ? "s" : ""}
        {activeTab !== "all" && (
          <> in <span className="font-semibold text-text-heading">
            {CATEGORIES.find((c) => c.key === activeTab)?.label}
          </span></>
        )}
      </p>

      {/* Product grid */}
      <div
        id="product-grid"
        role="tabpanel"
        aria-label={`${CATEGORIES.find((c) => c.key === activeTab)?.label} instruments`}
        key={activeTab}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up"
      >
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 rounded-lg px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left" style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Need bulk pricing or custom instruments?
          </h2>
          <p className="mt-1 text-white/80 text-sm max-w-lg leading-relaxed">
            Our export team responds within 24 hours with pricing, MOQ details, and sample availability.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link href="/contact" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white text-brand-primary font-bold text-sm hover:bg-brand-secondary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white shadow-ambient-sm">
            Request a Quote
          </Link>
          <Link href="/catalog" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full glass text-white font-bold text-sm hover:bg-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Download Catalogs
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProductsFilter() {
  return (
    <Suspense>
      <ProductsFilterContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuoteCart } from "@/app/context/QuoteCartContext";

// ─── Category visual metadata (slug → display props) ─────────────────────────

const CAT_META = {
  surgical:     { badge: "bg-brand-secondary text-brand-primary", image: "/images/catalog/SurgicalInstrumentsBanner.png"  },
  dental:       { badge: "bg-brand-secondary text-brand-primary", image: "/images/catalog/DentalInstrumentsBanner.png"    },
  beauty:       { badge: "bg-brand-secondary text-brand-primary", image: "/images/catalog/BeautyInstrumentsBanner.png"   },
  ophthalmic:   { badge: "bg-brand-secondary text-brand-primary", image: "/images/catalog/OpthalmicInstrumentsBanner.png" },
  "single-use": { badge: "bg-teal/10 text-teal",                  image: null                                             },
};

const DEFAULT_META = { badge: "bg-brand-secondary text-brand-primary", image: null };

// ─── Icons ────────────────────────────────────────────────────────────────────

function SurgicalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-10 h-10 opacity-40">
      <path d="M20 4L8.5 15.5" /><path d="M8.5 15.5L5 19" />
      <path d="M14 4h6v6" /><path d="M9 9l-5 5" />
      <circle cx="5" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-surface-lowest rounded-md overflow-hidden shadow-ambient-sm">
      <div className="h-36 skeleton" />
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="w-24 h-5 skeleton rounded-full" />
        <div className="h-5 skeleton rounded w-3/4" />
        <div className="h-4 skeleton rounded w-full" />
        <div className="h-4 skeleton rounded w-2/3" />
        <div className="flex gap-2 mt-1">
          <div className="flex-1 h-9 skeleton rounded" />
          <div className="w-20 h-9 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ product }) {
  const { addItem, setDrawerOpen } = useQuoteCart();
  const catSlug  = product.category?.slug ?? "";
  const meta     = CAT_META[catSlug] ?? DEFAULT_META;
  const catLabel = product.category?.name ?? "";
  const bgImage  = product.imageUrls?.[0] ?? meta.image ?? null;

  const handleAddToQuote = () => {
    addItem({ productId: product.id, name: product.name, sku: product.sku });
    setDrawerOpen(true);
  };

  return (
    <article className="flex flex-col bg-surface-lowest rounded-md overflow-hidden shadow-ambient-sm hover:shadow-ambient hover:-translate-y-1 transition-all duration-200">
      <div className="relative h-36 bg-surface-low overflow-hidden">
        {bgImage ? (
          <Image
            src={bgImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-brand-primary">
            <SurgicalIcon />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        {catLabel && (
          <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full ${meta.badge}`}>
            {catLabel}
          </span>
        )}

        <div className="flex-1">
          <h3 className="font-semibold text-text-heading text-base leading-snug">{product.name}</h3>
          <p className="mt-1 text-sm text-text-body leading-relaxed line-clamp-2">{product.description}</p>
        </div>

        {product.material && (
          <span className="text-xs text-text-muted">{product.material}</span>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToQuote}
            className="flex-1 py-2 rounded text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}
          >
            + Quote
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="px-3 py-2 rounded border border-gray-200 text-sm font-semibold text-brand-primary hover:border-brand-primary hover:bg-brand-secondary/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Filter + Grid (needs useSearchParams → must be wrapped in Suspense) ──────

function ProductsFilterContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();

  const catParam    = searchParams.get("cat")    ?? "";
  const searchParam = searchParams.get("search") ?? "";

  const [categories, setCategories] = useState([]);
  const [products,   setProducts]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState(searchParam);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (catParam)           p.set("cat",    catParam);
    if (searchParam.trim()) p.set("search", searchParam.trim());
    p.set("limit", "24");

    fetch(`/api/products?${p}`)
      .then((r) => r.json())
      .then((d) => { setProducts(d.products ?? []); setTotal(d.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [catParam, searchParam]);

  const createQueryString = useCallback(
    (updates) => {
      const p = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v) p.set(k, v); else p.delete(k);
      }
      return p.toString();
    },
    [searchParams]
  );

  const setTab = (slug) => {
    router.replace(`${pathname}?${createQueryString({ cat: slug })}`, { scroll: false });
  };

  const submitSearch = (e) => {
    e.preventDefault();
    router.replace(`${pathname}?${createQueryString({ search: search.trim() })}`, { scroll: false });
  };

  const clearFilters = () => {
    setSearch("");
    router.replace(pathname, { scroll: false });
  };

  const totalAllProducts = categories.reduce((s, c) => s + (c._count?.products ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search bar */}
      <form onSubmit={submitSearch} className="mb-6">
        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search instruments, SKU, material…"
            aria-label="Search products"
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 bg-surface-lowest text-sm text-text-body placeholder-text-subtle focus:outline-2 focus:outline-brand-primary"
          />
          {search && (
            <button
              type="button"
              onClick={clearFilters}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Category tabs */}
      <div role="tablist" aria-label="Filter by product category" className="flex flex-wrap gap-2 mb-6 pb-4">
        {(() => {
          const isActive = !catParam;
          return (
            <button
              role="tab"
              aria-selected={isActive}
              aria-controls="product-grid"
              onClick={() => setTab("")}
              style={isActive ? { background: "linear-gradient(135deg, #003b72, #00529B)" } : {}}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
                isActive ? "text-white shadow-ambient-sm" : "bg-surface-low text-text-body hover:bg-surface-high"
              }`}
            >
              All Instruments
              <span className={`ml-1.5 text-xs ${isActive ? "text-white/70" : "text-text-muted"}`}>
                {totalAllProducts}
              </span>
            </button>
          );
        })()}

        {categories.map((cat) => {
          const isActive = catParam === cat.slug;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              aria-controls="product-grid"
              onClick={() => setTab(cat.slug)}
              style={isActive ? { background: "linear-gradient(135deg, #003b72, #00529B)" } : {}}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
                isActive ? "text-white shadow-ambient-sm" : "bg-surface-low text-text-body hover:bg-surface-high"
              }`}
            >
              {cat.name}
              <span className={`ml-1.5 text-xs ${isActive ? "text-white/70" : "text-text-muted"}`}>
                {cat._count?.products ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-sm text-text-muted mb-5" aria-live="polite" aria-atomic="true">
        {loading ? "Loading…" : (
          <>
            Showing <span className="font-semibold text-text-heading">{total}</span> instrument{total !== 1 ? "s" : ""}
            {searchParam && (
              <> matching <span className="font-semibold text-text-heading">"{searchParam}"</span></>
            )}
          </>
        )}
      </p>

      {/* Product grid */}
      <div
        id="product-grid"
        role="tabpanel"
        aria-label="Products"
        key={`${catParam}-${searchParam}`}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in-up"
      >
        {loading ? (
          Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
        ) : products.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <p className="text-text-muted text-sm mb-3">No instruments found.</p>
            {(searchParam || catParam) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          products.map((p) => <ProductCard key={p.id} product={p} />)
        )}
      </div>

      {/* Bottom CTA */}
      <div
        className="mt-12 rounded-lg px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left"
        style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}
      >
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Need bulk pricing or custom instruments?
          </h2>
          <p className="mt-1 text-white/80 text-sm max-w-lg leading-relaxed">
            Our export team responds within 24 hours with pricing, MOQ details, and sample availability.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white text-brand-primary font-bold text-sm hover:bg-brand-secondary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white shadow-ambient-sm"
          >
            Request a Quote
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full glass text-white font-bold text-sm hover:bg-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
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

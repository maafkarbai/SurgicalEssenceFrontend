"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuoteCart } from "@/app/context/QuoteCartContext";

// ─── Category visual metadata ─────────────────────────────────────────────────

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

function ChevronRight({ className = "" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="9" y1="18" x2="15" y2="18" />
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

// ─── Product Card ─────────────────────────────────────────────────────────────

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
            className="flex-1 py-2 rounded text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
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

// ─── Format count e.g. 1234 → "1,200+" ───────────────────────────────────────

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000) return `${(Math.floor(n / 100) * 100).toLocaleString()}+`;
  return n.toString();
}

// ─── Category Sidebar ─────────────────────────────────────────────────────────

function CategorySidebar({ categories, catParam, subcatParam, totalAll, onSelectCat, onSelectSubcat }) {
  const [expanded, setExpanded] = useState(() => {
    const s = new Set();
    if (catParam) s.add(catParam);
    return s;
  });

  // Auto-expand parent when catParam or subcatParam changes
  useEffect(() => {
    if (catParam) setExpanded((p) => new Set([...p, catParam]));
  }, [catParam]);

  useEffect(() => {
    if (subcatParam) {
      const parent = categories.find((c) =>
        c.subcategories?.some((s) => s.slug === subcatParam)
      );
      if (parent) setExpanded((p) => new Set([...p, parent.slug]));
    }
  }, [subcatParam, categories]);

  const toggle = (slug) =>
    setExpanded((p) => {
      const n = new Set(p);
      n.has(slug) ? n.delete(slug) : n.add(slug);
      return n;
    });

  const isAllActive = !catParam && !subcatParam;

  return (
    <nav aria-label="Filter by product category">
      {/* Heading */}
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted mb-3 px-1 select-none">
        By Category
      </p>

      {/* All Instruments */}
      <button
        type="button"
        onClick={() => onSelectCat("")}
        aria-current={isAllActive ? "page" : undefined}
        style={isAllActive ? { background: "linear-gradient(135deg, #003b72, #00529B)" } : {}}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
          isAllActive
            ? "text-white shadow-ambient-sm"
            : "text-text-body hover:bg-surface-low"
        }`}
      >
        <span>All Instruments</span>
        <span className={`text-xs tabular-nums ${isAllActive ? "text-white/60" : "text-text-muted"}`}>
          {fmt(totalAll)}
        </span>
      </button>

      {/* Categories list */}
      <ul className="mt-1 space-y-px" role="list">
        {categories.map((cat) => {
          const isCatActive  = catParam === cat.slug && !subcatParam;
          const isExpanded   = expanded.has(cat.slug);
          const hasSubcats   = (cat.subcategories?.length ?? 0) > 0;
          const count        = cat._count?.products ?? 0;

          return (
            <li key={cat.id}>
              {/* Category row */}
              <div
                className={`flex items-center rounded-lg overflow-hidden transition-all duration-150 ${
                  isCatActive ? "shadow-ambient-sm" : "hover:bg-surface-low"
                }`}
                style={isCatActive ? { background: "linear-gradient(135deg, #003b72, #00529B)" } : {}}
              >
                {/* Name + count (clickable) */}
                <button
                  type="button"
                  onClick={() => onSelectCat(cat.slug)}
                  aria-current={isCatActive ? "page" : undefined}
                  className={`flex-1 flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary text-left ${
                    isCatActive ? "text-white" : "text-text-body"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className={`text-xs tabular-nums shrink-0 ${isCatActive ? "text-white/60" : "text-text-muted"}`}>
                    {fmt(count)}
                  </span>
                </button>

                {/* Expand/collapse toggle */}
                {hasSubcats ? (
                  <button
                    type="button"
                    onClick={() => toggle(cat.slug)}
                    aria-label={isExpanded ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
                    aria-expanded={isExpanded}
                    className={`px-2.5 py-2.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-colors ${
                      isCatActive ? "text-white/70 hover:text-white" : "text-text-muted hover:text-text-body"
                    }`}
                  >
                    <ChevronRight className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                  </button>
                ) : (
                  /* Non-expandable arrow indicator */
                  <span
                    aria-hidden="true"
                    className={`px-2.5 py-2.5 transition-opacity duration-150 ${
                      isCatActive ? "opacity-50 text-white" : "opacity-0"
                    }`}
                  >
                    <ChevronRight />
                  </span>
                )}
              </div>

              {/* Subcategories accordion */}
              {hasSubcats && (
                <div
                  aria-hidden={!isExpanded}
                  className={`overflow-hidden transition-all duration-250 ease-in-out ${
                    isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <ul
                    className="ml-4 mt-0.5 mb-1 pl-3 border-l-2 border-gray-100 space-y-px"
                    role="list"
                  >
                    {cat.subcategories.map((sub) => {
                      const isSubActive = subcatParam === sub.slug;
                      return (
                        <li key={sub.id}>
                          <button
                            type="button"
                            onClick={() => onSelectSubcat(sub.slug)}
                            aria-current={isSubActive ? "page" : undefined}
                            className={`w-full text-left px-2.5 py-2 text-sm rounded-md transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
                              isSubActive
                                ? "font-semibold text-brand-primary bg-brand-secondary/50"
                                : "font-medium text-text-body hover:bg-surface-low"
                            }`}
                          >
                            {sub.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ─── Filter + Grid ────────────────────────────────────────────────────────────

function ProductsFilterContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();

  const catParam    = searchParams.get("cat")    ?? "";
  const subcatParam = searchParams.get("subcat") ?? "";
  const searchParam = searchParams.get("search") ?? "";

  const [categories,    setCategories]    = useState([]);
  const [products,      setProducts]      = useState([]);
  const [total,         setTotal]         = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState(searchParam);
  const [mobileSideOpen, setMobileSideOpen] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (subcatParam)        p.set("subcat",  subcatParam);
    else if (catParam)      p.set("cat",     catParam);
    if (searchParam.trim()) p.set("search",  searchParam.trim());
    p.set("limit", "24");

    fetch(`/api/products?${p}`)
      .then((r) => r.json())
      .then((d) => { setProducts(d.products ?? []); setTotal(d.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [catParam, subcatParam, searchParam]);

  const createQS = useCallback(
    (updates) => {
      const p = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v) p.set(k, v); else p.delete(k);
      }
      return p.toString();
    },
    [searchParams]
  );

  const selectCat = (slug) => {
    router.replace(
      `${pathname}?${createQS({ cat: slug, subcat: "" })}`,
      { scroll: false }
    );
    setMobileSideOpen(false);
  };

  const selectSubcat = (slug) => {
    router.replace(
      `${pathname}?${createQS({ subcat: slug, cat: "" })}`,
      { scroll: false }
    );
    setMobileSideOpen(false);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    router.replace(
      `${pathname}?${createQS({ search: search.trim() })}`,
      { scroll: false }
    );
  };

  const clearFilters = () => {
    setSearch("");
    router.replace(pathname, { scroll: false });
  };

  const totalAll = categories.reduce((s, c) => s + (c._count?.products ?? 0), 0);

  // Derive current selection label for breadcrumb
  let activeLabel = "All Instruments";
  if (subcatParam) {
    const parent = categories.find((c) => c.subcategories?.some((s) => s.slug === subcatParam));
    const sub    = parent?.subcategories?.find((s) => s.slug === subcatParam);
    if (sub) activeLabel = `${parent.name} › ${sub.name}`;
  } else if (catParam) {
    const cat = categories.find((c) => c.slug === catParam);
    if (cat) activeLabel = cat.name;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Mobile filter toggle ─────────────────────────────────────────── */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileSideOpen((v) => !v)}
          aria-expanded={mobileSideOpen}
          aria-controls="mobile-category-panel"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-surface-lowest text-sm font-semibold text-text-body hover:bg-surface-low transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          <FilterIcon />
          <span>Categories</span>
          {(catParam || subcatParam) && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full text-white"
              style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}>
              1
            </span>
          )}
          <ChevronRight className={`ml-auto transition-transform duration-200 ${mobileSideOpen ? "rotate-90" : ""}`} />
        </button>

        <div
          id="mobile-category-panel"
          className={`overflow-hidden transition-all duration-250 ease-in-out ${
            mobileSideOpen ? "max-h-150 opacity-100 mt-3" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-4 rounded-xl border border-gray-100 bg-surface-lowest shadow-ambient-sm">
            <CategorySidebar
              categories={categories}
              catParam={catParam}
              subcatParam={subcatParam}
              totalAll={totalAll}
              onSelectCat={selectCat}
              onSelectSubcat={selectSubcat}
            />
          </div>
        </div>
      </div>

      {/* ── Two-column layout ─────────────────────────────────────────────── */}
      <div className="flex gap-8 items-start">

        {/* Sidebar — desktop only, sticky */}
        <aside className="hidden lg:block w-56 xl:w-64 shrink-0">
          <div className="sticky top-24 p-4 rounded-xl border border-gray-100 bg-surface-lowest shadow-ambient-sm">
            <CategorySidebar
              categories={categories}
              catParam={catParam}
              subcatParam={subcatParam}
              totalAll={totalAll}
              onSelectCat={selectCat}
              onSelectSubcat={selectSubcat}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* Search bar */}
          <form onSubmit={submitSearch} className="mb-4">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading transition-colors cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Breadcrumb + results count row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <p className="text-sm font-semibold text-text-heading truncate">{activeLabel}</p>
            <p className="text-sm text-text-muted shrink-0" aria-live="polite" aria-atomic="true">
              {loading ? "Loading…" : (
                <>
                  <span className="font-semibold text-text-heading">{total}</span>
                  {" "}instrument{total !== 1 ? "s" : ""}
                  {searchParam && (
                    <> &mdash; <span className="italic">"{searchParam}"</span></>
                  )}
                  {(catParam || subcatParam) && !searchParam && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="ml-2 text-xs text-brand-primary hover:text-brand-dark transition-colors cursor-pointer font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Product grid */}
          <div
            id="product-grid"
            role="region"
            aria-label="Products"
            key={`${catParam}-${subcatParam}-${searchParam}`}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in-up"
          >
            {loading ? (
              Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
            ) : products.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <p className="text-text-muted text-sm mb-3">No instruments found.</p>
                {(searchParam || catParam || subcatParam) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              products.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA — full width */}
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

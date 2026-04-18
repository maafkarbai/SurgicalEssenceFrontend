"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PRODUCTS, CATEGORY_LABELS } from "@/lib/products";

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: "all", label: "All Instruments", short: "All" },
  { key: "surgical", label: "Surgical", short: "Surgical" },
  { key: "dental", label: "Dental", short: "Dental" },
  { key: "beauty", label: "Beauty Care", short: "Beauty" },
  { key: "ophthalmic", label: "Ophthalmic", short: "Ophthalmic" },
  { key: "single-use", label: "Single Use", short: "Single Use" },
];

// Subtle category accent colors for card top-border
const CAT_ACCENT = {
  surgical: "#0168b3",
  dental: "#0891b2",
  beauty: "#be185d",
  ophthalmic: "#6d28d9",
  "single-use": "#b45309",
};

function countFor(key) {
  if (key === "all") return PRODUCTS.length;
  return PRODUCTS.filter((p) => p.category === key).length;
}

// ─── Category icons ───────────────────────────────────────────────────────────

const CAT_ICONS = {
  all: (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="6" height="6" rx="1" />
      <rect x="12" y="2" width="6" height="6" rx="1" />
      <rect x="2" y="12" width="6" height="6" rx="1" />
      <rect x="12" y="12" width="6" height="6" rx="1" />
    </svg>
  ),
  surgical: (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M16 3L7 12" />
      <path d="M7 12L5 15" />
      <path d="M12 3h4v4" />
      <path d="M7.5 7.5L4 11" />
      <circle cx="4" cy="16" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  ),
  dental: (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M10 2C7.5 2 5 3.8 5 6.5c0 1.6.4 2.8.8 4L7 17c.2.8.8 1.5 1.6 1.5h2.8c.8 0 1.4-.7 1.6-1.5l1.2-6.5c.4-1.2.8-2.4.8-4C15 3.8 12.5 2 10 2z" />
    </svg>
  ),
  beauty: (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M10 2L5 7v5l5 6 5-6V7L10 2z" />
      <path d="M5 7h10" />
    </svg>
  ),
  ophthalmic: (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M1 10s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  ),
  "single-use": (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M10 2v10" />
      <path d="M7 5l3-3 3 3" />
      <path d="M5 12h10l-1.5 6h-7L5 12z" />
    </svg>
  ),
};

// ─── Check icon ───────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-brand-primary"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }) {
  const [added, setAdded] = useState(false);
  const accent = CAT_ACCENT[product.category] ?? "#0168b3";
  const catLabel = CATEGORY_LABELS[product.category] ?? product.category;

  function handleAdd() {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article
      className="group flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
      style={{ borderTopColor: accent, borderTopWidth: "3px" }}
    >
      {/* Image */}
      <div className="relative h-44 bg-gray-50 border-b border-gray-100 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name */}
        <h3 className="font-bold text-gray-900 text-base leading-snug">
          {product.name}
        </h3>

        {/* SKU + Material */}
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400 font-medium">
            SKU:{" "}
            <span className="font-semibold text-gray-500">{product.sku}</span>
          </p>
          <p className="text-xs text-gray-500">{product.material}</p>
        </div>

        {/* Category chip */}
        <span
          className="self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded"
          style={{ background: `${accent}12`, color: accent }}
        >
          {catLabel}
        </span>

        {/* Certifications */}
        <ul className="space-y-1.5">
          {product.certifications.map((cert) => (
            <li
              key={cert}
              className="flex items-center gap-1.5 text-xs text-gray-600"
            >
              <CheckIcon />
              {cert}
            </li>
          ))}
        </ul>

        {/* Add to Quote */}
        <button
          type="button"
          onClick={handleAdd}
          className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
            added
              ? "bg-green-600 text-white"
              : "bg-brand-primary hover:bg-brand-dark text-white"
          }`}
        >
          {added ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added to Quote
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Add to Quote
            </>
          )}
        </button>
      </div>
    </article>
  );
}

// ─── Product Browser ──────────────────────────────────────────────────────────

const PAGE_SIZE = 6;

export default function ProductBrowser() {
  const [active, setActive] = useState("all");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const searchTerm = search.trim().toLowerCase();

  const filtered = (
    active === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active)
  ).filter(
    (p) =>
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm) ||
      (p.description ?? "").toLowerCase().includes(searchTerm),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  const activeCat = CATEGORIES.find((c) => c.key === active);
  const viewAllHref =
    active === "all" ? "/products" : `/products?cat=${active}`;

  function switchCategory(key) {
    setActive(key);
    setPage(0);
  }

  return (
    <section
      aria-labelledby="products-browser-heading"
      className="bg-slate-50 border-t-2 border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* ── Section header ── */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div className="border-l-4 border-brand-primary pl-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-brand-primary mb-0.5">
              Instrument Range
            </p>
            <h2
              id="products-browser-heading"
              className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight"
            >
              Browse Products
            </h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Full range
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <div className="hidden sm:block relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search instruments…"
                aria-label="Search instruments"
                className="w-72 pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-500 bg-white placeholder:text-gray-500 text-gray-900 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ── Mobile: horizontal category pills ── */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-5 -mx-4 px-4">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => switchCategory(cat.key)}
                aria-pressed={isActive}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-brand-primary text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary"
                }`}
              >
                <span className={isActive ? "text-white" : "text-gray-400"}>
                  {CAT_ICONS[cat.key]}
                </span>
                {cat.short}
                <span
                  className={`text-[10px] font-bold ${isActive ? "text-white/70" : "text-gray-400"}`}
                >
                  {countFor(cat.key)}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Desktop: sidebar + grid ── */}
        <div className="flex gap-7 lg:gap-8 items-start">
          {/* Left: sticky category sidebar */}
          <aside
            className="hidden md:flex flex-col w-48 lg:w-52 shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4"
            aria-label="Filter by category"
          >
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Categories
              </p>
            </div>
            <nav className="p-2 flex flex-col gap-0.5">
              {CATEGORIES.map((cat) => {
                const isActive = active === cat.key;
                const count = countFor(cat.key);
                return (
                  <button
                    key={cat.key}
                    onClick={() => switchCategory(cat.key)}
                    aria-pressed={isActive}
                    className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-100 text-left ${
                      isActive
                        ? "bg-brand-primary text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={isActive ? "text-white/80" : "text-gray-400"}
                      >
                        {CAT_ICONS[cat.key]}
                      </span>
                      {cat.label}
                    </span>
                    <span
                      className={`text-[11px] font-bold tabular-nums ${
                        isActive ? "text-white/60" : "text-gray-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar CTA */}
            <div className="p-3 mt-1 border-t border-gray-100">
              <Link
                href="/contact"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                Request a Quote
              </Link>
            </div>
          </aside>

          {/* Right: product grid */}
          <div className="flex-1 min-w-0">
            {/* Results label */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">
                <span className="font-bold text-gray-800">
                  {filtered.length}
                </span>{" "}
                instrument{filtered.length !== 1 ? "s" : ""}
                {active !== "all" && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="font-semibold text-gray-700">
                      {activeCat?.label}
                    </span>
                  </>
                )}
                {totalPages > 1 && (
                  <>
                    {" "}
                    · page{" "}
                    <span className="font-semibold text-gray-700">
                      {page + 1}
                    </span>{" "}
                    of {totalPages}
                  </>
                )}
              </p>
              <Link
                href={viewAllHref}
                className="sm:hidden text-xs font-semibold text-brand-primary hover:underline"
              >
                View all →
              </Link>
            </div>

            {/* Grid */}
            <div
              key={`${active}-${page}`}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 animate-fade-in-up"
            >
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  aria-label="Previous page"
                  className="flex items-center justify-center w-8 h-8 rounded border border-gray-200 text-gray-500 hover:border-brand-primary hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i)}
                    aria-label={`Page ${i + 1}`}
                    aria-current={page === i ? "page" : undefined}
                    className={`w-8 h-8 rounded border text-xs font-bold transition-colors ${
                      page === i
                        ? "bg-brand-primary border-brand-primary text-white"
                        : "border-gray-200 text-gray-600 hover:border-brand-primary hover:text-brand-primary"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages - 1}
                  aria-label="Next page"
                  className="flex items-center justify-center w-8 h-8 rounded border border-gray-200 text-gray-500 hover:border-brand-primary hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            )}

            {/* Bottom CTA row */}
            <div className="mt-6 pt-5 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                Can&apos;t find a specific instrument? Our team can source any
                surgical, dental or ophthalmic tool.
              </p>
              <div className="flex gap-3 shrink-0">
                <Link
                  href={viewAllHref}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-brand-primary text-brand-primary font-bold text-xs hover:bg-brand-primary hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  View all {activeCat?.label}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-primary text-white font-bold text-xs hover:bg-brand-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  Get a Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

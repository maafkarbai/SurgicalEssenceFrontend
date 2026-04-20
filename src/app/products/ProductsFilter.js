"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuoteCart } from "@/app/context/QuoteCartContext";

// ─── Static catalog data ──────────────────────────────────────────────────────

const SPECIALTIES = [
  { label: "General Surgery",             slug: "general-surgery",        cat: "surgical",  count: "2,300+" },
  { label: "Orthopedic Instruments",      slug: "orthopedic",             cat: "surgical",  count: "1,800+" },
  { label: "Gynecology Instruments",      slug: "gynecology",             cat: "surgical",  count: "950+"   },
  { label: "Dental Instruments",          slug: "dental-instruments",     cat: "dental",    count: "1,200+" },
  { label: "Cardiovascular Instruments",  slug: "cardiovascular",         cat: "surgical",  count: "600+"   },
  { label: "Neurosurgery Instruments",    slug: "neurosurgery",           cat: "surgical",  count: "450+"   },
  { label: "ENT Instruments",             slug: "ent",                    cat: "surgical",  count: "700+"   },
  { label: "Urology Instruments",         slug: "urology",                cat: "surgical",  count: "500+"   },
  { label: "Plastic Surgery Instruments", slug: "plastic-surgery",        cat: "surgical",  count: "350+"   },
  { label: "Veterinary Instruments",      slug: "veterinary",             cat: "surgical",  count: "400+"   },
];

const INSTRUMENT_TYPES = [
  { label: "Forceps",            slug: "forceps",        count: "1,245" },
  { label: "Scissors",           slug: "scissors",       count: "980"   },
  { label: "Retractors",         slug: "retractors",     count: "620"   },
  { label: "Needle Holders",     slug: "needle-holders", count: "540"   },
  { label: "Clamps & Hemostats", slug: "clamps",         count: "870"   },
  { label: "Dilators",           slug: "dilators"                       },
  { label: "Speculums",          slug: "speculums"                      },
  { label: "Probes",             slug: "probes"                         },
  { label: "Elevators",          slug: "elevators"                      },
  { label: "Suction Tubes",      slug: "suction-tubes"                  },
];

const PROCEDURES = [
  { label: "Suturing & Stitching",  slug: "suturing"          },
  { label: "Cutting & Dissection",  slug: "cutting"           },
  { label: "Grasping & Holding",    slug: "grasping"          },
  { label: "Clamping & Occluding",  slug: "clamping"          },
  { label: "Retracting & Exposure", slug: "retracting"        },
  { label: "Bone Surgery",          slug: "bone"              },
  { label: "Dental Extraction",     slug: "dental-extraction" },
  { label: "Laparoscopic Surgery",  slug: "laparoscopic"      },
  { label: "Minor Surgery Kits",    slug: "minor-surgery"     },
];

const MATERIAL_OPTIONS = ["Stainless Steel", "Titanium", "Tungsten Carbide"];

const CERT_OPTIONS = [
  { label: "CE Certified",              value: "CE Certified"              },
  { label: "ISO 13485 Compliant",       value: "ISO 13485 Compliant"       },
  { label: "Reusable / Sterilizable",   value: "Reusable / Sterilizable"   },
  { label: "Autoclavable",              value: "Sterilizable"              },
];

const SORT_OPTIONS = [
  { value: "featured",  label: "Best Selling"  },
  { value: "newest",    label: "New Arrivals"  },
  { value: "name-asc",  label: "Name A → Z"   },
  { value: "name-desc", label: "Name Z → A"   },
];

// Specialties whose filter is cat= (not subcat=)
const CAT_BASED = new Set(["dental", "beauty", "ophthalmic", "single-use"]);

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

function ChevronDown({ className = "" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className={className}>
      <polyline points="6 9 12 15 18 9" />
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

function XIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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
          <Image src={bgImage} alt={product.name} fill className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
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

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-secondary text-brand-primary text-xs font-semibold shrink-0 border border-brand-primary/20">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="hover:text-brand-dark transition-colors cursor-pointer leading-none"
      >
        <XIcon size={10} />
      </button>
    </span>
  );
}

// ─── Sidebar Section (smooth grid-trick animation) ────────────────────────────

function SidebarSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-0.5 border-t border-gray-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-1 py-2.5 cursor-pointer focus-visible:outline-none group"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted group-hover:text-text-heading transition-colors">
          {title}
        </span>
        <ChevronDown className={`text-text-muted group-hover:text-text-heading transition-all duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {/* CSS grid trick for smooth height animation */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 0.2s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div className="pb-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Item ─────────────────────────────────────────────────────────────

function SidebarItem({ label, count, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      style={isActive ? { background: "linear-gradient(135deg, #003b72, #00529B)" } : {}}
      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
        isActive
          ? "font-semibold text-white shadow-ambient-sm"
          : "font-medium text-text-body hover:bg-surface-low"
      }`}
    >
      <span className="truncate text-left">{label}</span>
      {count && (
        <span className={`text-xs tabular-nums shrink-0 ${isActive ? "text-white/60" : "text-text-muted"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

function FilterSidebar({
  catParam, subcatParam, typeParam, procedureParam,
  materials, certs, totalAll,
  onClearCats, onSelectSpecialty, onSelectType, onSelectProcedure,
  onToggleMaterial, onToggleCert,
}) {
  const isAllActive = !catParam && !subcatParam && !typeParam && !procedureParam;

  return (
    <nav aria-label="Product filters">
      {/* Title */}
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted mb-2 px-1 select-none">
        By Category
      </p>

      {/* All Instruments */}
      <button
        type="button"
        onClick={onClearCats}
        aria-current={isAllActive ? "page" : undefined}
        style={isAllActive ? { background: "linear-gradient(135deg, #003b72, #00529B)" } : {}}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
          isAllActive ? "text-white shadow-ambient-sm" : "text-text-body hover:bg-surface-low"
        }`}
      >
        <span>All Instruments</span>
        <span className={`text-xs tabular-nums ${isAllActive ? "text-white/60" : "text-text-muted"}`}>
          {totalAll > 0 ? totalAll.toLocaleString() : "—"}
        </span>
      </button>

      {/* ── BY SPECIALTY ── */}
      <SidebarSection title="By Specialty" defaultOpen>
        <ul className="space-y-px" role="list">
          {SPECIALTIES.map((s) => {
            const isActive = CAT_BASED.has(s.cat)
              ? catParam === s.cat
              : subcatParam === s.slug;
            return (
              <li key={s.slug}>
                <SidebarItem
                  label={s.label}
                  count={s.count}
                  isActive={isActive}
                  onClick={() => onSelectSpecialty(s)}
                />
              </li>
            );
          })}
        </ul>
      </SidebarSection>

      {/* ── BY INSTRUMENT TYPE ── */}
      <SidebarSection title="By Instrument Type">
        <ul className="space-y-px" role="list">
          {INSTRUMENT_TYPES.map((t) => (
            <li key={t.slug}>
              <SidebarItem
                label={t.label}
                count={t.count}
                isActive={typeParam === t.slug}
                onClick={() => onSelectType(t.slug)}
              />
            </li>
          ))}
        </ul>
      </SidebarSection>

      {/* ── BY PROCEDURE / USAGE ── */}
      <SidebarSection title="By Procedure / Usage">
        <ul className="space-y-px" role="list">
          {PROCEDURES.map((p) => (
            <li key={p.slug}>
              <SidebarItem
                label={p.label}
                isActive={procedureParam === p.slug}
                onClick={() => onSelectProcedure(p.slug)}
              />
            </li>
          ))}
        </ul>
      </SidebarSection>

      {/* ── REFINE divider ── */}
      <div className="mt-4 mb-1 border-t-2 border-gray-100" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1 pt-1 select-none">
        Refine Results
      </p>

      {/* ── MATERIAL ── */}
      <SidebarSection title="Material">
        <div className="space-y-0.5 px-1">
          {MATERIAL_OPTIONS.map((m) => (
            <label
              key={m}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-surface-low transition-colors"
            >
              <input
                type="checkbox"
                checked={materials.includes(m)}
                onChange={() => onToggleMaterial(m)}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#003b72]"
              />
              <span className="text-sm text-text-body select-none">{m}</span>
            </label>
          ))}
        </div>
      </SidebarSection>

      {/* ── CERTIFICATION ── */}
      <SidebarSection title="Certification">
        <div className="space-y-0.5 px-1">
          {CERT_OPTIONS.map(({ label, value }) => (
            <label
              key={value}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-surface-low transition-colors"
            >
              <input
                type="checkbox"
                checked={certs.includes(value)}
                onChange={() => onToggleCert(value)}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-[#003b72]"
              />
              <span className="text-sm text-text-body select-none">{label}</span>
            </label>
          ))}
        </div>
      </SidebarSection>
    </nav>
  );
}

// ─── Main filter + grid ───────────────────────────────────────────────────────

function ProductsFilterContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();

  const catParam       = searchParams.get("cat")       ?? "";
  const subcatParam    = searchParams.get("subcat")    ?? "";
  const typeParam      = searchParams.get("type")      ?? "";
  const procedureParam = searchParams.get("procedure") ?? "";
  const searchParam    = searchParams.get("search")    ?? "";
  const materialParam  = searchParams.get("material")  ?? "";
  const certParam      = searchParams.get("cert")      ?? "";
  const sortParam      = searchParams.get("sort")      ?? "featured";

  const materials = materialParam ? materialParam.split(",").filter(Boolean) : [];
  const certs     = certParam     ? certParam.split(",").filter(Boolean)     : [];

  const [categories,     setCategories]     = useState([]);
  const [products,       setProducts]       = useState([]);
  const [total,          setTotal]          = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState(searchParam);
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
    if (subcatParam)         p.set("subcat",     subcatParam);
    else if (catParam)       p.set("cat",        catParam);
    if (typeParam)           p.set("type",       typeParam);
    if (procedureParam)      p.set("procedure",  procedureParam);
    if (searchParam.trim())  p.set("search",     searchParam.trim());
    if (materialParam)       p.set("material",   materialParam);
    if (certParam)           p.set("cert",       certParam);
    if (sortParam !== "featured") p.set("sort",  sortParam);
    p.set("limit", "24");

    fetch(`/api/products?${p}`)
      .then((r) => r.json())
      .then((d) => { setProducts(d.products ?? []); setTotal(d.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [catParam, subcatParam, typeParam, procedureParam, searchParam, materialParam, certParam, sortParam]);

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

  const totalAll = categories.reduce((s, c) => s + (c._count?.products ?? 0), 0);

  // ── Navigation helpers ──
  const clearCatFilters = () => {
    router.replace(`${pathname}?${createQS({ cat: "", subcat: "", type: "", procedure: "" })}`, { scroll: false });
    setMobileSideOpen(false);
  };

  const selectSpecialty = (s) => {
    const updates = CAT_BASED.has(s.cat)
      ? { cat: s.cat, subcat: "", type: "", procedure: "" }
      : { subcat: s.slug, cat: "", type: "", procedure: "" };
    router.replace(`${pathname}?${createQS(updates)}`, { scroll: false });
    setMobileSideOpen(false);
  };

  const selectType = (slug) => {
    const isActive = typeParam === slug;
    router.replace(
      `${pathname}?${createQS({ type: isActive ? "" : slug, cat: "", subcat: "", procedure: "" })}`,
      { scroll: false }
    );
    setMobileSideOpen(false);
  };

  const selectProcedure = (slug) => {
    const isActive = procedureParam === slug;
    router.replace(
      `${pathname}?${createQS({ procedure: isActive ? "" : slug, cat: "", subcat: "", type: "" })}`,
      { scroll: false }
    );
    setMobileSideOpen(false);
  };

  const toggleMaterial = (m) => {
    const next = materials.includes(m) ? materials.filter((x) => x !== m) : [...materials, m];
    router.replace(`${pathname}?${createQS({ material: next.join(",") })}`, { scroll: false });
  };

  const toggleCert = (v) => {
    const next = certs.includes(v) ? certs.filter((x) => x !== v) : [...certs, v];
    router.replace(`${pathname}?${createQS({ cert: next.join(",") })}`, { scroll: false });
  };

  const submitSearch = (e) => {
    e.preventDefault();
    router.replace(`${pathname}?${createQS({ search: search.trim() })}`, { scroll: false });
  };

  const clearAll = () => {
    setSearch("");
    router.replace(pathname, { scroll: false });
  };

  // ── Active filter count (for mobile badge) ──
  const activeCount = [catParam, subcatParam, typeParam, procedureParam, ...materials, ...certs, searchParam]
    .filter(Boolean).length;

  // ── Current selection label ──
  let activeLabel = "All Instruments";
  if (typeParam) {
    activeLabel = INSTRUMENT_TYPES.find((t) => t.slug === typeParam)?.label ?? typeParam;
  } else if (procedureParam) {
    activeLabel = PROCEDURES.find((p) => p.slug === procedureParam)?.label ?? procedureParam;
  } else if (subcatParam) {
    activeLabel = SPECIALTIES.find((s) => s.slug === subcatParam)?.label ?? subcatParam;
  } else if (catParam) {
    activeLabel =
      SPECIALTIES.find((s) => CAT_BASED.has(s.cat) && s.cat === catParam)?.label ??
      categories.find((c) => c.slug === catParam)?.name ??
      catParam;
  }

  // ── Chips data ──
  const chips = [
    ...(subcatParam
      ? [{ key: "subcat", label: SPECIALTIES.find((s) => s.slug === subcatParam)?.label ?? subcatParam, clear: () => router.replace(`${pathname}?${createQS({ subcat: "" })}`, { scroll: false }) }]
      : catParam
      ? [{ key: "cat", label: SPECIALTIES.find((s) => CAT_BASED.has(s.cat) && s.cat === catParam)?.label ?? catParam, clear: () => router.replace(`${pathname}?${createQS({ cat: "" })}`, { scroll: false }) }]
      : []),
    ...(typeParam ? [{ key: "type", label: INSTRUMENT_TYPES.find((t) => t.slug === typeParam)?.label ?? typeParam, clear: () => router.replace(`${pathname}?${createQS({ type: "" })}`, { scroll: false }) }] : []),
    ...(procedureParam ? [{ key: "proc", label: PROCEDURES.find((p) => p.slug === procedureParam)?.label ?? procedureParam, clear: () => router.replace(`${pathname}?${createQS({ procedure: "" })}`, { scroll: false }) }] : []),
    ...materials.map((m) => ({ key: `mat-${m}`, label: m, clear: () => toggleMaterial(m) })),
    ...certs.map((c) => ({ key: `cert-${c}`, label: CERT_OPTIONS.find((o) => o.value === c)?.label ?? c, clear: () => toggleCert(c) })),
    ...(searchParam ? [{ key: "search", label: `"${searchParam}"`, clear: () => { setSearch(""); router.replace(`${pathname}?${createQS({ search: "" })}`, { scroll: false }); } }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Mobile filter toggle ────────────────────────────────────────────── */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileSideOpen((v) => !v)}
          aria-expanded={mobileSideOpen}
          aria-controls="mobile-filter-panel"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-surface-lowest text-sm font-semibold text-text-body hover:bg-surface-low transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          <FilterIcon />
          <span>Filters & Categories</span>
          {activeCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs rounded-full text-white"
              style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}>
              {activeCount}
            </span>
          )}
          <ChevronDown className={`ml-auto transition-transform duration-200 ${mobileSideOpen ? "rotate-180" : ""}`} />
        </button>

        <div
          id="mobile-filter-panel"
          style={{
            display: "grid",
            gridTemplateRows: mobileSideOpen ? "1fr" : "0fr",
            transition: "grid-template-rows 0.25s ease",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <div className="mt-3 p-4 rounded-xl border border-gray-100 bg-surface-lowest shadow-ambient-sm">
              <FilterSidebar
                catParam={catParam} subcatParam={subcatParam}
                typeParam={typeParam} procedureParam={procedureParam}
                materials={materials} certs={certs} totalAll={totalAll}
                onClearCats={clearCatFilters} onSelectSpecialty={selectSpecialty}
                onSelectType={selectType} onSelectProcedure={selectProcedure}
                onToggleMaterial={toggleMaterial} onToggleCert={toggleCert}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <div className="flex gap-8 items-start">

        {/* Sidebar — sticky on desktop */}
        <aside className="hidden lg:block w-60 xl:w-68 shrink-0">
          <div className="sticky top-24 p-4 rounded-xl border border-gray-100 bg-surface-lowest shadow-ambient-sm max-h-[calc(100vh-7rem)] overflow-y-auto">
            <FilterSidebar
              catParam={catParam} subcatParam={subcatParam}
              typeParam={typeParam} procedureParam={procedureParam}
              materials={materials} certs={certs} totalAll={totalAll}
              onClearCats={clearCatFilters} onSelectSpecialty={selectSpecialty}
              onSelectType={selectType} onSelectProcedure={selectProcedure}
              onToggleMaterial={toggleMaterial} onToggleCert={toggleCert}
            />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">

          {/* ── Search + Sort bar ── */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <form onSubmit={submitSearch} className="flex-1 min-w-48">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
                  <button type="button" onClick={() => { setSearch(""); router.replace(`${pathname}?${createQS({ search: "" })}`, { scroll: false }); }}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading transition-colors cursor-pointer">
                    <XIcon size={14} />
                  </button>
                )}
              </div>
            </form>

            {/* Sort */}
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="sort-select" className="text-xs font-semibold text-text-muted whitespace-nowrap hidden sm:block">
                Sort by
              </label>
              <select
                id="sort-select"
                value={sortParam}
                onChange={(e) =>
                  router.replace(`${pathname}?${createQS({ sort: e.target.value })}`, { scroll: false })
                }
                className="px-3 py-2.5 rounded-lg border border-gray-200 bg-surface-lowest text-sm text-text-body cursor-pointer focus:outline-2 focus:outline-brand-primary"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Active filter chips ── */}
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Active:</span>
              {chips.map((chip) => (
                <FilterChip key={chip.key} label={chip.label} onRemove={chip.clear} />
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-bold text-brand-primary hover:text-brand-dark transition-colors cursor-pointer ml-1 underline underline-offset-2"
              >
                Clear All
              </button>
            </div>
          )}

          {/* ── Results count + label ── */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <p className="text-sm font-semibold text-text-heading truncate">{activeLabel}</p>
            <p className="text-sm text-text-muted shrink-0" aria-live="polite" aria-atomic="true">
              {loading ? "Loading…" : (
                <><span className="font-semibold text-text-heading">{total.toLocaleString()}</span>
                {" "}instrument{total !== 1 ? "s" : ""}</>
              )}
            </p>
          </div>

          {/* ── Product grid ── */}
          <div
            id="product-grid"
            role="region"
            aria-label="Products"
            key={`${catParam}-${subcatParam}-${typeParam}-${procedureParam}-${searchParam}-${materialParam}-${certParam}-${sortParam}`}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in-up"
          >
            {loading ? (
              Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
            ) : products.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <p className="text-text-muted text-sm mb-3">No instruments found for these filters.</p>
                <button type="button" onClick={clearAll}
                  className="text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors cursor-pointer">
                  Clear all filters
                </button>
              </div>
            ) : (
              products.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div
        className="mt-12 rounded-lg px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left"
        style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}
      >
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Need bulk pricing or custom instruments?</h2>
          <p className="mt-1 text-white/80 text-sm max-w-lg leading-relaxed">
            Our export team responds within 24 hours with pricing, MOQ details, and sample availability.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link href="/contact"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white text-brand-primary font-bold text-sm hover:bg-brand-secondary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white shadow-ambient-sm">
            Request a Quote
          </Link>
          <Link href="/catalog"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full glass text-white font-bold text-sm hover:bg-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
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

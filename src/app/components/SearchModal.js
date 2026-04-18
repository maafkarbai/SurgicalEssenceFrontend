"use client";

import { useState, useEffect, useRef, useId, useCallback } from "react";
import { useRouter } from "next/navigation";
import { searchProducts, CATEGORY_LABELS, QUICK_LINKS } from "@/lib/products";

// ─── Cycling placeholder examples ────────────────────────────────────────────

const PLACEHOLDERS = [
  'Search by name: "iris scissors"',
  'Search by category: dental, surgical…',
  'Search by name: "mosquito clamp"',
  'Search by description: single-use, sterile…',
  'Search by name: "needle holder"',
  'Search by category: ophthalmic, beauty…',
  'Search by name: "bone rongeur"',
  'Search by description: stainless steel…',
];

function useCyclingPlaceholder() {
  const [index,   setIndex]   = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % PLACEHOLDERS.length);
        setVisible(true);
      }, 350);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return { text: PLACEHOLDERS[index], visible };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_BADGE = {
  surgical:    "bg-slate-100 text-slate-700",
  dental:      "bg-slate-50 text-brand-primary",
  beauty:      "bg-rose-50 text-rose-700",
  ophthalmic:  "bg-slate-100 text-slate-700",
  "single-use":"bg-amber-50 text-amber-700",
};

/** Wraps matched substring in <mark> for visual highlighting */
function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-gray-900 rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ArrowReturnIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="9 10 4 15 9 20" />
      <path d="M20 4v7a4 4 0 0 1-4 4H4" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

export default function SearchModal({ onClose }) {
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const placeholder = useCyclingPlaceholder();

  const inputRef    = useRef(null);
  const listRef     = useRef(null);
  const router      = useRouter();
  const listboxId   = useId();
  const inputId     = useId();

  // Run search whenever query changes
  useEffect(() => {
    const trimmed = query.trim();
    setResults(trimmed ? searchProducts(trimmed) : []);
    setActiveIndex(-1);
  }, [query]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Navigate to product's category page
  const goToProduct = useCallback((product) => {
    onClose();
    router.push(`/products?cat=${product.category}`);
  }, [router, onClose]);

  const goToLink = useCallback((href) => {
    onClose();
    router.push(href);
  }, [router, onClose]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const items = query.trim() ? results : QUICK_LINKS;
    const count = items.length;

    if (e.key === "Escape") {
      onClose();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % count);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + count) % count);
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      if (query.trim()) {
        goToProduct(results[activeIndex]);
      } else {
        goToLink(QUICK_LINKS[activeIndex].href);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const showResults    = query.trim().length > 0;
  const showSuggested  = !showResults;
  const activeItemId   = activeIndex >= 0 ? `search-item-${activeIndex}` : undefined;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search surgical instruments"
        className="fixed inset-x-4 top-[10vh] z-50 mx-auto max-w-xl"
      >
        <div className="bg-white rounded-md shadow-2xl overflow-hidden border border-gray-200">

          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
            <span className="text-gray-400 shrink-0"><SearchIcon /></span>
            <label htmlFor={inputId} className="sr-only">Search surgical instruments</label>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                id={inputId}
                type="search"
                role="combobox"
                aria-expanded={showResults}
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-activedescendant={activeItemId}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder=""
                autoComplete="off"
                spellCheck={false}
                className="w-full text-base text-gray-900 bg-transparent outline-none"
              />
              {!query && (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 flex items-center text-base text-gray-400 transition-opacity duration-300 ${placeholder.visible ? "opacity-100" : "opacity-0"}`}
                >
                  {placeholder.text}
                </span>
              )}
            </div>
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="text-gray-400 hover:text-gray-600 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <kbd
              className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-xs text-gray-500 font-mono shrink-0"
              aria-label="Press Escape to close"
            >
              Esc
            </kbd>
          </div>

          {/* Results / Suggestions */}
          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={showResults ? "Search results" : "Suggested categories"}
            className="max-h-[60vh] overflow-y-auto"
          >

            {/* ── Search results ── */}
            {showResults && results.length > 0 && (
              <ul role="list" className="p-2">
                {results.map((product, i) => {
                  const isActive = i === activeIndex;
                  return (
                    <li key={product.id} role="none">
                      <button
                        type="button"
                        id={`search-item-${i}`}
                        data-index={i}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => goToProduct(product)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                          isActive ? "bg-slate-50" : "hover:bg-gray-50"
                        } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary`}
                      >
                        {/* Category badge */}
                        <span className={`shrink-0 mt-0.5 text-xs font-semibold px-2 py-0.5 rounded ${CATEGORY_BADGE[product.category]}`}>
                          {CATEGORY_LABELS[product.category]}
                        </span>

                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-gray-900 truncate">
                            <Highlight text={product.name} query={query.trim()} />
                          </span>
                          <span className="block text-xs text-gray-500 mt-0.5 line-clamp-1">
                            <Highlight text={product.description} query={query.trim()} />
                          </span>
                        </span>

                        {isActive && (
                          <span className="shrink-0 text-gray-400 mt-0.5" aria-hidden="true">
                            <ArrowReturnIcon />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* ── No results ── */}
            {showResults && results.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-semibold text-gray-900">
                  No instruments found for &ldquo;{query.trim()}&rdquo;
                </p>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Try a different term or browse all products below.
                </p>
                <button
                  type="button"
                  onClick={() => goToLink("/products")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-dark text-white text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <GridIcon />
                  Browse All Instruments
                </button>
              </div>
            )}

            {/* ── Suggested categories (empty query) ── */}
            {showSuggested && (
              <div className="p-3">
                <p className="px-2 pb-1.5 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Quick access
                </p>
                <ul role="list" className="flex flex-col gap-0.5">
                  {QUICK_LINKS.map((link, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <li key={link.key} role="none">
                        <button
                          type="button"
                          id={`search-item-${i}`}
                          data-index={i}
                          role="option"
                          aria-selected={isActive}
                          onClick={() => goToLink(link.href)}
                          onMouseEnter={() => setActiveIndex(i)}
                          className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                            isActive ? "bg-slate-50 text-brand-primary" : "text-gray-700 hover:bg-gray-50"
                          } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary`}
                        >
                          <span className="shrink-0 text-gray-400" aria-hidden="true"><GridIcon /></span>
                          <span className="text-sm font-semibold">{link.label}</span>
                          {isActive && (
                            <span className="ml-auto text-gray-400" aria-hidden="true"><ArrowReturnIcon /></span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <kbd className="px-1 py-0.5 rounded border border-gray-200 bg-white font-mono text-xs">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <kbd className="px-1 py-0.5 rounded border border-gray-200 bg-white font-mono text-xs">↵</kbd>
              open
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <kbd className="px-1 py-0.5 rounded border border-gray-200 bg-white font-mono text-xs">Esc</kbd>
              close
            </span>
          </div>

        </div>
      </div>
    </>
  );
}

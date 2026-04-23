"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatDateTime(d) {
  return new Date(d).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUSES = ["NEW", "CONTACTED", "NEGOTIATION", "CLOSED"];

const STATUS_CFG = {
  NEW:         { label: "New",         dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700 border-blue-200" },
  CONTACTED:   { label: "Contacted",   dot: "bg-amber-500",  badge: "bg-amber-50 text-amber-700 border-amber-200" },
  NEGOTIATION: { label: "Negotiation", dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-200" },
  CLOSED:      { label: "Closed",      dot: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200" },
};

// ─── Icons ───────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? { label: status, badge: "bg-gray-100 text-gray-600 border-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot ?? "bg-gray-400"}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

// ─── Status selector dropdown ─────────────────────────────────────────────────

function StatusSelect({ current, quoteId, onUpdated }) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (next) => {
    if (next === current) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        const { data } = await res.json();
        onUpdated(data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change status"
      >
        <StatusBadge status={current} />
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" className="text-gray-400 mt-0.5" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul
            role="listbox"
            aria-label="Select status"
            className="absolute left-0 top-full mt-1.5 z-20 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 min-w-44 overflow-hidden"
          >
            {STATUSES.map((s) => {
              const cfg = STATUS_CFG[s];
              return (
                <li key={s} role="option" aria-selected={s === current}>
                  <button
                    type="button"
                    onClick={() => handleSelect(s)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 hover:bg-gray-50 transition-colors ${s === current ? "font-semibold" : "font-normal"}`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} aria-hidden="true" />
                    {cfg.label}
                    {s === current && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" className="ml-auto text-brand-primary" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── Quote detail modal ───────────────────────────────────────────────────────

function QuoteModal({ quote: initialQuote, onClose, onUpdated }) {
  const [quote, setQuote] = useState(initialQuote);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleUpdated = (updated) => {
    setQuote(updated);
    onUpdated(updated);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-label={`Quote: ${quote.name}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{quote.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {quote.organization ?? quote.email}
              {quote.country ? ` · ${quote.country}` : ""}
            </p>
          </div>
          <button
            type="button" onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ml-4 shrink-0"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Status + meta */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusSelect current={quote.status} quoteId={quote.id} onUpdated={handleUpdated} />
            <span className="text-xs text-gray-400">Received {formatDateTime(quote.createdAt)}</span>
          </div>

          {/* Contact details */}
          <dl className="grid grid-cols-2 gap-3">
            {[
              ["Email",    <a key="e" href={`mailto:${quote.email}`} className="text-brand-primary hover:underline break-all">{quote.email}</a>],
              ["Phone",    quote.phone ? <a key="p" href={`tel:${quote.phone}`} className="text-brand-primary hover:underline">{quote.phone}</a> : <span key="np" className="text-gray-400">—</span>],
              ["Organisation", quote.organization || "—"],
              ["Country",  quote.country || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</dt>
                <dd className="text-sm text-gray-800">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Items ({quote.items?.length ?? 0})
            </p>
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              {quote.items?.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Product</th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-gray-400">SKU</th>
                      <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-widest text-gray-400">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {quote.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          {item.notes && <p className="text-xs text-gray-500 mt-0.5">{item.notes}</p>}
                        </td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.productSku ?? "—"}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-4 text-sm text-gray-400 text-center">No items recorded.</p>
              )}
            </div>
          </div>

          {/* Message */}
          {quote.message && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Message</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{quote.message}</p>
            </div>
          )}

          {/* Reply CTA */}
          <a
            href={`mailto:${quote.email}?subject=Re: Your quote request to Surgical Essence`}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Reply by Email
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900 tabular-nums">{value ?? 0}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

const inactiveCls = "px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors";
const activeCls   = "px-3 py-1.5 text-sm font-semibold text-brand-primary bg-slate-50 rounded-lg";

export default function AdminQuotesPage() {
  const router = useRouter();

  const [quotes,   setQuotes]   = useState([]);
  const [meta,     setMeta]     = useState({ total: 0, totalPages: 1, page: 1 });
  const [counts,   setCounts]   = useState({});
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [selected, setSelected] = useState(null);

  // Filters
  const [q,         setQ]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page,      setPage]      = useState(1);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      page:  String(page),
      limit: String(PAGE_SIZE),
      ...(q            && { q }),
      ...(statusFilter && { status: statusFilter }),
    });
    try {
      const res = await fetch(`/api/admin/quotes?${params}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const json = await res.json();
      setQuotes(json.data ?? []);
      setMeta(json.meta ?? { total: 0, totalPages: 1, page: 1 });
      setCounts(json.counts ?? {});
    } catch {
      setError("Failed to load quotes.");
    } finally {
      setLoading(false);
    }
  }, [page, q, statusFilter, router]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const applyFilter = (setter) => (val) => { setter(val); setPage(1); };

  const handleUpdated = (updated) => {
    setQuotes((prev) => prev.map((q) => q.id === updated.id ? updated : q));
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const totalAll = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Quotes</h1>
              <p className="text-xs text-gray-500">Admin panel</p>
            </div>
            <nav className="hidden sm:flex items-center gap-1 ml-4" aria-label="Admin navigation">
              <Link href="/admin"                className={inactiveCls}>Dashboard</Link>
              <Link href="/admin/products"       className={inactiveCls}>Products</Link>
              <Link href="/admin/categories"     className={inactiveCls}>Categories</Link>
              <Link href="/admin/press-releases" className={inactiveCls}>Press Releases</Link>
              <Link href="/admin/leads"          className={inactiveCls}>Leads</Link>
              <span className={activeCls}>Quotes</span>
            </nav>
          </div>
          <button
            type="button" onClick={handleLogout}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

        {/* ── Status stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATUSES.map((s) => (
            <StatCard
              key={s}
              label={STATUS_CFG[s].label}
              value={counts[s] ?? 0}
              sub={s === "NEW" ? "uncontacted" : s === "CLOSED" ? "won" : undefined}
            />
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex flex-col gap-4">

          {/* Status tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyFilter(setStatusFilter)("")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!statusFilter ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              All <span className="ml-1 opacity-70 text-xs">{totalAll}</span>
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => applyFilter(setStatusFilter)(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {STATUS_CFG[s].label} <span className="ml-1 opacity-70 text-xs">{counts[s] ?? 0}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Name, email, organisation…"
              value={q}
              onChange={(e) => applyFilter(setQ)(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition"
            />
          </div>

          {(q || statusFilter) && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing <strong className="text-gray-700">{meta.total}</strong> result{meta.total !== 1 ? "s" : ""}
              </p>
              <button
                type="button"
                onClick={() => { applyFilter(setQ)(""); applyFilter(setStatusFilter)(""); }}
                className="text-xs text-brand-primary hover:text-brand-dark font-semibold transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div role="alert" className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading…</div>
        ) : quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm font-medium">
              {q || statusFilter ? "No quotes match your filters." : "No quotes yet."}
            </p>
            {(q || statusFilter) && (
              <button
                type="button"
                onClick={() => { applyFilter(setQ)(""); applyFilter(setStatusFilter)(""); }}
                className="mt-3 text-sm text-brand-primary hover:text-brand-dark font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Name & Organisation", "Email", "Items", "Status", "Received"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quotes.map((quote) => (
                    <tr
                      key={quote.id}
                      onClick={() => setSelected(quote)}
                      className="hover:bg-slate-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 truncate max-w-48">{quote.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-48">{quote.organization ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${quote.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-brand-primary hover:underline truncate block max-w-52"
                        >
                          {quote.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {quote.items?.length ?? 0} item{quote.items?.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <StatusSelect
                          current={quote.status}
                          quoteId={quote.id}
                          onUpdated={handleUpdated}
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(quote.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {quotes.map((quote) => (
                <button
                  key={quote.id}
                  type="button"
                  onClick={() => setSelected(quote)}
                  className="w-full text-left bg-white rounded-xl border border-gray-200 px-4 py-4 hover:shadow-sm transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{quote.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {quote.organization ?? quote.email}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                      {formatDate(quote.createdAt)}
                    </p>
                  </div>
                  <div className="mt-2.5 flex items-center gap-3">
                    <StatusBadge status={quote.status} />
                    <span className="text-xs text-gray-400">
                      {quote.items?.length ?? 0} item{quote.items?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* ── Pagination ── */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page <strong className="text-gray-700">{meta.page}</strong> of{" "}
                  <strong className="text-gray-700">{meta.totalPages}</strong>
                  <span className="ml-2 text-gray-400">({meta.total} total)</span>
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                    aria-label="Previous page"
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    disabled={page === meta.totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                    aria-label="Next page"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Quote detail modal ── */}
      {selected && (
        <QuoteModal
          quote={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}

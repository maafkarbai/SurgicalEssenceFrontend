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

// Parse "Business Type: X\nCategory: Y\n\n[message]" stored in the message field
function parseMessage(raw) {
  const lines   = (raw ?? "").split("\n");
  const btLine  = lines.find((l) => l.startsWith("Business Type:"));
  const catLine = lines.find((l) => l.startsWith("Category:"));
  const bodyIdx = raw.indexOf("\n\n");
  return {
    businessType: btLine?.replace("Business Type:", "").trim() ?? "",
    category:     catLine?.replace("Category:", "").trim() ?? "",
    body:         bodyIdx !== -1 ? raw.slice(bodyIdx + 2).trim() : raw,
  };
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
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

// ─── Lead detail modal ────────────────────────────────────────────────────────

function LeadModal({ lead, onClose }) {
  const { businessType, category, body } = parseMessage(lead.message);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-label={`Lead: ${lead.name}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-md shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{lead.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{lead.company} &mdash; {lead.country}</p>
          </div>
          <button
            type="button" onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>

        {/* Details */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-3">
            {[
              ["Email",         <a key="email" href={`mailto:${lead.email}`} className="text-brand-primary hover:underline break-all">{lead.email}</a>],
              ["Phone",         lead.phone ? <a key="phone" href={`tel:${lead.phone}`} className="text-brand-primary hover:underline">{lead.phone}</a> : <span key="no-phone" className="text-gray-400">—</span>],
              ["Business Type", businessType || "—"],
              ["Category",      category     || "—"],
              ["Country",       lead.country || "—"],
              ["Received",      formatDateTime(lead.createdAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</dt>
                <dd className="text-sm text-gray-800">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Message</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{body}</p>
          </div>

          <a
            href={`mailto:${lead.email}?subject=Re: Your enquiry to Surgical Essence`}
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
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

export default function AdminLeadsPage() {
  const router = useRouter();

  const [leads,     setLeads]     = useState([]);
  const [meta,      setMeta]      = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [selected,  setSelected]  = useState(null); // lead for modal
  const [exporting, setExporting] = useState(false);

  // Filters
  const [q,       setQ]       = useState("");
  const [country, setCountry] = useState("");
  const [from,    setFrom]    = useState("");
  const [to,      setTo]      = useState("");
  const [page,    setPage]    = useState(1);

  // Stats derived from all leads (before filters)
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, thisWeek: 0 });

  // ── fetch stats once ───────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/leads?limit=1")
      .then((r) => { if (r.status === 401) router.push("/admin/login"); return r.json(); })
      .then((json) => {
        const total = json.meta?.total ?? 0;
        // Fetch all to compute this-month / this-week from createdAt
        return fetch(`/api/admin/leads?limit=${total || 1}`).then((r) => r.json());
      })
      .then((json) => {
        const all = json.data ?? [];
        const now = new Date();
        const startOfWeek  = new Date(now); startOfWeek.setDate(now.getDate() - 6);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        setStats({
          total:     all.length,
          thisMonth: all.filter((l) => new Date(l.createdAt) >= startOfMonth).length,
          thisWeek:  all.filter((l) => new Date(l.createdAt) >= startOfWeek).length,
        });
      })
      .catch(() => {});
  }, []);

  // ── fetch filtered leads ───────────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      page:    String(page),
      limit:   String(PAGE_SIZE),
      ...(q       && { q }),
      ...(country && { country }),
      ...(from    && { from }),
      ...(to      && { to }),
    });
    try {
      const res = await fetch(`/api/admin/leads?${params}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const json = await res.json();
      setLeads(json.data ?? []);
      setMeta(json.meta ?? { total: 0, totalPages: 1, page: 1 });
    } catch {
      setError("Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }, [page, q, country, from, to]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Reset to page 1 when filters change
  const applyFilter = (setter) => (val) => { setter(val); setPage(1); };

  // ── CSV export ─────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    const params = new URLSearchParams({
      ...(q       && { q }),
      ...(country && { country }),
      ...(from    && { from }),
      ...(to      && { to }),
    });
    try {
      const res      = await fetch(`/api/admin/leads/export?${params}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const blob     = await res.blob();
      const url      = URL.createObjectURL(blob);
      const a        = document.createElement("a");
      a.href         = url;
      a.download     = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const hasFilters = q || country || from || to;
  const clearFilters = () => { setQ(""); setCountry(""); setFrom(""); setTo(""); setPage(1); };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Leads</h1>
              <p className="text-xs text-gray-500">Admin panel</p>
            </div>
            {/* Nav between admin sections */}
            <nav className="hidden sm:flex items-center gap-1 ml-4">
              <Link
                href="/admin/press-releases"
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Press Releases
              </Link>
              <span className="px-3 py-1.5 text-sm font-semibold text-brand-primary bg-slate-50 rounded-lg">
                Leads
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || leads.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-dark text-white text-sm font-bold disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              <DownloadIcon />
              {exporting ? "Exporting…" : "Export CSV"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard label="Total leads"   value={stats.total}     sub="all time" />
          <StatCard label="This month"    value={stats.thisMonth} sub="last 30 days" />
          <StatCard label="This week"     value={stats.thisWeek}  sub="last 7 days" />
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="search"
                placeholder="Name, email, company…"
                value={q}
                onChange={(e) => applyFilter(setQ)(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition"
              />
            </div>

            {/* Country */}
            <input
              type="text"
              placeholder="Country…"
              value={country}
              onChange={(e) => applyFilter(setCountry)(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition"
            />

            {/* From date */}
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-gray-400 font-medium px-0.5">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => applyFilter(setFrom)(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition"
              />
            </div>

            {/* To date */}
            <div className="flex flex-col gap-0.5">
              <label className="text-xs text-gray-400 font-medium px-0.5">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => applyFilter(setTo)(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition"
              />
            </div>
          </div>

          {hasFilters && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing <strong className="text-gray-700">{meta.total}</strong> filtered result{meta.total !== 1 ? "s" : ""}
              </p>
              <button
                type="button"
                onClick={clearFilters}
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
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            Loading…
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm font-medium">
              {hasFilters ? "No leads match your filters." : "No leads yet."}
            </p>
            {hasFilters && (
              <button
                type="button" onClick={clearFilters}
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
                    {["Name & Company", "Email", "Country", "Category", "Received"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => {
                    const { category } = parseMessage(lead.message);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelected(lead)}
                        className="hover:bg-slate-50/40 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900 truncate max-w-[180px]">{lead.name}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[180px]">{lead.company}</p>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`mailto:${lead.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-brand-primary hover:underline truncate block max-w-[200px]"
                          >
                            {lead.email}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{lead.country ?? "—"}</td>
                        <td className="px-4 py-3">
                          {category ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-50 text-brand-primary text-xs font-medium">
                              {category}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(lead.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {leads.map((lead) => {
                const { category } = parseMessage(lead.message);
                return (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => setSelected(lead)}
                    className="w-full text-left bg-white rounded-xl border border-gray-200 px-4 py-4 hover:shadow-sm transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{lead.name}</p>
                        <p className="text-xs text-gray-500 truncate">{lead.company} &mdash; {lead.country}</p>
                        <p className="text-xs text-brand-primary mt-1 truncate">{lead.email}</p>
                      </div>
                      <p className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                        {formatDate(lead.createdAt)}
                      </p>
                    </div>
                    {category && (
                      <span className="mt-2 inline-block px-2 py-0.5 rounded bg-slate-50 text-brand-primary text-xs font-medium">
                        {category}
                      </span>
                    )}
                  </button>
                );
              })}
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

      {/* ── Lead detail modal ── */}
      {selected && <LeadModal lead={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

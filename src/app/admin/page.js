"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const STATUS_STYLES = {
  NEW:         "bg-blue-50 text-blue-700",
  CONTACTED:   "bg-amber-50 text-amber-700",
  NEGOTIATION: "bg-orange-50 text-orange-700",
  CLOSED:      "bg-green-50 text-green-700",
};

// ─── Nav ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { href: "/admin",               label: "Dashboard" },
  { href: "/admin/products",      label: "Products" },
  { href: "/admin/categories",    label: "Categories" },
  { href: "/admin/press-releases",label: "Press Releases" },
  { href: "/admin/leads",         label: "Leads" },
  { href: "/admin/quotes",        label: "Quotes" },
];

const inactiveCls = "px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors";
const activeCls   = "px-3 py-1.5 text-sm font-semibold text-brand-primary bg-slate-50 rounded-lg";

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, trend }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-5 flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-3xl font-extrabold text-gray-900 tabular-nums">{value ?? "—"}</p>
      {trend != null && trend > 0 && (
        <p className="text-xs text-emerald-600 font-semibold">+{trend} this week</p>
      )}
      {sub && !trend && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router  = useRouter();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return null; }
        return r.json();
      })
      .then((json) => { if (json) setData(json); })
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const { stats, recentLeads = [], recentQuotes = [] } = data ?? {};

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-500">Admin panel</p>
            </div>
            <nav className="hidden sm:flex items-center gap-1 ml-4" aria-label="Admin navigation">
              {NAV_LINKS.map(({ href, label }) =>
                label === "Dashboard" ? (
                  <span key={href} className={activeCls}>{label}</span>
                ) : (
                  <Link key={href} href={href} className={inactiveCls}>{label}</Link>
                )
              )}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

        {error && (
          <div role="alert" className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── Stats ── */}
        <section aria-label="Overview stats">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              label="Total Leads"
              value={loading ? "…" : stats?.totalLeads}
              trend={stats?.newLeadsThisWeek}
            />
            <StatCard
              label="Leads / Week"
              value={loading ? "…" : stats?.newLeadsThisWeek}
              sub="last 7 days"
            />
            <StatCard
              label="Total Quotes"
              value={loading ? "…" : stats?.totalQuotes}
              trend={stats?.newQuotesThisWeek}
            />
            <StatCard
              label="Quotes / Week"
              value={loading ? "…" : stats?.newQuotesThisWeek}
              sub="last 7 days"
            />
            <StatCard
              label="Products"
              value={loading ? "…" : stats?.activeProducts}
              sub="active"
            />
            <StatCard
              label="Press Releases"
              value={loading ? "…" : stats?.publishedPressReleases}
              sub="published"
            />
          </div>
        </section>

        {/* ── Recent activity ── */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Recent leads */}
          <section aria-label="Recent leads">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">Recent Leads</h2>
                <Link href="/admin/leads" className="text-xs text-brand-primary hover:text-brand-dark font-semibold transition-colors">
                  View all →
                </Link>
              </div>
              {loading ? (
                <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>
              ) : recentLeads.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">No leads yet.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href="/admin/leads"
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{lead.name}</p>
                        <p className="text-xs text-gray-500 truncate">{lead.company ?? lead.email}</p>
                      </div>
                      <p className="text-xs text-gray-400 whitespace-nowrap ml-3 shrink-0">
                        {formatDate(lead.createdAt)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Recent quotes */}
          <section aria-label="Recent quotes">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">Recent Quotes</h2>
                <Link href="/admin/quotes" className="text-xs text-brand-primary hover:text-brand-dark font-semibold transition-colors">
                  View all →
                </Link>
              </div>
              {loading ? (
                <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>
              ) : recentQuotes.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">No quotes yet.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentQuotes.map((q) => (
                    <Link
                      key={q.id}
                      href="/admin/quotes"
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{q.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {q.items?.length ?? 0} item{q.items?.length !== 1 ? "s" : ""}
                          {q.organization ? ` · ${q.organization}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[q.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {q.status}
                        </span>
                        <p className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                          {formatDate(q.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Quick actions ── */}
        <section aria-label="Quick actions">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Quick Actions</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-dark text-white text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              + New Product
            </Link>
            <Link
              href="/admin/press-releases/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors"
            >
              + New Press Release
            </Link>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors"
            >
              View Leads
            </Link>
            <Link
              href="/admin/quotes"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors"
            >
              View Quotes
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

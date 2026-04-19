"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  NEW:         "bg-blue-100 text-blue-700",
  CONTACTED:   "bg-yellow-100 text-yellow-700",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  CLOSED:      "bg-green-100 text-green-700",
};

// ─── Quote card ───────────────────────────────────────────────────────────────

function QuoteCard({ quote }) {
  const date = new Date(quote.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
  const ref = `#${quote.id.slice(-8).toUpperCase()}`;
  const statusCls = STATUS_STYLES[quote.status] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono text-gray-400">{ref}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusCls}`}>
            {quote.status}
          </span>
        </div>
        <span className="text-xs text-gray-400">{date}</span>
      </div>

      <ul className="flex flex-col gap-1.5 mb-3">
        {quote.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-800 font-medium">{item.productName}</span>
            <span className="text-gray-400 text-xs font-medium ml-4 shrink-0">×{item.quantity}</span>
          </li>
        ))}
      </ul>

      {quote.message && (
        <p className="text-xs text-gray-500 border-t border-gray-100 pt-3 line-clamp-2 leading-relaxed">
          {quote.message}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyAccountPage() {
  const { user, loading, logout, openLogin, openRegister } = useAuth();
  const [quotes, setQuotes]           = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setQuotesLoading(true);
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((data) => setQuotes(data.quotes ?? []))
      .catch(() => setQuotes([]))
      .finally(() => setQuotesLoading(false));
  }, [user]);

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    );
  }

  // ── Not signed in ──
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Sign in to view your profile, manage details, and track your quote requests.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={openLogin}
            className="px-6 py-2.5 rounded-lg border border-[#003b72] text-[#003b72] font-semibold text-sm hover:bg-blue-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={openRegister}
            className="px-6 py-2.5 rounded-lg bg-[#003b72] text-white font-semibold text-sm hover:bg-[#00529b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  // ── Authenticated ──
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <span className="w-12 h-12 rounded-full bg-[#003b72] text-white text-lg font-bold flex items-center justify-center shrink-0">
            {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {user.name ?? "My Account"}
            </h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 rounded"
        >
          Sign Out
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Profile</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          {[
            ["Full Name",    user.name    ?? "—"],
            ["Email",        user.email],
            ["Company",      user.company ?? "—"],
            ["Country",      user.country ?? "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="block text-xs text-gray-400 font-medium mb-0.5">{label}</span>
              <span className="text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quote history */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Quote History
        </h2>

        {quotesLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-4 w-16 bg-gray-100 rounded" />
                </div>
                <div className="h-3 w-3/4 bg-gray-100 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-10 text-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db"
              strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
              className="mx-auto mb-3" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p className="text-gray-500 text-sm font-medium mb-1">No quotes yet</p>
            <p className="text-gray-400 text-xs mb-5">
              Browse our product catalogue and add items to your quote cart.
            </p>
            <Link
              href="/products"
              className="inline-block px-5 py-2 rounded-lg bg-[#003b72] text-white text-sm font-semibold hover:bg-[#00529b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {quotes.map((q) => <QuoteCard key={q.id} quote={q} />)}
          </div>
        )}
      </div>
    </div>
  );
}

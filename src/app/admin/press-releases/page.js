"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminPressReleasesPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [deleting, setDeleting] = useState(null);
  const router = useRouter();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/press-releases");
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setItems(data.data ?? []);
    } catch {
      setError("Failed to load press releases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/press-releases/${id}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
      else setError("Failed to delete.");
    } catch {
      setError("Network error.");
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Press Releases</h1>
            <p className="text-xs text-gray-500">Admin panel</p>
          </div>
          <nav className="hidden sm:flex items-center gap-1 ml-4" aria-label="Admin navigation">
            <Link href="/admin"                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">Dashboard</Link>
            <Link href="/admin/products"       className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">Products</Link>
            <Link href="/admin/categories"     className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">Categories</Link>
            <span className="px-3 py-1.5 text-sm font-semibold text-brand-primary bg-slate-50 rounded-lg">Press Releases</span>
            <Link href="/admin/leads"          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">Leads</Link>
            <Link href="/admin/quotes"         className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">Quotes</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/press-releases/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-dark text-white text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Press Release
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div role="alert" className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-500 text-sm mb-4">No press releases yet.</p>
            <Link
              href="/admin/press-releases/new"
              className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-bold hover:bg-brand-dark transition-colors"
            >
              Create your first one
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
              >
                {/* Status dot */}
                <span
                  title={item.published ? "Published" : "Draft"}
                  className={`shrink-0 w-2.5 h-2.5 rounded-full ${item.published ? "bg-green-500" : "bg-amber-400"}`}
                  aria-label={item.published ? "Published" : "Draft"}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.published ? `Published ${formatDate(item.publishedAt)}` : `Draft · Created ${formatDate(item.createdAt)}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.published && (
                    <Link
                      href={`/press-releases/${item.slug ?? item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:border-gray-300 transition-colors"
                      aria-label={`View "${item.title}"`}
                    >
                      View
                    </Link>
                  )}
                  <Link
                    href={`/admin/press-releases/${item.id}/edit`}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:border-brand-primary hover:text-brand-primary transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    disabled={deleting === item.id}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-red-500 text-xs font-medium hover:border-red-300 hover:bg-red-50 disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                  >
                    {deleting === item.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

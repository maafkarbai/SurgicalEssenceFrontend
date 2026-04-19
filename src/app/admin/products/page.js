"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [search,   setSearch]   = useState("");
  const [deleting, setDeleting] = useState(null);
  const router = useRouter();

  const fetchProducts = async (q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (q.trim()) params.set("search", q.trim());
      const res = await fetch(`/api/admin/products?${params}`);
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const handleDeactivate = async (id, name) => {
    if (!confirm(`Deactivate "${name}"? It will be hidden from the public catalogue.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.map((p) => p.id === id ? { ...p, active: false } : p));
      } else {
        setError("Failed to deactivate.");
      }
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
            <h1 className="text-lg font-bold text-gray-900">Products</h1>
            <p className="text-xs text-gray-500">Admin panel</p>
          </div>
          <nav className="hidden sm:flex items-center gap-1 ml-4">
            <span className="px-3 py-1.5 text-sm font-semibold text-brand-primary bg-slate-50 rounded-lg">
              Products
            </span>
            <Link
              href="/admin/press-releases"
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Press Releases
            </Link>
            <Link
              href="/admin/leads"
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Leads
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-dark text-white text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Product
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-2 max-w-sm">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or SKU…"
            aria-label="Search products"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-2 focus:outline-brand-primary"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {error && (
          <div role="alert" className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading…</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-500 text-sm mb-4">No products found.</p>
            <Link
              href="/admin/products/new"
              className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-bold hover:bg-brand-dark transition-colors"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm min-w-160">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th scope="col" className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-400 w-8">
                    <span className="sr-only">Status</span>
                  </th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">Name</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-400">SKU</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-400 hidden md:table-cell">Category</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-400 hidden lg:table-cell">Added</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span
                        title={p.active ? "Active" : "Inactive"}
                        aria-label={p.active ? "Active" : "Inactive"}
                        className={`inline-block w-2.5 h-2.5 rounded-full ${p.active ? "bg-green-500" : "bg-gray-300"}`}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 truncate max-w-50">{p.name}</span>
                        {p.featured && (
                          <span className="shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-gray-500">{p.sku}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell text-gray-500">
                      {p.category?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-gray-400 text-xs">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {p.active && (
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:border-gray-300 transition-colors"
                            aria-label={`View ${p.name} on site`}
                          >
                            View
                          </Link>
                        )}
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:border-brand-primary hover:text-brand-primary transition-colors"
                        >
                          Edit
                        </Link>
                        {p.active && (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(p.id, p.name)}
                            disabled={deleting === p.id}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-red-500 text-xs font-medium hover:border-red-300 hover:bg-red-50 disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                          >
                            {deleting === p.id ? "…" : "Deactivate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

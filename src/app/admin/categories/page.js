"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Helpers ───────────────────────────────────────────────────────────────────

function clientSlugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Inline form (shared for category + subcategory) ───────────────────────────

function CategoryForm({ initial, onSave, onCancel, saving, error }) {
  const isNew = !initial;

  const [name,         setName]         = useState(initial?.name        ?? "");
  const [slug,         setSlug]         = useState(initial?.slug        ?? "");
  const [description,  setDescription]  = useState(initial?.description ?? "");
  const [sortOrder,    setSortOrder]    = useState(initial?.sortOrder   ?? 0);
  const [slugTouched,  setSlugTouched]  = useState(!isNew); // existing records: don't auto-rewrite slug

  const handleNameChange = (val) => {
    setName(val);
    if (!slugTouched) setSlug(clientSlugify(val));
  };

  const handleSlugChange = (val) => {
    setSlug(val);
    setSlugTouched(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, slug, description, sortOrder: Number(sortOrder) });
  };

  const inputCls =
    "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-2 focus:outline-brand-primary transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Surgical Instruments"
            className={inputCls}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">
            Slug
            {!slugTouched && <span className="ml-1 text-xs text-gray-400 font-normal">(auto)</span>}
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="e.g. surgical-instruments"
            className={`${inputCls} font-mono text-xs`}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-[1fr_100px] gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional short description…"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Sort order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={inputCls}
            min={0}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">{error}</p>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-dark text-white text-sm font-bold disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          {saving ? "Saving…" : isNew ? "Create" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Status dot ────────────────────────────────────────────────────────────────

function StatusDot({ active }) {
  return (
    <span
      title={active ? "Active" : "Inactive"}
      aria-label={active ? "Active" : "Inactive"}
      className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${active ? "bg-green-500" : "bg-gray-300"}`}
    />
  );
}

// ── Chevron icon ──────────────────────────────────────────────────────────────

function Chevron({ open }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      aria-hidden="true"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const router = useRouter();

  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [pageError,   setPageError]   = useState("");
  const [expandedId,  setExpandedId]  = useState(null);

  // "new" | cuid | null
  const [catFormId,   setCatFormId]   = useState(null);
  // "new:{catId}" | subId | null
  const [subFormId,   setSubFormId]   = useState(null);

  // per-item save errors
  const [formError,   setFormError]   = useState("");
  const [busy,        setBusy]        = useState(null);

  // ── Data fetch ──────────────────────────────────────────────────────────────

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      setPageError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ── Category actions ────────────────────────────────────────────────────────

  const handleCreateCategory = async (formData) => {
    setBusy("new-cat");
    setFormError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed to create."); return; }
      setCategories((prev) => [data.category, ...prev]);
      setCatFormId(null);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleUpdateCategory = async (id, formData) => {
    setBusy(id);
    setFormError("");
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed to update."); return; }
      setCategories((prev) =>
        prev.map((c) => c.id === id ? { ...c, ...data.category } : c)
      );
      setCatFormId(null);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleToggleCategoryActive = async (cat) => {
    const deactivating = cat.active;
    if (deactivating) {
      const ok = window.confirm(
        `Deactivate "${cat.name}"? Its subcategories will also be hidden from the public catalogue.`
      );
      if (!ok) return;
    }
    setBusy(cat.id);
    try {
      const res = deactivating
        ? await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" })
        : await fetch(`/api/admin/categories/${cat.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: true }),
          });
      if (!res.ok) { setPageError("Action failed. Please try again."); return; }
      setCategories((prev) =>
        prev.map((c) => c.id === cat.id ? { ...c, active: !cat.active } : c)
      );
    } catch {
      setPageError("Network error.");
    } finally {
      setBusy(null);
    }
  };

  // ── Subcategory actions ─────────────────────────────────────────────────────

  const handleCreateSubcategory = async (catId, formData) => {
    setBusy(`new-sub-${catId}`);
    setFormError("");
    try {
      const res = await fetch(`/api/admin/categories/${catId}/subcategories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed to create."); return; }
      setCategories((prev) =>
        prev.map((c) =>
          c.id === catId
            ? { ...c, subcategories: [...(c.subcategories ?? []), data.subcategory] }
            : c
        )
      );
      setSubFormId(null);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleUpdateSubcategory = async (catId, subId, formData) => {
    setBusy(subId);
    setFormError("");
    try {
      const res = await fetch(`/api/admin/categories/${catId}/subcategories/${subId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed to update."); return; }
      setCategories((prev) =>
        prev.map((c) =>
          c.id === catId
            ? {
                ...c,
                subcategories: c.subcategories.map((s) =>
                  s.id === subId ? { ...s, ...data.subcategory } : s
                ),
              }
            : c
        )
      );
      setSubFormId(null);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleToggleSubcategoryActive = async (catId, sub) => {
    const deactivating = sub.active;
    if (deactivating) {
      const ok = window.confirm(`Deactivate "${sub.name}"?`);
      if (!ok) return;
    }
    setBusy(sub.id);
    try {
      const res = deactivating
        ? await fetch(`/api/admin/categories/${catId}/subcategories/${sub.id}`, { method: "DELETE" })
        : await fetch(`/api/admin/categories/${catId}/subcategories/${sub.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: true }),
          });
      if (!res.ok) { setPageError("Action failed."); return; }
      setCategories((prev) =>
        prev.map((c) =>
          c.id === catId
            ? {
                ...c,
                subcategories: c.subcategories.map((s) =>
                  s.id === sub.id ? { ...s, active: !sub.active } : s
                ),
              }
            : c
        )
      );
    } catch {
      setPageError("Network error.");
    } finally {
      setBusy(null);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const openCatForm = (id) => {
    setFormError("");
    setSubFormId(null);
    setCatFormId(id);
  };

  const openSubForm = (key) => {
    setFormError("");
    setCatFormId(null);
    setSubFormId(key);
  };

  const cancelForm = () => {
    setFormError("");
    setCatFormId(null);
    setSubFormId(null);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const btnCls = {
    action: "px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:border-gray-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-40",
    danger:  "px-3 py-1.5 rounded-lg border border-gray-200 text-red-500 text-xs font-medium hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-40",
    success: "px-3 py-1.5 rounded-lg border border-green-200 text-green-600 text-xs font-medium hover:bg-green-50 transition-colors disabled:opacity-40",
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Categories</h1>
            <p className="text-xs text-gray-500">Admin panel</p>
          </div>
          <nav className="hidden sm:flex items-center gap-1 ml-4" aria-label="Admin navigation">
            <Link href="/admin/products"       className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">Products</Link>
            <Link href="/admin/press-releases" className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">Press Releases</Link>
            <Link href="/admin/leads"          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">Leads</Link>
            <span className="px-3 py-1.5 text-sm font-semibold text-brand-primary bg-slate-50 rounded-lg">Categories</span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openCatForm("new")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-dark text-white text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Category
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {pageError && (
          <div role="alert" className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {pageError}
          </div>
        )}

        {/* New category inline form */}
        {catFormId === "new" && (
          <div className="mb-4 bg-white rounded-xl border-2 border-dashed border-brand-primary/40 p-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">New category</h2>
            <CategoryForm
              onSave={handleCreateCategory}
              onCancel={cancelForm}
              saving={busy === "new-cat"}
              error={formError}
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Loading…</div>
        ) : categories.length === 0 && catFormId !== "new" ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-400" aria-hidden="true">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm mb-4">No categories yet.</p>
            <button
              type="button"
              onClick={() => openCatForm("new")}
              className="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-bold hover:bg-brand-dark transition-colors"
            >
              Create your first category
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {categories.map((cat) => {
              const isExpanded = expandedId === cat.id;
              const isEditingCat = catFormId === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`bg-white rounded-xl border transition-shadow ${isExpanded ? "border-gray-300 shadow-sm" : "border-gray-200"}`}
                >
                  {/* Category row */}
                  {isEditingCat ? (
                    <div className="p-5">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Edit category</h2>
                      <CategoryForm
                        initial={cat}
                        onSave={(data) => handleUpdateCategory(cat.id, data)}
                        onCancel={cancelForm}
                        saving={busy === cat.id}
                        error={formError}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-5 py-4">
                      <StatusDot active={cat.active} />

                      {/* Name + slug + count */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold text-sm truncate ${cat.active ? "text-gray-900" : "text-gray-400"}`}>
                            {cat.name}
                          </span>
                          <span className="font-mono text-xs text-gray-400 truncate">{cat.slug}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-50 text-gray-500 shrink-0">
                            {cat._count?.products ?? 0} product{cat._count?.products !== 1 ? "s" : ""}
                          </span>
                          {cat.subcategories?.length > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-50 text-gray-500 shrink-0">
                              {cat.subcategories.length} sub{cat.subcategories.length !== 1 ? "categories" : "category"}
                            </span>
                          )}
                        </div>
                        {cat.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{cat.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button type="button" onClick={() => openCatForm(cat.id)} className={btnCls.action}>Edit</button>
                        <button
                          type="button"
                          onClick={() => handleToggleCategoryActive(cat)}
                          disabled={busy === cat.id}
                          className={cat.active ? btnCls.danger : btnCls.success}
                        >
                          {busy === cat.id ? "…" : cat.active ? "Deactivate" : "Reactivate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                          aria-label={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          <Chevron open={isExpanded} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Subcategories accordion */}
                  {isExpanded && !isEditingCat && (
                    <div className="border-t border-gray-100 bg-gray-50/60 rounded-b-xl px-5 py-4 flex flex-col gap-2">

                      {cat.subcategories?.length === 0 && subFormId !== `new:${cat.id}` && (
                        <p className="text-xs text-gray-400 py-1">No subcategories yet.</p>
                      )}

                      {cat.subcategories?.map((sub) => {
                        const isEditingSub = subFormId === sub.id;

                        return (
                          <div key={sub.id} className="bg-white rounded-lg border border-gray-200">
                            {isEditingSub ? (
                              <div className="p-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Edit subcategory</h3>
                                <CategoryForm
                                  initial={sub}
                                  onSave={(data) => handleUpdateSubcategory(cat.id, sub.id, data)}
                                  onCancel={cancelForm}
                                  saving={busy === sub.id}
                                  error={formError}
                                />
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 px-4 py-3">
                                <StatusDot active={sub.active} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`font-medium text-sm truncate ${sub.active ? "text-gray-800" : "text-gray-400"}`}>
                                      {sub.name}
                                    </span>
                                    <span className="font-mono text-xs text-gray-400 truncate">{sub.slug}</span>
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-slate-50 text-gray-500 shrink-0">
                                      {sub._count?.products ?? 0} product{sub._count?.products !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  {sub.description && (
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">{sub.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button type="button" onClick={() => openSubForm(sub.id)} className={btnCls.action}>Edit</button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSubcategoryActive(cat.id, sub)}
                                    disabled={busy === sub.id}
                                    className={sub.active ? btnCls.danger : btnCls.success}
                                  >
                                    {busy === sub.id ? "…" : sub.active ? "Deactivate" : "Reactivate"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* New subcategory form */}
                      {subFormId === `new:${cat.id}` ? (
                        <div className="bg-white rounded-lg border-2 border-dashed border-brand-primary/40 p-4">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">New subcategory</h3>
                          <CategoryForm
                            onSave={(data) => handleCreateSubcategory(cat.id, data)}
                            onCancel={cancelForm}
                            saving={busy === `new-sub-${cat.id}`}
                            error={formError}
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openSubForm(`new:${cat.id}`)}
                          className="flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-dark font-medium py-1 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add subcategory
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

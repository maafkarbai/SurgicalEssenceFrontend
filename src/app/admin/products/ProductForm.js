"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ── Cloudinary image uploader ─────────────────────────────────────────────────

function ImageUploader({ imageUrls, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    const results = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "products");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Upload failed."); setUploading(false); return; }
      results.push(data.url);
    }
    onChange([...imageUrls, ...results]);
    setUploading(false);
  };

  const remove = (url) => onChange(imageUrls.filter((u) => u !== url));

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...imageUrls];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {imageUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {imageUrls.map((url, idx) => (
            <div key={url} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-50">
              <Image src={url} alt="" fill className="object-cover" sizes="120px" />
              {idx === 0 && (
                <span className="absolute top-1 left-1 text-[10px] font-bold bg-brand-primary text-white px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    title="Move to front"
                    className="p-1 rounded bg-white/90 hover:bg-white text-gray-700"
                    aria-label="Move image to front"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(url)}
                  title="Remove"
                  className="p-1 rounded bg-white/90 hover:bg-white text-red-500"
                  aria-label="Remove image"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        aria-label="Upload product images"
        onChange={(e) => upload(e.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>
            Uploading…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            {imageUrls.length ? "Add more images" : "Upload images"}
          </>
        )}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-gray-400">JPEG, PNG, WebP or GIF · max 5 MB each. First image is the main display image.</p>
    </div>
  );
}

// ── PDF uploader ──────────────────────────────────────────────────────────────

function PdfUploader({ pdfUrl, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "datasheets");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setError(data.error || "Upload failed."); return; }
    onChange(data.url);
  };

  const filename = pdfUrl ? decodeURIComponent(pdfUrl.split("/").pop().split("?")[0]) : null;

  return (
    <div className="flex flex-col gap-2">
      {pdfUrl ? (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-red-500" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
          <span className="text-sm text-gray-700 truncate flex-1">{filename}</span>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary hover:underline shrink-0">View</a>
          <button type="button" onClick={() => onChange("")} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Remove PDF">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        aria-label="Upload PDF datasheet"
        onChange={(e) => upload(e.target.files?.[0])}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
            Uploading…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {pdfUrl ? "Replace PDF" : "Upload PDF datasheet"}
          </>
        )}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-gray-400">PDF only · max 20 MB</p>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export default function ProductForm({ initial, isEdit }) {
  const router = useRouter();

  const [name,           setName]          = useState(initial?.name          ?? "");
  const [sku,            setSku]           = useState(initial?.sku           ?? "");
  const [description,    setDescription]   = useState(initial?.description   ?? "");
  const [material,       setMaterial]      = useState(initial?.material      ?? "");
  const [usage,          setUsage]         = useState(initial?.usage         ?? "");
  const [sterilization,  setSterilization] = useState(initial?.sterilization ?? "");
  const [certifications, setCertifications]= useState((initial?.certifications ?? []).join(", "));
  const [imageUrls,      setImageUrls]     = useState(initial?.imageUrls     ?? []);
  const [pdfUrl,         setPdfUrl]        = useState(initial?.pdfUrl        ?? "");
  const [categoryId,     setCategoryId]    = useState(initial?.categoryId    ?? "");
  const [subcategoryId,  setSubcategoryId] = useState(initial?.subcategoryId ?? "");
  const [active,         setActive]        = useState(initial?.active !== false);
  const [featured,       setFeatured]      = useState(initial?.featured === true);

  const [categories,    setCategories]    = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const cat = categories.find((c) => c.id === categoryId);
    const subs = cat?.subcategories ?? [];
    setSubcategories(subs);
    if (subcategoryId && !subs.find((s) => s.id === subcategoryId)) {
      setSubcategoryId("");
    }
  }, [categoryId, categories]);

  const save = async () => {
    if (!name.trim()) { setError("Product name is required."); return; }
    if (!sku.trim())  { setError("SKU is required."); return; }

    setSaving(true);
    setError("");

    const body = {
      name:           name.trim(),
      sku:            sku.trim(),
      description:    description.trim()   || null,
      material:       material.trim()      || null,
      usage:          usage.trim()         || null,
      sterilization:  sterilization.trim() || null,
      certifications: certifications.split(",").map((s) => s.trim()).filter(Boolean),
      imageUrls,
      pdfUrl:         pdfUrl.trim()        || null,
      categoryId:     categoryId           || null,
      subcategoryId:  subcategoryId        || null,
      active,
      featured,
    };

    try {
      const url    = isEdit ? `/api/admin/products/${initial.id}` : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save."); return; }
      router.push("/admin/products");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-2 focus:outline-brand-primary transition-colors";

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sticky top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            All products
          </Link>
          <span className="text-gray-300" aria-hidden="true">/</span>
          <span className="text-sm font-semibold text-gray-700">
            {isEdit ? "Edit product" : "New product"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <p role="alert" className="text-xs text-red-600 max-w-xs truncate">{error}</p>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-dark text-white text-sm font-bold disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── Left: main fields ── */}
        <div className="flex flex-col gap-5">

          {/* Basic info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">

            <div>
              <label htmlFor="prod-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Product name <span className="text-red-500">*</span>
              </label>
              <input
                id="prod-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="e.g. Mayo Scissors Straight"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="prod-sku" className="block text-sm font-semibold text-gray-700 mb-1.5">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                id="prod-sku"
                type="text"
                value={sku}
                onChange={(e) => { setSku(e.target.value); setError(""); }}
                placeholder="e.g. SRG-001"
                className={`${inputCls} font-mono`}
              />
            </div>

            <div>
              <label htmlFor="prod-desc" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                id="prod-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed product description…"
                className={`${inputCls} resize-y`}
              />
            </div>
          </div>

          {/* Technical specs */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Technical specs</h2>

            <div>
              <label htmlFor="prod-material" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Material
              </label>
              <input
                id="prod-material"
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g. Stainless Steel, Titanium"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="prod-sterilization" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Sterilization method
              </label>
              <input
                id="prod-sterilization"
                type="text"
                value={sterilization}
                onChange={(e) => setSterilization(e.target.value)}
                placeholder="e.g. Autoclave, ETO, Gamma"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="prod-usage" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Usage / Indications
              </label>
              <textarea
                id="prod-usage"
                rows={3}
                value={usage}
                onChange={(e) => setUsage(e.target.value)}
                placeholder="Describe clinical use and indications…"
                className={`${inputCls} resize-y`}
              />
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Product images</h2>
            <ImageUploader imageUrls={imageUrls} onChange={setImageUrls} />
          </div>

          {/* PDF */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Datasheet PDF</h2>
            <PdfUploader pdfUrl={pdfUrl} onChange={setPdfUrl} />
          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <aside className="flex flex-col gap-4">

          {/* Visibility */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Visibility</h2>
            <div className="flex flex-col gap-4">
              {[
                { id: "prod-active",   label: "Active",   desc: "Visible on public catalogue", value: active,   setter: setActive   },
                { id: "prod-featured", label: "Featured", desc: "Appears first in listings",   value: featured, setter: setFeatured },
              ].map(({ id, label, desc, value, setter }) => (
                <label key={id} className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      id={id}
                      checked={value}
                      onChange={(e) => setter(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 rounded-full bg-gray-200 peer-checked:bg-brand-primary transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow peer-checked:translate-x-4 transition-transform" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Category</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="prod-cat" className="block text-xs font-semibold text-gray-600 mb-1">
                  Category
                </label>
                <select
                  id="prod-cat"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {subcategories.length > 0 && (
                <div>
                  <label htmlFor="prod-subcat" className="block text-xs font-semibold text-gray-600 mb-1">
                    Subcategory
                  </label>
                  <select
                    id="prod-subcat"
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">— None —</option>
                    {subcategories.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {categoryId && (
                <p className="text-xs text-gray-400">
                  Manage categories in{" "}
                  <Link href="/admin/categories" className="text-brand-primary hover:underline">
                    Category settings
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Certifications</h2>
            <label htmlFor="prod-certs" className="sr-only">Certifications (comma-separated)</label>
            <input
              id="prod-certs"
              type="text"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              placeholder="CE Certified, ISO 13485"
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1.5">Comma-separated list</p>
          </div>

        </aside>
      </div>
    </div>
  );
}

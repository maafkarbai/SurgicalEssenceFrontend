"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";

// Load editor client-side only (Tiptap is browser-only)
const RichTextEditor = dynamic(
  () => import("@/app/components/admin/RichTextEditor"),
  { ssr: false, loading: () => <div className="h-96 rounded-xl border border-gray-200 bg-gray-50 animate-pulse" /> }
);

export default function PressReleaseForm({ initial, isEdit }) {
  const router = useRouter();

  const [title,        setTitle]       = useState(initial?.title     ?? "");
  const [content,      setContent]     = useState(initial?.content   ?? "");
  const [imageUrl,     setImageUrl]    = useState(initial?.imageUrl  ?? "");
  const [published,    setPublished]   = useState(initial?.published ?? false);
  const [saving,       setSaving]      = useState(false);
  const [error,        setError]       = useState("");
  const [uploading,    setUploading]   = useState(false);
  const [uploadError,  setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const handleContent = useCallback((html) => setContent(html), []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed.");
      } else {
        setImageUrl(data.url);
      }
    } catch {
      setUploadError("Network error. Please try again.");
    } finally {
      setUploading(false);
      // Reset the input so the same file can be re-selected after removal
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const save = async (publish) => {
    if (!title.trim()) { setError("Title is required."); return; }
    if (!content || content === "<p></p>") { setError("Content cannot be empty."); return; }

    setSaving(true);
    setError("");

    const body = {
      title:     title.trim(),
      content,
      imageUrl:  imageUrl.trim() || null,
      published: publish,
    };

    try {
      const url    = isEdit ? `/api/press-releases/${initial.id}` : "/api/press-releases";
      const method = isEdit ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save.");
        return;
      }
      router.push("/admin/press-releases");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/press-releases"
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            All press releases
          </Link>
          <span className="text-gray-300" aria-hidden="true">/</span>
          <span className="text-sm font-semibold text-gray-700">
            {isEdit ? "Edit" : "New press release"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <p role="alert" className="text-xs text-red-600 max-w-xs truncate">{error}</p>
          )}
          <button
            type="button"
            onClick={() => save(false)}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-dark text-white text-sm font-bold disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            {saving ? "Saving…" : published ? "Update" : "Publish"}
          </button>
        </div>
      </header>

      {/* Two-column layout: editor + sidebar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── Left: editor ── */}
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label htmlFor="pr-title" className="sr-only">Press release title</label>
            <textarea
              id="pr-title"
              rows={2}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder="Press release title…"
              className="w-full text-3xl sm:text-4xl font-extrabold text-gray-900 placeholder-gray-300 bg-transparent border-none outline-none resize-none leading-tight"
              aria-label="Press release title"
            />
          </div>

          {/* Cover image preview */}
          {imageUrl && (
            <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-gray-100">
              <Image src={imageUrl} alt="Cover image preview" fill className="object-cover" />
            </div>
          )}

          {/* Rich text editor */}
          <RichTextEditor content={content} onChange={handleContent} />
        </div>

        {/* ── Right: sidebar ── */}
        <aside className="flex flex-col gap-4">

          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Status</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="sr-only peer"
                  aria-label="Published"
                />
                <div className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-brand-primary transition-colors" />
                <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow peer-checked:translate-x-4 transition-transform" />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {published ? "Published" : "Draft"}
              </span>
            </label>
            <p className="text-xs text-gray-400 mt-2">
              {published
                ? "This press release is visible to the public."
                : "Only admins can see drafts."}
            </p>
          </div>

          {/* Cover image upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Cover image</p>

            {imageUrl ? (
              <div className="flex flex-col gap-2">
                <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <Image src={imageUrl} alt="Cover preview" fill className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors text-left"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <label
                htmlFor="cover-image-upload"
                className={`flex flex-col items-center justify-center gap-2 w-full aspect-video rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                  uploading
                    ? "border-brand-primary bg-slate-50 cursor-wait"
                    : "border-gray-200 hover:border-brand-primary hover:bg-slate-50"
                }`}
              >
                {uploading ? (
                  <span className="text-xs text-brand-primary font-medium">Uploading…</span>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1E3A5F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span className="text-xs text-gray-500 text-center px-2">
                      Click to upload<br />
                      <span className="text-gray-400">JPEG, PNG, WebP · max 5 MB</span>
                    </span>
                  </>
                )}
                <input
                  id="cover-image-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}

            {uploadError && (
              <p role="alert" className="text-xs text-red-600 mt-2">{uploadError}</p>
            )}
          </div>

          {/* Tips */}
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Editor tips</h2>
            <ul className="flex flex-col gap-1.5 text-xs text-brand-primary">
              <li>Select text to see the quick formatting menu</li>
              <li><kbd className="px-1 py-0.5 bg-white rounded border border-gray-200 font-mono">Ctrl+B</kbd> Bold</li>
              <li><kbd className="px-1 py-0.5 bg-white rounded border border-gray-200 font-mono">Ctrl+I</kbd> Italic</li>
              <li>Click the image icon to insert a photo</li>
              <li>Type <strong>---</strong> for a divider</li>
            </ul>
          </div>

        </aside>
      </div>
    </div>
  );
}

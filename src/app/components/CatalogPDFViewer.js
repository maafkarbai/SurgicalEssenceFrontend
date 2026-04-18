"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ─── PDF Viewer Modal ─────────────────────────────────────────────────────────

function PDFModal({ pdfPath, label, onClose }) {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount (iframes in mobile browsers often can't render PDFs)
  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${label} PDF viewer`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white shrink-0 gap-3">
        <span className="font-semibold text-sm truncate">{label}</span>

        <div className="flex items-center gap-2 shrink-0">
          {/* Open in new tab */}
          <a
            href={pdfPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <ExternalLinkIcon />
            Open in new tab
          </a>

          {/* Download */}
          <a
            href={pdfPath}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-dark text-white text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            aria-label={`Download ${label} PDF`}
          >
            <DownloadIcon />
            Download
          </a>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close PDF viewer"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Viewer area */}
      <div className="flex-1 relative overflow-hidden">

        {/* Mobile fallback — iframes can't render PDFs on most mobile browsers */}
        {isMobile ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div>
              <p className="text-white font-semibold text-lg">PDF preview unavailable on mobile</p>
              <p className="text-gray-400 text-sm mt-1 max-w-xs">
                Tap one of the buttons below to open or download the catalog.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <a
                href={pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                <ExternalLinkIcon />
                Open PDF
              </a>
              <a
                href={pdfPath}
                download
                className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-brand-primary text-white font-semibold text-sm hover:bg-brand-dark transition-colors"
              >
                <DownloadIcon />
                Download PDF
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Loading skeleton — shown while iframe loads */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-800">
                {/* Animated spinner */}
                <div className="w-10 h-10 border-4 border-white/20 border-t-brand-primary rounded-full animate-spin" aria-hidden="true" />
                <p className="text-gray-300 text-sm font-medium">Loading catalog…</p>
                <p className="text-gray-500 text-xs max-w-xs text-center">
                  On slow connections this may take a moment.
                </p>
                {/* Fallback link if it takes too long */}
                <a
                  href={pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-brand-primary text-xs underline hover:text-brand-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  Taking too long? Open directly →
                </a>
              </div>
            )}

            {/*
              Native browser PDF renderer via <iframe>.
              src is only set when the modal opens — no pre-fetching.
              #toolbar=1&view=FitH gives a clean initial fit on most browsers.
            */}
            <iframe
              src={`${pdfPath}#toolbar=1&view=FitH`}
              title={`${label} PDF catalog`}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
              aria-label={`${label} catalog document`}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Exported button + modal trigger ─────────────────────────────────────────

export default function CatalogPDFViewer({ pdfPath, label, btnClassName }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={btnClassName}
        aria-label={`View ${label} catalog online`}
        aria-haspopup="dialog"
      >
        <EyeIcon />
        View Online
      </button>

      {open && (
        <PDFModal pdfPath={pdfPath} label={label} onClose={close} />
      )}
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useId } from "react";

// ─── Icons ───────────────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ─── Placeholder icon config (category-specific) ─────────────────────────────

const PLACEHOLDER_ICONS = {
  surgical: (cls) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cls}
    >
      <path d="M20 4L8.5 15.5" />
      <path d="M8.5 15.5L5 19" />
      <path d="M14 4h6v6" />
      <path d="M9 9l-5 5" />
      <circle cx="5" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  dental: (cls) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cls}
    >
      <path d="M12 2C9 2 6 4 6 7c0 2 .5 3.5 1 5l1 8c.2 1 1 2 2 2h4c1 0 1.8-1 2-2l1-8c.5-1.5 1-3 1-5 0-3-3-5-6-5z" />
    </svg>
  ),
  beauty: (cls) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cls}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  ophthalmic: (cls) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cls}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

// ─── Catalog Cards ────────────────────────────────────────────────────────────

export default function CatalogCarousel({ catalogs }) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId}>
      {/* Heading */}
      <div className="text-center mb-8">
        <p className="text-eyebrow mb-2">
          Our Product Lines
        </p>
        <h2
          id={headingId}
          className="mt-3 text-4xl sm:text-5xl font-extrabold text-text-heading"
          style={{ letterSpacing: "-0.02em" }}
        >
          Browse Our <span className="text-brand-primary">Catalogs</span>
        </h2>
      </div>

      {/* Cards grid */}
      <ul
        role="list"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {catalogs.map((cat) => (
          <li key={cat.key}>
            <article className="group flex flex-col h-full bg-surface-lowest rounded-lg overflow-hidden shadow-ambient-sm hover:shadow-ambient hover:-translate-y-1 transition-all duration-200">
              {/* Clickable image → downloads PDF */}
              <a
                href={cat.pdfPath}
                download
                aria-label={`Download ${cat.label} PDF catalog`}
                className="block relative overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                <div
                  className={`relative overflow-hidden ${cat.bg}`}
                  style={{ height: "260px" }}
                >
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={`${cat.label} catalog cover`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="relative flex flex-col items-center justify-center h-full gap-3 overflow-hidden">
                      {/* Diagonal stripe texture */}
                      <div
                        className="absolute inset-0 opacity-40"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.025) 10px, rgba(0,0,0,0.025) 20px)",
                        }}
                        aria-hidden="true"
                      />
                      {(
                        PLACEHOLDER_ICONS[cat.key] ??
                        PLACEHOLDER_ICONS["surgical"]
                      )(
                        "relative w-14 h-14 opacity-50 text-gray-400",
                      )}
                      <span className="relative text-xs text-gray-400 font-medium">
                        Photo coming soon
                      </span>
                    </div>
                  )}

                  {/* Download badge — visible on hover */}
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-brand-primary/0 group-hover:bg-brand-primary/20 transition-colors duration-200"
                    aria-hidden="true"
                  >
                    <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-brand-primary text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-md">
                      <DownloadIcon />
                      Download PDF
                    </span>
                  </div>
                </div>
              </a>

              {/* Card body */}
              <div className="flex flex-col flex-1 p-5 gap-4">
                <a
                  href={cat.pdfPath}
                  download
                  aria-label={`Download ${cat.label} PDF catalog`}
                  className="group/text block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded"
                >
                  <h3 className="font-bold text-text-heading text-xl leading-snug group-hover/text:text-brand-primary group-hover/text:underline transition-colors">
                    {cat.label}
                  </h3>
                  <p className="mt-1 text-sm text-text-muted leading-relaxed">
                    {cat.short}
                  </p>
                </a>

                <div className="flex gap-2 mt-auto">
                  <a
                    href={cat.pdfPath}
                    download
                    aria-label={`Download ${cat.label} PDF`}
                    className="btn-primary flex-1 justify-center py-2.5 px-4 text-xs"
                  >
                    <DownloadIcon />
                    Download PDF
                  </a>
                  <Link
                    href={cat.catalogHref}
                    aria-label={`View ${cat.label} catalog details`}
                    className="btn-outline flex-1 justify-center py-2.5 px-4 text-xs"
                  >
                    View Catalog
                  </Link>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

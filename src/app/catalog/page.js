import Link from "next/link";
import Image from "next/image";
import CatalogEmailForm from "@/app/components/CatalogEmailForm";
import CatalogPDFViewer from "@/app/components/CatalogPDFViewer";

// ─── Catalog data ─────────────────────────────────────────────────────────────

const CATALOGS = [
  {
    key: "surgical",
    label: "Surgical Instruments",
    tagline: "Our flagship product line",
    description:
      "General-purpose surgical instruments including scissors, forceps, clamps, retractors, and needle holders — precision-manufactured to ISO standards for operating theatres worldwide.",
    href: "/products?cat=surgical",
    pdfPath: "/documents/surgical.pdf",
    image: "/images/catalog/SurgicalInstrumentsBanner.png",
  },
  {
    key: "dental",
    label: "Dental Instruments",
    tagline: "Oral healthcare essentials",
    description:
      "Comprehensive range of dental instruments including scalers, extraction forceps, periodontal curettes, mirrors, and explorers for dental clinics and oral surgeons.",
    href: "/products?cat=dental",
    pdfPath: "/documents/dental.pdf",
    image: "/images/catalog/DentalInstrumentsBanner.png",
  },
  {
    key: "beauty",
    label: "Beauty Care Instruments",
    tagline: "Professional salon & spa tools",
    description:
      "High-quality beauty instruments including scissors, cuticle nippers, tweezers, nail clippers, and comedone extractors for professional salons, spas, and podiatrists.",
    href: "/products?cat=beauty",
    pdfPath: "/documents/beauty.pdf",
    image: "/images/catalog/BeautyInstrumentsBanner.png",
  },
  {
    key: "ophthalmic",
    label: "Ophthalmic Instruments",
    tagline: "Precision eye care tools",
    description:
      "Specialised ophthalmic instruments including iris scissors, corneal forceps, eye specula, lacrimal cannulas, and IOL forceps for ophthalmic surgeons and eye clinics.",
    href: "/products?cat=ophthalmic",
    pdfPath: "/documents/Ophthalmic.pdf",
    image: "/images/catalog/OpthalmicInstrumentsBanner.png",
  },
];

// ─── Icons ───────────────────────────────────────────────────────────────────

function SurgicalIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M20 4L8.5 15.5" />
      <path d="M8.5 15.5L5 19" />
      <path d="M14 4h6v6" />
      <path d="M9 9l-5 5" />
      <circle cx="5" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function DentalIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M12 2C9 2 6 4 6 7c0 2 .5 3.5 1 5l1 8c.2 1 1 2 2 2h4c1 0 1.8-1 2-2l1-8c.5-1.5 1-3 1-5 0-3-3-5-6-5z" />
    </svg>
  );
}

function BeautyIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M6 3v11" />
      <path d="M18 3v11" />
      <path d="M6 8l6 3 6-3" />
      <path d="M6 14c0 3.31 2.69 6 6 6s6-2.69 6-6" />
    </svg>
  );
}

function OphthalmicIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
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

const ICONS = {
  surgical:   SurgicalIcon,
  dental:     DentalIcon,
  beauty:     BeautyIcon,
  ophthalmic: OphthalmicIcon,
};

// ─── Catalog Card ─────────────────────────────────────────────────────────────

function CatalogCard({ catalog, featured }) {
  const Icon = ICONS[catalog.key];

  return (
    <article
      id={catalog.key}
      aria-label={catalog.label}
      className={`flex flex-col bg-white rounded overflow-hidden hover:shadow-md transition-shadow duration-200 ${
        featured
          ? "border-2 border-brand-primary ring-2 ring-brand-primary/10"
          : "border border-gray-200"
      }`}
    >
      {/* F-pattern: featured badge on first card — highest visual weight at top-left of grid */}
      {featured && (
        <div className="bg-brand-primary text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Flagship Product Line
        </div>
      )}

      {/* Image area */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {catalog.image ? (
          <Image
            src={catalog.image}
            alt={`${catalog.label} catalog`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Icon className="w-16 h-16 text-gray-300" />
            <span className="text-xs text-gray-400">Photo coming soon</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-brand-primary uppercase tracking-wide">
            {catalog.tagline}
          </span>
          <h2 className="text-lg font-bold text-gray-900 leading-snug">
            {catalog.label}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {catalog.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 mt-auto">
          <Link
            href={catalog.href}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded bg-brand-primary hover:bg-brand-dark text-white font-semibold text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Browse Products
          </Link>
          <div className="flex gap-2">
            <CatalogPDFViewer
              pdfPath={catalog.pdfPath}
              label={catalog.label}
              btnClassName="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded border border-gray-300 text-gray-700 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            />
            <a
              href={catalog.pdfPath}
              download
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded border border-gray-300 text-gray-700 font-semibold text-sm hover:border-brand-primary hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              aria-label={`Download ${catalog.label} PDF catalog`}
            >
              <DownloadIcon />
              Download PDF
            </a>
          </div>
        </div>

        {/* Email form */}
        <CatalogEmailForm catalogKey={catalog.key} catalogLabel={catalog.label} />
      </div>

    </article>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export const metadata = {
  title: "Product Catalogs | Surgical Essence",
  description:
    "Download product catalogs for Surgical Essence's full range of surgical, dental, beauty care, ophthalmic, and single-use instruments.",
  openGraph: {
    title: "Product Catalogs | Surgical Essence",
    description:
      "Download product catalogs for Surgical Essence's full range of surgical, dental, beauty care, ophthalmic, and single-use instruments.",
    images: [{ url: "/images/catalog/SurgicalInstrumentsBanner.png", width: 1200, height: 630, alt: "Surgical Essence product catalogs" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Catalogs | Surgical Essence",
    description:
      "Download product catalogs for Surgical Essence's full range of surgical, dental, beauty care, ophthalmic, and single-use instruments.",
    images: ["/images/catalog/SurgicalInstrumentsBanner.png"],
  },
};

export default function CatalogPage() {
  return (
    <>
      {/* Page header */}
      <div className="bg-brand-primary text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">
            Product Catalogs
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Browse Our Full Range
          </h1>
          <p className="mt-2 text-white/80 text-base max-w-2xl leading-relaxed">
            Explore our four product lines and download detailed PDF catalogs. All instruments are
            manufactured in Sialkot, Pakistan and exported to healthcare professionals worldwide.
          </p>
        </div>
      </div>

      {/* Catalog grid */}
      <section
        aria-label="Product catalog categories"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* F-pattern: left-aligned section intro — users' first horizontal sweep starts here */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="border-l-4 border-brand-primary pl-5">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-primary mb-1">
              4 Product Lines
            </p>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Select a Category
            </h2>
          </div>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            Click any card to browse products or download the PDF catalog for that line.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATALOGS.map((catalog, i) => (
            <CatalogCard key={catalog.key} catalog={catalog} featured={i === 0} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center bg-gray-50 rounded-md border border-gray-200 px-6 py-10">
          <h2 className="text-xl font-bold text-gray-900">
            Need a custom quote?
          </h2>
          <p className="mt-2 text-gray-600 max-w-md mx-auto text-sm leading-relaxed">
            Our team can source specific instruments or provide bulk pricing for hospitals,
            distributors, and healthcare businesses.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex px-6 py-3 rounded-lg bg-brand-primary hover:bg-brand-dark text-white font-semibold text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Get a Quote
          </Link>
        </div>
      </section>
    </>
  );
}

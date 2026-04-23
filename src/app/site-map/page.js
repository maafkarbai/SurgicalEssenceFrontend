import Link from "next/link";

export const metadata = {
  title: "Sitemap | Surgical Essence",
  description:
    "Complete sitemap of Surgical Essence — browse all pages covering surgical instruments, product catalogs, quality control, distributor programs, and company information.",
};

// ─── Site structure ───────────────────────────────────────────────────────────

const SECTIONS = [
  {
    heading: "Products & Catalog",
    color: "blue",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
    links: [
      { href: "/products",                 label: "All Products",                desc: "Browse our complete range of surgical, dental, beauty, ophthalmic, and single-use instruments." },
      { href: "/products?cat=surgical",    label: "Surgical Instruments",        desc: "Scissors, forceps, clamps, retractors, needle holders, and more." },
      { href: "/products?cat=dental",      label: "Dental Instruments",          desc: "Scalers, dental forceps, mirrors, curettes, and probes." },
      { href: "/products?cat=beauty",      label: "Beauty Care Instruments",     desc: "Professional scissors, nippers, tweezers, and nail care tools." },
      { href: "/products?cat=ophthalmic",  label: "Ophthalmic Instruments",      desc: "Iris scissors, eye specula, forceps, and lid retractors." },
      { href: "/products?cat=single-use",  label: "Single Use Instruments",      desc: "Sterile scalpels, lancets, surgical staplers, and disposables." },
      { href: "/catalog",                  label: "Product Catalogs",            desc: "Download our full PDF catalogs for all product categories." },
    ],
  },
  {
    heading: "Company",
    color: "indigo",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    links: [
      { href: "/",               label: "Home",            desc: "Welcome page — company overview, featured catalogs, and key contact CTAs." },
      { href: "/about",          label: "About Us",         desc: "Our history since 1986, Sialkot manufacturing heritage, and global capabilities." },
      { href: "/quality-control",label: "Quality Control",  desc: "Our 5-stage QC process — hardness, corrosion, elasticity, cutting, and visual inspection." },
      { href: "/press-releases", label: "Press Releases",   desc: "Latest company news, product launches, and announcements." },
    ],
  },
  {
    heading: "Work With Us",
    color: "teal",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    links: [
      { href: "/contact",     label: "Contact Us",          desc: "Send a product enquiry, request a quote, or ask a general question." },
      { href: "/distributor", label: "Become a Distributor", desc: "Apply to join our global distribution network and partner programme." },
    ],
  },
  {
    heading: "Legal & Info",
    color: "gray",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    links: [
      { href: "/privacy", label: "Privacy Policy", desc: "How we collect, use, and protect your personal data." },
      { href: "/terms",   label: "Terms of Use",   desc: "Terms and conditions governing use of this website." },
      { href: "/sitemap", label: "Sitemap",         desc: "This page — a complete index of all pages on the Surgical Essence website." },
    ],
  },
];

// ─── Colour maps ─────────────────────────────────────────────────────────────

const COLOR = {
  blue:   { icon: "text-blue-600",   bg: "bg-slate-50",   border: "border-gray-200",  badge: "bg-slate-100  text-brand-primary"  },
  indigo: { icon: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700" },
  teal:   { icon: "text-teal-600",   bg: "bg-slate-50",   border: "border-teal-200",  badge: "bg-teal-100  text-brand-primary"  },
  gray:   { icon: "text-gray-500",   bg: "bg-gray-50",   border: "border-gray-200",  badge: "bg-gray-100  text-gray-600"  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SitemapPage() {
  const totalLinks = SECTIONS.reduce((n, s) => n + s.links.length, 0);

  return (
    <>
      {/* ── Header ── */}
      <div className="bg-brand-primary text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">Navigation</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Sitemap</h1>
          <p className="mt-3 text-white/80 text-base max-w-xl">
            A complete index of every page on the Surgical Essence website —
            {" "}{SECTIONS.length} sections, {totalLinks} pages.
          </p>
        </div>
      </div>

      {/* ── Sections ── */}
      <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col gap-10">
          {SECTIONS.map((section) => {
            const c = COLOR[section.color];
            return (
              <section key={section.heading} aria-labelledby={`section-${section.heading.replace(/\s+/g, "-").toLowerCase()}`}>

                {/* Section heading */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.border} border flex items-center justify-center ${c.icon} shrink-0`}>
                    {section.icon}
                  </div>
                  <h2
                    id={`section-${section.heading.replace(/\s+/g, "-").toLowerCase()}`}
                    className="text-lg font-bold text-gray-900"
                  >
                    {section.heading}
                  </h2>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.badge}`}>
                    {section.links.length}
                  </span>
                </div>

                {/* Links */}
                <ul
                  role="list"
                  className="grid sm:grid-cols-2 gap-3"
                >
                  {section.links.map(({ href, label, desc }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`group flex flex-col gap-1 p-4 rounded-xl border ${c.border} bg-white hover:${c.bg} hover:shadow-sm transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-semibold text-gray-900 group-hover:${c.icon} transition-colors`}>
                            {label}
                          </span>
                          <svg
                            width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                            aria-hidden="true"
                            className="shrink-0 text-gray-300 group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all"
                          >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-500 leading-relaxed">{desc}</span>
                        <span className="text-xs text-gray-400 font-mono mt-0.5">{href}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {/* ── Back to home ── */}
        <div className="mt-14 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Can't find what you're looking for?{" "}
            <Link href="/contact" className="text-brand-primary font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-brand-primary rounded">
              Contact our team
            </Link>
            {" "}— we're happy to help.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-dark text-white font-semibold text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary shrink-0"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </>
  );
}

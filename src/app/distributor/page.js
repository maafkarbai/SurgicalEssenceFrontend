import Image from "next/image";
import Link from "next/link";
import DistributorForm from "./DistributorForm";

export const metadata = {
  title: "Become a Distributor | Surgical Essence",
  description:
    "Partner with Surgical Essence as an authorised distributor. ISO-certified surgical instruments from Sialkot, Pakistan. Factory-direct pricing, territory exclusivity, and full marketing support.",
  openGraph: {
    title: "Become a Distributor | Surgical Essence",
    description:
      "Partner with Surgical Essence as an authorised distributor. ISO-certified surgical instruments from Sialkot, Pakistan. Factory-direct pricing, territory exclusivity, and full marketing support.",
    images: [{ url: "/images/hero/DistributorBanner.jpg", width: 1200, height: 630, alt: "Surgical Essence distributor partnership" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Become a Distributor | Surgical Essence",
    description:
      "Partner with Surgical Essence as an authorised distributor. ISO-certified surgical instruments from Sialkot, Pakistan. Factory-direct pricing, territory exclusivity, and full marketing support.",
    images: ["/images/hero/DistributorBanner.jpg"],
  },
};

// ─── Static data ──────────────────────────────────────────────────────────────

const WHY_US = [
  {
    icon: <ShieldIcon />,
    title: "ISO Certified Quality",
    desc: "Our surgical instruments are manufactured using high-grade stainless steel with strict quality control to ensure durability, precision, and reliability in clinical environments. We hold ISO 13485 and CE certifications.",
  },
  {
    icon: <PackageIcon />,
    title: "Wide Product Portfolio",
    desc: "We offer a broad range of surgical instruments including general surgery, orthopedic, dental, ophthalmic, beauty care, and single-use instruments — giving your customers a complete one-stop solution.",
  },
  {
    icon: <GlobeIcon />,
    title: "30+ Years of Export Experience",
    desc: "Based in Sialkot, Pakistan — the world's surgical instruments manufacturing hub — we have been exporting to distributors across 50+ countries for over three decades.",
  },
  {
    icon: <TagIcon />,
    title: "Factory-Direct Pricing",
    desc: "As a direct manufacturer, we offer competitive pricing with attractive distributor margins and scalable bulk discounts. No middlemen — direct from our factory to your customers.",
  },
  {
    icon: <MapPinIcon />,
    title: "Territory Exclusivity",
    desc: "For qualified distribution partners, we offer regional territory exclusivity — protecting your market position and giving you a competitive advantage in your territory.",
  },
  {
    icon: <FileTextIcon />,
    title: "Full Marketing Support",
    desc: "We provide product catalogs, high-resolution images, technical documentation, and sales materials to help you effectively market and sell our instruments.",
  },
];

const CATEGORIES = [
  { name: "General Surgery",        items: "Scissors, forceps, clamps, retractors, needle holders", color: "bg-slate-50 border-gray-200",  dotColor: "bg-slate-500"       },
  { name: "Dental Instruments",     items: "Scalers, extractors, curettes, mirrors, explorers",    color: "bg-slate-50 border-gray-200",  dotColor: "bg-brand-primary"   },
  { name: "Ophthalmic Instruments", items: "Iris scissors, specula, forceps, cannulas",            color: "bg-slate-50 border-teal-200",  dotColor: "bg-slate-500"       },
  { name: "Beauty Care",            items: "Scissors, nippers, tweezers, nail tools",              color: "bg-slate-50 border-gray-200",  dotColor: "bg-brand-primary"   },
  { name: "Single Use / Disposable",items: "Scalpels, lancets, staplers, sterile instruments",    color: "bg-amber-50 border-amber-200", dotColor: "bg-amber-500"       },
  { name: "Veterinary Instruments", items: "Surgical scissors, forceps, clamps for veterinary use",color: "bg-green-50 border-green-200", dotColor: "bg-green-500"       },
];

const REQUIREMENTS = [
  "Established experience in medical, surgical, or healthcare product distribution",
  "Active sales network with hospitals, clinics, or healthcare suppliers",
  "Compliance with medical device import and distribution regulations in your country",
  "Legal ability to import and distribute medical instruments in your region",
  "Commitment to representing the brand professionally in your market",
  "Financial capacity to maintain adequate stock levels",
];

const REGIONS = [
  { name: "Europe",             status: "active"    },
  { name: "Middle East",        status: "active"    },
  { name: "North America",      status: "expanding" },
  { name: "South Asia",         status: "active"    },
  { name: "Southeast Asia",     status: "expanding" },
  { name: "Africa",             status: "expanding" },
  { name: "Latin America",      status: "expanding" },
  { name: "Australia / Oceania",status: "expanding" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

// ─── Page (Server Component) ──────────────────────────────────────────────────

export default function DistributorPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section aria-label="Distributor partnership invitation" className="bg-brand-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1 text-center lg:text-left">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-white/70 mb-3">
              Global Distribution Partnership
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Become an Authorised{" "}
              <span className="block text-white/70">Distributor</span>
            </h1>
            <p className="mt-4 text-white/80 text-base sm:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Surgical Essence is expanding its global distribution network. We welcome experienced
              medical distributors, healthcare suppliers, and importers to partner with us and
              deliver high-quality surgical instruments to hospitals and healthcare providers worldwide.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a href="#apply" className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-white text-brand-primary font-bold text-base hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Apply Now
              </a>
              <a href="#benefits" className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg border-2 border-white/60 text-white font-bold text-base hover:bg-white/10 hover:border-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                Learn More
              </a>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center w-full max-w-sm lg:max-w-none">
            <div className="w-full aspect-[16/9] relative rounded-md overflow-hidden shadow-2xl">
              <Image
                src="/images/hero/DistributorBanner.jpg"
                alt="Surgical Essence global distribution network"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <div className="relative pb-8 flex justify-center">
          <a href="#apply" className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors animate-bounce focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded" aria-label="Scroll to application form">
            <span className="text-xs font-semibold uppercase tracking-widest" aria-hidden="true">Apply Below</span>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── Application Form (only client boundary on this page) ── */}
      <section id="apply" aria-labelledby="apply-heading" className="py-16 sm:py-20 bg-white border-y border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="apply-heading" className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              Apply to Become a Distributor
            </h2>
            <p className="mt-3 text-gray-500 text-base sm:text-lg">
              Fill in the form below and our partnership team will get back to you within 3–5 business days.
            </p>
          </div>
          <div className="bg-gray-50 rounded-md border border-gray-200 p-6 sm:p-8">
            <DistributorForm />
          </div>
        </div>
      </section>

      {/* ── Why Partner With Us ── */}
      <section id="benefits" aria-labelledby="why-heading" className="py-16 sm:py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="why-heading" className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              Why Partner With Surgical Essence?
            </h2>
            <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Join a trusted manufacturer with decades of export experience and a commitment to quality.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {WHY_US.map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col gap-4 p-6 rounded-xl border border-gray-200 hover:border-brand-primary hover:shadow-md transition-all">
                <span className="text-brand-primary">{icon}</span>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certifications ── */}
      <section aria-label="Certifications and compliance" className="py-10 bg-slate-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 flex-wrap">
            {[
              { badge: "ISO 13485", label: "Medical Device Quality Management" },
              { badge: "CE",        label: "European Conformity Certified" },
              { badge: "Sialkot",   label: "Made in the Surgical Instruments Capital" },
              { badge: "50+ Countries", label: "Active Export Network" },
            ].map(({ badge, label }) => (
              <div key={badge} className="flex items-center gap-3 text-center sm:text-left">
                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-primary text-white font-extrabold text-xs shrink-0">
                  {badge}
                </span>
                <span className="text-sm font-semibold text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Categories ── */}
      <section aria-labelledby="categories-heading" className="py-16 sm:py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="categories-heading" className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              What You Can Distribute
            </h2>
            <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              A comprehensive product portfolio covering multiple medical and healthcare specialties.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map(({ name, items, color, dotColor }) => (
              <div key={name} className={`rounded-xl border p-5 ${color} flex items-start gap-4`}>
                <span className={`mt-1 w-3 h-3 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-gray-900">{name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{items}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/catalog" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-primary hover:bg-brand-dark text-white font-bold text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
              Download Full Catalogs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Global Reach ── */}
      <section aria-labelledby="regions-heading" className="py-16 sm:py-20 bg-white border-y border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="regions-heading" className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              Our Global Reach
            </h2>
            <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Currently supplying distributors across multiple continents, with active expansion into new markets.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {REGIONS.map(({ name, status }) => (
              <div key={name} className={`rounded-xl border p-4 text-center ${status === "active" ? "border-brand-primary bg-slate-100" : "border-gray-200 bg-gray-50"}`}>
                <p className="font-semibold text-sm text-gray-900">{name}</p>
                <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold ${status === "active" ? "bg-brand-primary text-white" : "bg-amber-100 text-amber-700"}`}>
                  {status === "active" ? "Active" : "Expanding"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Requirements ── */}
      <section aria-labelledby="requirements-heading" className="py-16 sm:py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="requirements-heading" className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              Who We Are Looking For
            </h2>
            <p className="mt-3 text-gray-500 text-base sm:text-lg">
              We partner with serious, professional distributors who meet the following criteria:
            </p>
          </div>
          <ul role="list" className="space-y-4">
            {REQUIREMENTS.map((req) => (
              <li key={req} className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4">
                <span className="shrink-0 mt-0.5 text-green-600"><CheckIcon /></span>
                <span className="text-gray-700 text-sm sm:text-base">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section aria-label="Contact for more information" className="bg-brand-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Have questions before applying?</h2>
          <p className="mt-3 text-white/80 text-base sm:text-lg max-w-lg mx-auto">
            Our team is ready to discuss partnership terms, pricing, and product availability.
            Reach out directly and we will respond within 24 hours.
          </p>
          <Link href="/contact" className="mt-6 inline-flex px-8 py-3.5 rounded-lg bg-white text-brand-primary font-bold text-base hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Contact Our Team
          </Link>
        </div>
      </section>
    </>
  );
}

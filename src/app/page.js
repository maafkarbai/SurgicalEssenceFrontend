import Link from "next/link";
import Image from "next/image";
import HomeContactForm from "@/app/components/HomeContactForm";
import HomepageProductBrowser from "@/app/components/HomepageProductBrowser";
import NewsletterSection from "@/app/components/NewsletterSection";
import { prisma } from "@/lib/prisma";
import AddToQuoteButton from "@/app/products/[slug]/AddToQuoteButton";

export const metadata = {
  title: "Surgical Essence | Precision Surgical Instruments Manufacturer",
  description:
    "ISO-certified surgical instruments manufacturer based in Sialkot, Pakistan. Supplying hospitals, distributors, and healthcare providers worldwide with precision surgical, dental, ophthalmic, and beauty care instruments.",
};

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getLatestPressReleases() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/press-releases?page=1&limit=3`,
      { next: { revalidate: 60 } },
    );
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function readingTime(content) {
  const words = (content ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [pressReleases, featuredProduct] = await Promise.all([
    getLatestPressReleases(),
    prisma.product.findFirst({
      where: { active: true, featured: true },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        description: true,
        material: true,
        certifications: true,
        imageUrls: true,
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <>
      {/* ══ Hero ════════════════════════════════════════════════════════════ */}
      <section className="max-w-screen-2xl mx-auto px-8 py-2 md:py-3 grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
        {/* Left — copy */}
        <div className="space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#77f4e8]/30 text-[#006a63] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="#006a63"
              stroke="#006a63"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline
                points="9 12 11 14 15 10"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            ISO 13485 &amp; CE Certified
          </div>

          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-[#003b72] leading-[1.1] tracking-tight">
            Precise Surgical Instruments{" "}
            <span className="text-[#006a63]">You Can Trust</span>
          </h1>

          <p className="text-base text-on-surface-variant max-w-xl leading-relaxed">
            High-performance medical tools designed for surgeons, clinics, and
            hospitals worldwide. Engineering excellence meets clinical precision
            in every instrument we manufacture.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/contact"
              className="btn-primary px-6 py-3 text-base justify-center"
            >
              Get a Quote
            </Link>
            <Link
              href="/catalog"
              className="btn-outline px-6 py-3 text-base justify-center"
            >
              Download Catalog
            </Link>
          </div>
        </div>

        {/* Right — hero image with glow */}
        <div className="relative group max-w-sm lg:max-w-md mx-auto w-full">
          <div
            className="absolute -inset-4 bg-gradient-to-tr from-[#003b72]/10 to-[#006a63]/10 rounded-xl blur-2xl transition-all group-hover:blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="relative rounded-xl overflow-hidden aspect-video"
            style={{ boxShadow: "0 16px 32px rgba(0,59,114,0.12)" }}
          >
            <Image
              src="/images/hero/Hero.png"
              alt="Professional surgical instruments — Surgical Essence manufacturing"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Certification badges */}
          <div
            className="mt-3 flex items-center justify-center gap-2"
            aria-label="Quality certifications"
          >
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg px-4 py-2.5 shadow-sm">
              <Image
                src="/ISO_Logo_(Red_square).svg"
                alt="ISO Certified"
                width={56}
                height={56}
                className="object-contain h-9 w-auto"
              />
              <span className="w-px h-6 bg-slate-200" aria-hidden="true" />
              <Image
                src="/ce-mark.svg"
                alt="CE Mark Certified"
                width={112}
                height={79}
                className="object-contain h-9 w-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ Certification Strip ════════════════════════════════════════════ */}
      <div className="bg-[#f5f6f7] border-b border-[#ecedef] py-3.5">
        <div className="max-w-7xl mx-auto px-8 flex flex-wrap gap-x-8 gap-y-3 items-center justify-center">
          {[
            { code: "ISO 13485:2016", desc: "Medical Device QMS" },
            { code: "ISO 9001:2015",  desc: "Quality Management" },
            { code: "CE Mark",        desc: "European Conformity" },
            { code: "FDA Registered", desc: "US FDA Establishment" },
            { code: "WHO GMP",        desc: "Good Manufacturing Practice" },
            { code: "CDSCO",          desc: "Indian Regulatory Approval" },
          ].map(({ code, desc }) => (
            <div key={code} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#e8f4fc] border border-[#9ccbee] flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1677b5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <span className="text-xs font-bold text-[#232528]">{code}</span>
                <span className="text-[11px] text-[#8c9098] ml-1.5">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Product Categories ══════════════════════════════════════════════ */}
      <section className="max-w-screen-2xl mx-auto px-8 py-16">
        <div className="mb-8">
          <h2 className="font-headline text-3xl font-bold text-[#003b72]">
            Popular Categories
          </h2>
          <div className="w-full h-px bg-slate-200 mt-3" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: "Surgical",
              href: "/products?cat=surgical",
              image: "/images/catalog/SurgicalInstrumentsBanner.png",
            },
            {
              name: "Dental",
              href: "/products?cat=dental",
              image: "/images/catalog/DentalInstrumentsBanner.png",
            },
            {
              name: "Beauty Care",
              href: "/products?cat=beauty",
              image: "/images/catalog/BeautyInstrumentsBanner.png",
            },
            {
              name: "Ophthalmic",
              href: "/products?cat=ophthalmic",
              image: "/images/catalog/OpthalmicInstrumentsBanner.png",
            },
          ].map(({ name, href, image }) => (
            <Link
              key={name}
              href={href}
              className="group rounded-xl overflow-hidden block border border-slate-200 hover:border-[#003b72] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]"
            >
              {/* Image — cover fills edge to edge, aspect ratio matches landscape banners */}
              <div className="relative aspect-video">
                <Image
                  src={image}
                  alt={`${name} instruments`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>
              {/* Label */}
              <div className="px-4 py-3 flex items-center justify-between bg-white">
                <h3 className="font-headline font-bold text-[#003b72] text-base">
                  {name}
                </h3>
                <span className="text-sm font-bold text-[#006a63] group-hover:translate-x-0.5 transition-transform">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ Products ════════════════════════════════════════════════════════ */}
      <section className="max-w-screen-2xl mx-auto px-8 py-16">
        <HomepageProductBrowser />
      </section>

      {/* ══ Why Choose Us ═══════════════════════════════════════════════════ */}
      <section aria-labelledby="why-us-heading" className="bg-[#f5f5f5] py-24">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">

            {/* ── Left column ── */}
            <div className="flex flex-col gap-4">
              {/* Certified Quality */}
              <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 flex-1" style={{ boxShadow: "0 4px 24px rgba(0,59,114,0.06)" }}>
                <div className="w-12 h-12 rounded-xl bg-[#f0f7ff] flex items-center justify-center text-[#006a63] shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#191c1d] mb-1">Certified Quality</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Strict adherence to ISO 13485 and CE mark requirements across every product line.</p>
                </div>
              </div>

              {/* Custom Branding */}
              <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 flex-1" style={{ boxShadow: "0 4px 24px rgba(0,59,114,0.06)" }}>
                <div className="w-12 h-12 rounded-xl bg-[#f0f7ff] flex items-center justify-center text-[#006a63] shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="4 7 4 4 20 4 20 7"/>
                    <line x1="9" y1="20" x2="15" y2="20"/>
                    <line x1="12" y1="4" x2="12" y2="20"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#191c1d] mb-1">Custom Branding</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Laser engraving and private labeling tailored to your medical brand identity.</p>
                </div>
              </div>
            </div>

            {/* ── Center — featured card ── */}
            <div className="bg-[#003b72] rounded-2xl p-8 lg:p-10 flex flex-col items-center justify-center text-center" style={{ boxShadow: "0 16px 48px rgba(0,59,114,0.20)" }}>
              <p className="text-xs font-bold uppercase tracking-widest text-secondary-container mb-4">Why Choose Us</p>
              <h2
                id="why-us-heading"
                className="font-headline text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-4"
              >
                The Surgical Essence Advantage
              </h2>
              <p className="text-on-primary-container text-sm leading-relaxed mb-8 max-w-xs">
                Heritage craftsmanship meets modern manufacturing — delivering unmatched reliability to hospitals and distributors worldwide.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full">
                {[
                  ["500+",      "Products"],
                  ["30+",       "Countries"],
                  ["ISO 13485", "Certified"],
                  ["CE Mark",   "Approved"],
                ].map(([val, label]) => (
                  <div key={label} className="bg-white/10 rounded-xl p-4 text-center">
                    <p className="text-lg font-extrabold text-white">{val}</p>
                    <p className="text-xs text-on-primary-container mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right column ── */}
            <div className="flex flex-col gap-4">
              {/* Global Shipping */}
              <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 flex-1" style={{ boxShadow: "0 4px 24px rgba(0,59,114,0.06)" }}>
                <div className="w-12 h-12 rounded-xl bg-[#f0f7ff] flex items-center justify-center text-[#006a63] shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#191c1d] mb-1">Global Shipping</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Efficient logistics network reaching healthcare hubs across 30+ countries.</p>
                </div>
              </div>

              {/* Bulk Pricing */}
              <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 flex-1" style={{ boxShadow: "0 4px 24px rgba(0,59,114,0.06)" }}>
                <div className="w-12 h-12 rounded-xl bg-[#f0f7ff] flex items-center justify-center text-[#006a63] shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#191c1d] mb-1">Bulk Pricing</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Tiered pricing structures optimized for hospital procurement and distributors.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ Featured Instruments ════════════════════════════════════════════ */}
      <section className="max-w-screen-2xl mx-auto px-8 py-24">
        <div className="mb-16">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-4xl font-bold text-[#003b72]">
              Featured Instruments
            </h2>
            <Link
              href="/products"
              className="flex items-center gap-2 text-[#003b72] font-bold hover:text-primary-container transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72] rounded"
            >
              View All
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
          <div className="w-full h-px bg-slate-200 mt-4" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              image: "/images/products/forceps-1.jpg",
              badge: "Surgical Grade",
              title: "Precision Forceps",
              desc: "Ultra-fine serrated tips for non-slip grip during delicate tissue manipulation.",
              ref: "SE-4402",
              href: "/products?cat=surgical",
            },
            {
              image: "/images/products/scalpel-1.jpg",
              badge: "Operating Room",
              title: "Surgical Scissors",
              desc: "Ergonomic design with laser-sharpened edges for consistent performance.",
              ref: "SE-1099",
              href: "/products?cat=surgical",
            },
            {
              image: "/images/products/forceps-9.jpg",
              badge: "Micro-Surgery",
              title: "Ophthalmic Micro-scissors",
              desc: "Titanium coated micro-blades for high-frequency use in ocular surgery.",
              ref: "SE-8821",
              href: "/products?cat=ophthalmic",
            },
          ].map(({ image, badge, title, desc, ref, href }) => (
            <div
              key={ref}
              className="bg-white border-b-4 border-transparent hover:border-[#006a63] transition-all rounded-xl overflow-hidden group"
              style={{ boxShadow: "0 16px 32px rgba(0,59,114,0.06)" }}
            >
              <div className="relative aspect-video bg-slate-50 overflow-hidden">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5">
                <span className="text-xs font-bold text-[#006a63] uppercase tracking-wider">
                  {badge}
                </span>
                <h3 className="text-base font-bold font-headline mt-1.5 text-[#191c1d]">
                  {title}
                </h3>
                <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">
                  {desc}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[#003b72] font-bold text-sm">
                    Ref: {ref}
                  </span>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 bg-[#003b72] text-white px-4 py-2 text-xs font-bold rounded hover:bg-primary-container transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]"
                  >
                    Add to Quote
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ Lead Capture ════════════════════════════════════════════════════ */}
      <section className="max-w-screen-2xl mx-auto px-8 py-24">
        <div className="bg-[#003b72] rounded-xl overflow-hidden flex flex-col lg:flex-row shadow-2xl shadow-[#003b72]/20">
          {/* Left — blue side */}
          <div className="lg:w-1/2 p-12 lg:p-20 text-white flex flex-col justify-center">
            <h2 className="font-headline text-4xl font-extrabold mb-6">
              Get a Quote Within 24 Hours
            </h2>
            <p className="text-on-primary-container text-lg leading-relaxed mb-8">
              Ready to upgrade your clinical toolkit? Our specialists are on
              standby to provide custom pricing and technical consultation for
              your hospital or clinic.
            </p>
            <ul className="space-y-4">
              {[
                "Custom surgical sets tailored to your needs.",
                "Global door-to-door delivery.",
                "Bulk pricing for hospitals & distributors.",
              ].map((item) => (
                <li key={item} className="flex items-center gap-4">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#77f4e8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — form */}
          <div className="lg:w-1/2 bg-white p-12 lg:p-20">
            <HomeContactForm />
          </div>
        </div>
      </section>

      {/* ══ Newsletter ══════════════════════════════════════════════════════ */}
      <NewsletterSection />

      {/* ══ Press Releases ══════════════════════════════════════════════════ */}
      {pressReleases.length > 0 && (
        <section aria-labelledby="press-heading" className="bg-[#f8f9fa]">
          <div className="max-w-screen-2xl mx-auto px-8 py-16 sm:py-20">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-container mb-2">
                Latest News
              </p>
              <h2
                id="press-heading"
                className="font-headline text-3xl sm:text-4xl font-extrabold text-[#191c1d]"
              >
                Press Releases
              </h2>
              <div
                className="w-full h-px bg-slate-300 mt-4"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm text-slate-500">
                For more news, visit our{" "}
                <Link
                  href="/press-releases"
                  className="text-primary-container font-semibold hover:underline rounded"
                >
                  Press Releases
                </Link>{" "}
                page.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pressReleases.map((item) => (
                <Link
                  key={item.id}
                  href={`/press-releases/${item.slug ?? item.id}`}
                  className="group flex flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container rounded-md"
                >
                  <div className="relative h-48 bg-slate-100 overflow-hidden rounded-md">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-10 h-10 opacity-40"
                          aria-hidden="true"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide bg-primary-container text-white shadow-sm">
                      Press Release
                    </span>
                  </div>
                  <div className="flex flex-col pt-4 gap-1.5">
                    <h3 className="font-bold text-[#191c1d] text-[0.95rem] leading-snug group-hover:text-primary-container transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                      {formatDate(item.publishedAt)}
                      <span aria-hidden="true">·</span>
                      {readingTime(item.content)} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

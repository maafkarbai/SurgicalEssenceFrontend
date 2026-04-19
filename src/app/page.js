import Link from "next/link";
import Image from "next/image";
import HomeContactForm from "@/app/components/HomeContactForm";

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
  const pressReleases = await getLatestPressReleases();

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
              className="inline-flex items-center justify-center bg-[#003b72] text-white px-6 py-3 font-bold rounded hover:bg-[#00529b] transition-all shadow-lg shadow-[#003b72]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]"
            >
              Request a Quote
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center border-2 border-[#003b72] text-[#003b72] px-6 py-3 font-bold rounded hover:bg-[#f3f4f5] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]"
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
            className="relative rounded-xl overflow-hidden aspect-[16/9]"
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

          {/* Certifications strip */}
          <Link
            href="/certifications"
            className="mt-3 block rounded-lg overflow-hidden hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]"
            aria-label="View our certifications — SCCI, CE Class I, ISO 13485, ISO 9001"
          >
            <Image
              src="/images/certifications/CertificationsLogos.png"
              alt="Our certifications: SCCI Chamber of Commerce, CE Class I, ISO 13485, ISO 9001"
              width={1160}
              height={232}
              className="w-full h-auto"
            />
          </Link>
        </div>
      </section>

      {/* ══ Product Categories ══════════════════════════════════════════════ */}
      <section className="max-w-screen-2xl mx-auto px-8 py-16">
        <div className="mb-8">
          <h2 className="font-headline text-3xl font-bold text-[#003b72]">Popular Categories</h2>
          <div className="w-full h-px bg-slate-200 mt-3" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Surgical",    href: "/products?cat=surgical",   image: "/images/catalog/SurgicalInstrumentsBanner.png"  },
            { name: "Dental",      href: "/products?cat=dental",     image: "/images/catalog/DentalInstrumentsBanner.png"    },
            { name: "Beauty Care", href: "/products?cat=beauty",     image: "/images/catalog/BeautyInstrumentsBanner.png"    },
            { name: "Ophthalmic",  href: "/products?cat=ophthalmic", image: "/images/catalog/OpthalmicInstrumentsBanner.png" },
          ].map(({ name, href, image }) => (
            <Link
              key={name}
              href={href}
              className="group rounded-xl overflow-hidden block border border-slate-200 hover:border-[#003b72] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]"
            >
              {/* Image — cover fills edge to edge, aspect ratio matches landscape banners */}
              <div className="relative aspect-[16/9]">
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

      {/* ══ Why Choose Us ═══════════════════════════════════════════════════ */}
      <section aria-labelledby="why-us-heading" className="bg-slate-50 py-24">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2
              id="why-us-heading"
              className="font-headline text-3xl font-bold text-[#003b72]"
            >
              The Surgical Essence Advantage
            </h2>
            <div className="w-full h-px bg-slate-300 mt-4" aria-hidden="true" />
            <p className="text-[#424751] mt-4 leading-relaxed">
              We combine heritage craftsmanship with modern manufacturing
              standards to deliver unmatched reliability.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              {
                label: "Certified Quality",
                desc: "Strict adherence to ISO 13485 and CE mark requirements.",
                icon: (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                ),
              },
              {
                label: "Global Shipping",
                desc: "Efficient logistics network reaching healthcare hubs worldwide.",
                icon: (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                ),
              },
              {
                label: "Custom Branding",
                desc: "Laser engraving and private labeling for your medical brand.",
                icon: (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="4 7 4 4 20 4 20 7" />
                    <line x1="9" y1="20" x2="15" y2="20" />
                    <line x1="12" y1="4" x2="12" y2="20" />
                  </svg>
                ),
              },
              {
                label: "Bulk Pricing",
                desc: "Tiered pricing structures optimized for hospital procurement.",
                icon: (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                ),
              },
            ].map(({ label, desc, icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center group"
              >
                <div
                  className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-[#006a63] mb-6 group-hover:scale-110 transition-transform"
                  style={{ boxShadow: "0 16px 32px rgba(0,59,114,0.06)" }}
                >
                  {icon}
                </div>
                <h4 className="font-bold text-[#191c1d] mb-2">{label}</h4>
                <p className="text-sm text-[#424751]">{desc}</p>
              </div>
            ))}
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
              className="flex items-center gap-2 text-[#003b72] font-bold hover:text-[#00529b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72] rounded"
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
              <div className="relative aspect-[16/9] bg-slate-50 overflow-hidden">
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
                <p className="text-[#424751] text-sm mt-2 leading-relaxed">
                  {desc}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[#003b72] font-bold text-sm">
                    Ref: {ref}
                  </span>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 bg-[#003b72] text-white px-4 py-2 text-xs font-bold rounded hover:bg-[#00529b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]"
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
            <p className="text-[#a5c7ff] text-lg leading-relaxed mb-8">
              Ready to upgrade your clinical toolkit? Our specialists are on
              standby to provide custom pricing and technical consultation for
              your hospital or clinic.
            </p>
            <ul className="space-y-4">
              {[
                "Custom surgical sets tailored to your needs.",
                "Global door-to-door delivery.",
                "Bulk pricing for hospitals &amp; distributors.",
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
                  <span dangerouslySetInnerHTML={{ __html: item }} />
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

      {/* ══ Press Releases ══════════════════════════════════════════════════ */}
      {pressReleases.length > 0 && (
        <section aria-labelledby="press-heading" className="bg-[#f8f9fa]">
          <div className="max-w-screen-2xl mx-auto px-8 py-16 sm:py-20">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#00529b] mb-2">
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
                  className="text-[#00529b] font-semibold hover:underline rounded"
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
                  className="group flex flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00529b] rounded-md"
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
                    <span className="absolute bottom-3 left-3 inline-flex items-center px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wide bg-[#00529b] text-white shadow-sm">
                      Press Release
                    </span>
                  </div>
                  <div className="flex flex-col pt-4 gap-1.5">
                    <h3 className="font-bold text-[#191c1d] text-[0.95rem] leading-snug group-hover:text-[#00529b] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
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

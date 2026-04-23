import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "About Us | Surgical Essence",
  description:
    "Surgical Essence has manufactured precision surgical instruments in Sialkot, Pakistan since 1986. ISO 9001:2015 certified, CE Marked, and FDA Listed — supplying hospitals and distributors in 50+ countries.",
  openGraph: {
    title: "About Us | Surgical Essence",
    description:
      "Surgical Essence has manufactured precision surgical instruments in Sialkot, Pakistan since 1986. ISO 9001:2015 certified, CE Marked, and FDA Listed — supplying hospitals and distributors in 50+ countries.",
    images: [{ url: "/images/hero/Hero.png", width: 1200, height: 630, alt: "Surgical Essence — precision surgical instruments from Sialkot" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Surgical Essence",
    description:
      "Surgical Essence has manufactured precision surgical instruments in Sialkot, Pakistan since 1986. ISO 9001:2015 certified, CE Marked, and FDA Listed — supplying hospitals and distributors in 50+ countries.",
    images: ["/images/hero/Hero.png"],
  },
};

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "1986",  label: "Year Established",      sub: "Nearly four decades of manufacturing" },
  { value: "50+",   label: "Countries Served",       sub: "Trusted by buyers across the globe"   },
  { value: "5",     label: "Product Lines",          sub: "Surgical, dental, beauty & more"       },
  { value: "ISO",   label: "9001:2015 Certified",   sub: "CE Marked · FDA Listed"                },
];

const CAPABILITIES = [
  {
    title: "Surgical Instruments",
    items: ["Scissors & dissectors", "Haemostatic forceps & clamps", "Retractors & hooks", "Needle holders", "Tissue & thumb forceps"],
  },
  {
    title: "Dental Instruments",
    items: ["Extraction forceps", "Periodontal curettes & scalers", "Dental mirrors & explorers", "Bone rongeurs", "Saliva ejectors"],
  },
  {
    title: "Ophthalmic Instruments",
    items: ["Iris & conjunctival scissors", "Corneal & iris forceps", "Eye specula", "Lacrimal cannulas", "IOL implantation forceps"],
  },
  {
    title: "Beauty Care",
    items: ["Precision scissors", "Cuticle nippers", "Tweezers & extractors", "Nail clippers & files", "Eyebrow shaping tools"],
  },
  {
    title: "Single Use / Disposable",
    items: ["Disposable scalpels", "Safety lancets", "Skin staplers", "Trocars & cannulas", "Surgical skin markers"],
  },
];

const QUALITY_STANDARDS = [
  { code: "ISO 9001:2015", desc: "Quality Management System — audited and certified production facility" },
  { code: "CE Marking",    desc: "Compliance with EU Medical Device Regulation for European market access" },
  { code: "FDA Listed",    desc: "Registered with the U.S. Food & Drug Administration for export to the USA" },
  { code: "ASTM & DIN",   desc: "Raw material selection conforms to ASTM and DIN international standards" },
  { code: "ISO Standards", desc: "Manufacturing processes follow ISO standard manuals for surgical instruments" },
];

const DIFFERENTIATORS = [
  {
    title: "Sialkot Heritage",
    body: "Sialkot produces over 75% of the world's surgical instruments. Our craftsmen carry decades of hereditary skill refined through generations of instrument making.",
  },
  {
    title: "Direct Manufacturing",
    body: "We own our production facility. No middlemen. This means tighter quality control, faster lead times, and competitive pricing for bulk orders.",
  },
  {
    title: "Custom OEM Production",
    body: "We produce instruments to your specification — custom branding, packaging, and instrument configurations for distributors and private-label buyers.",
  },
  {
    title: "Rigorous Quality Control",
    body: "Every instrument passes five-stage QC: hardness testing, corrosion resistance, elasticity, cutting ability, and final visual inspection before shipment.",
  },
  {
    title: "Material Traceability",
    body: "We use certified AISI 410 and 420 Martensitic stainless steel. All raw material grades are documented and traceable to international standards.",
  },
  {
    title: "Responsive Team",
    body: "Our export team responds within 24 hours. We handle documentation, certifications, and logistics for buyers across Europe, North America, and beyond.",
  },
];

const MARKETS = [
  "Europe", "United Kingdom", "United States", "Canada",
  "Australia", "Middle East", "South East Asia", "Africa",
];

// ─── Reusable components ──────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="text-eyebrow mb-2">{children}</p>
  );
}

function SectionHeading({ id, children }) {
  return (
    <h2 id={id} className="text-4xl sm:text-5xl font-extrabold text-text-heading leading-tight" style={{ letterSpacing: "-0.02em" }}>
      {children}
    </h2>
  );
}

function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-2.5 text-text-body text-sm leading-relaxed">
      <svg className="mt-0.5 shrink-0 text-brand-primary" width="16" height="16"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{children}</span>
    </li>
  );
}


// ─── Page ────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section aria-label="About hero" className="text-white" style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 flex flex-col lg:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <p className="inline-block text-xs font-bold uppercase tracking-widest text-white/70 mb-3">
              Est. 1986 · Sialkot, Pakistan
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
              Precision Built.<br />
              <span className="text-white/70">Globally Trusted.</span>
            </h1>
            <p className="mt-5 text-white/80 text-lg sm:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed">
              For nearly four decades, Surgical Essence has manufactured high-quality
              surgical instruments that healthcare professionals worldwide depend on.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3.5 rounded bg-white text-brand-primary font-bold text-base hover:bg-brand-secondary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white shadow-ambient-sm">
                Get a Quote
              </Link>
              <Link href="/catalog" className="inline-flex items-center justify-center px-6 py-3.5 rounded glass text-white font-bold text-base hover:bg-white/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                View Catalogs
              </Link>
            </div>
          </div>

          {/* Hero image / stats — Z-pattern anchor 2 (top-right): quick-scan stats before the placeholder image */}
          <div className="flex-1 w-full max-w-sm lg:max-w-none flex flex-col gap-4">
            {/* Z anchor 2 — top-right micro-stats strip */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center lg:justify-end">
              {[["1986", "Est."], ["50+", "Countries"], ["ISO", "Certified"]].map(([val, lbl]) => (
                <div key={lbl} className="flex flex-col items-center lg:items-end">
                  <span className="text-2xl font-extrabold text-white leading-none">{val}</span>
                  <span className="text-xs text-white/60 font-semibold uppercase tracking-wide">{lbl}</span>
                </div>
              ))}
            </div>
            <div className="relative w-full aspect-square max-w-sm mx-auto lg:max-w-none rounded-md overflow-hidden shadow-2xl">
              <Image
                src="/images/about/hero.jpg"
                alt="Surgical team in the operating theatre"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 384px, 50vw"
                priority
              />
              {/* Subtle blue tint overlay matching brand */}
              <div className="absolute inset-0 bg-brand-primary/20" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section aria-label="Key company statistics" className="bg-surface-low">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <ul role="list" className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
            {STATS.map(({ value, label, sub }) => (
              <li key={label} className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <span className="text-4xl sm:text-5xl font-extrabold text-brand-primary">{value}</span>
                <span className="mt-1 text-sm font-bold text-text-heading">{label}</span>
                <span className="mt-0.5 text-xs text-text-muted">{sub}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Our Story ────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="story-heading"
        className="bg-surface-lowest max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* F-pattern: left column is the dominant scan path — border-l reinforces vertical F-rail */}
          <div className="border-l-4 border-brand-primary pl-6">
            <SectionLabel>Our Story</SectionLabel>
            <SectionHeading id="story-heading">
              Built on Craft.<br />Grown on Trust.
            </SectionHeading>
            <div className="mt-6 flex flex-col gap-4 text-text-body leading-relaxed">
              <p>
                Surgical Essence was established in <strong className="text-gray-900">1986</strong> in
                Sialkot, Pakistan — the city that produces over 75% of the world's surgical
                instruments. From our earliest days, we committed to one standard: instruments
                that surgeons and clinicians can rely on without question.
              </p>
              <p>
                What began as a focused operation producing general surgical instruments has
                grown into a multi-line manufacturer supplying hospitals, distributors, and
                healthcare businesses across <strong className="text-gray-900">50+ countries</strong>.
                Our product range spans surgical, dental, ophthalmic, beauty care, and single-use
                instruments.
              </p>
              <p>
                Today, Surgical Essence holds <strong className="text-gray-900">ISO 9001:2015</strong>{" "}
                certification, CE Marking, and FDA listing — credentials that reflect our
                commitment to meeting the most demanding international quality requirements.
              </p>
            </div>
          </div>

          {/* Story image */}
          <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden shadow-xl">
            <Image
              src="/images/Quality Control Image.jpg"
              alt="Surgical instruments laid out for quality inspection"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ── Why Sialkot ──────────────────────────────────────────────────── */}
      <section
        aria-labelledby="sialkot-heading"
        className="bg-slate-900 text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">

          {/* Sialkot / instruments image */}
          <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden shadow-xl">
            <Image
              src="/images/about/hero.jpg"
              alt="Precision surgical instruments — manufactured in Sialkot"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-slate-900/30" aria-hidden="true" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
              The Surgical Capital of the World
            </p>
            <h2 id="sialkot-heading" className="text-4xl sm:text-5xl font-extrabold leading-tight text-white">
              Why Sialkot?
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-slate-300 leading-relaxed text-sm sm:text-base">
              <p>
                Sialkot, Punjab has been the global epicentre of surgical instrument
                manufacturing for over a century. The city's craftsmen carry hereditary
                expertise passed through generations — a level of hands-on skill that
                cannot be replicated by automation alone.
              </p>
              <p>
                Over <strong className="text-white">75% of the world's reusable surgical
                instruments</strong> originate from Sialkot. The concentration of skilled
                labour, specialised suppliers, and export infrastructure makes it uniquely
                positioned to serve global healthcare markets at scale.
              </p>
              <p>
                Surgical Essence is at the heart of this ecosystem — combining that
                craft heritage with modern quality systems, international certifications,
                and a dedicated export team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Manufacturing Capability ──────────────────────────────────────── */}
      <section
        aria-labelledby="capability-heading"
        className="bg-bg-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        {/* F-pattern: left-aligned header — users' first horizontal scan starts from the left */}
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="border-l-4 border-brand-primary pl-5">
            <SectionLabel>What We Manufacture</SectionLabel>
            <SectionHeading id="capability-heading">
              Five Complete Product Lines
            </SectionHeading>
          </div>
          <p className="text-text-muted text-base sm:text-lg max-w-sm leading-relaxed lg:text-right shrink-0">
            From general surgical instruments to single-use disposables — all manufactured
            in-house from certified stainless steel to finished, inspected instrument.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.title}
              className="bg-surface-lowest rounded-md p-5 shadow-ambient-sm hover:shadow-ambient transition-shadow"
            >
              <h3 className="font-bold text-text-heading text-base mb-3 pb-3">
                {cap.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {cap.items.map((item) => (
                  <CheckItem key={item}>{item}</CheckItem>
                ))}
              </ul>
            </div>
          ))}

          {/* Instrument mosaic — spans remaining column */}
          <div className="sm:col-span-2 lg:col-span-1 grid grid-cols-2 gap-2 h-full min-h-[200px]">
            {[
              { src: "/images/products/scalpel-1.jpg", alt: "Surgical scalpel" },
              { src: "/images/products/forceps-3.jpg", alt: "Tissue forceps" },
              { src: "/images/products/probe-1.jpg",   alt: "Surgical probe"  },
              { src: "/images/products/retractor-1.jpg", alt: "Retractor"     },
            ].map(({ src, alt }) => (
              <div key={src} className="relative rounded-xl overflow-hidden bg-surface-low aspect-square">
                <Image src={src} alt={alt} fill className="object-contain p-3" sizes="200px" />
              </div>
            ))}
          </div>
        </div>

        {/* Materials callout */}
        <div className="mt-8 bg-brand-secondary rounded-md px-6 py-6 sm:px-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
            <div className="shrink-0 w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-text-heading text-base">Raw Material Standards</h3>
              <p className="mt-1 text-sm text-text-body leading-relaxed">
                All instruments are manufactured from certified{" "}
                <strong className="text-gray-800">AISI 410 and AISI 420 Martensitic stainless steel</strong>{" "}
                for surgical instruments, and <strong className="text-gray-800">AISI 304 Austenitic steel</strong>{" "}
                for select dental components. Material grades are selected in accordance with
                ASTM, DIN, and ISO standards and are fully traceable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quality & Certifications ──────────────────────────────────────── */}
      <section
        aria-labelledby="quality-heading"
        className="bg-surface-low"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel>Quality & Compliance</SectionLabel>
              <SectionHeading id="quality-heading">
                Certified to International Standards
              </SectionHeading>
              <p className="mt-4 text-text-body leading-relaxed">
                Our certifications are not just paperwork — they represent an audited,
                documented production system that healthcare buyers and regulators can
                verify. Every instrument we ship meets the requirements of the markets
                it enters.
              </p>

              <ul className="mt-8 flex flex-col gap-4">
                {QUALITY_STANDARDS.map(({ code, desc }) => (
                  <li key={code} className="flex items-start gap-4">
                    <span className="shrink-0 mt-0.5 px-2.5 py-1 rounded text-xs font-bold font-mono whitespace-nowrap" style={{ background: "linear-gradient(135deg, #003b72, #00529B)", color: "#fff" }}>
                      {code}
                    </span>
                    <span className="text-sm text-text-body leading-relaxed">{desc}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/quality-control"
                className="mt-8 inline-flex items-center gap-2 text-brand-primary font-semibold text-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                View our full quality control process
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>

            {/* Certifications image placeholder */}
            <div className="flex flex-col gap-5">
              <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden shadow-xl">
                <Image
                  src="/images/Quality Control Image.jpg"
                  alt="Quality certified surgical instruments under inspection"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Certification badge strip */}
              <div className="flex flex-wrap gap-3">
                {["ISO 9001:2015", "CE Marked", "FDA Listed", "ASTM Compliant", "DIN Compliant"].map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1.5 rounded bg-brand-secondary text-xs font-semibold text-brand-primary"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────────────── */}
      <section
        aria-labelledby="why-heading"
        className="bg-surface-lowest max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        {/* F-pattern: left-aligned — the 3×2 card grid below is scanned top-row first, then left-column */}
        <div className="mb-12 border-l-4 border-brand-primary pl-5">
          <SectionLabel>Why Surgical Essence</SectionLabel>
          <SectionHeading id="why-heading">
            What Sets Us Apart
          </SectionHeading>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DIFFERENTIATORS.map(({ title, body }, i) => (
            <div key={title} className="flex flex-col gap-3 p-5 bg-surface-lowest rounded-md shadow-ambient-sm hover:shadow-ambient transition-shadow">
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-bold text-text-heading text-base">{title}</h3>
              </div>
              <p className="text-sm text-text-body leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Global Reach ──────────────────────────────────────────────────── */}
      <section
        aria-labelledby="global-heading"
        className="text-white"
        style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
              Export Markets
            </p>
            <h2 id="global-heading" className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Serving Buyers in 50+ Countries
            </h2>
            <p className="mt-4 text-white/80 leading-relaxed">
              Our instruments are used in operating theatres, dental clinics, eye care
              centres, and beauty salons across Europe, North America, the Middle East,
              and beyond. We handle full export documentation, compliance certificates,
              and customs packaging for every destination.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {MARKETS.map((market) => (
                <li key={market}>
                  <span className="px-3 py-1.5 rounded bg-white/15 text-white text-xs font-semibold">
                    {market}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instrument grid — global reach visual */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { src: "/images/products/forceps-1.jpg",  alt: "Precision forceps" },
              { src: "/images/products/scalpel-1.jpg",  alt: "Surgical scalpel"  },
              { src: "/images/products/forceps-4.jpg",  alt: "Hemostatic clamp"  },
              { src: "/images/products/probe-2.jpg",    alt: "Dental probe"      },
              { src: "/images/products/retractor-2.jpg",alt: "Eye speculum"      },
              { src: "/images/products/forceps-9.jpg",  alt: "Beauty forceps"    },
            ].map(({ src, alt }) => (
              <div key={src} className="relative rounded-xl overflow-hidden bg-white/15 aspect-square">
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-contain p-2.5 brightness-0 invert opacity-80"
                  sizes="150px"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="cta-heading"
        className="bg-surface-low max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="bg-surface-lowest rounded-lg px-6 sm:px-12 py-12 flex flex-col lg:flex-row items-center gap-8 justify-between text-center lg:text-left shadow-ambient">
          <div className="max-w-xl">
            <h2 id="cta-heading" className="text-3xl sm:text-4xl font-extrabold text-text-heading" style={{ letterSpacing: "-0.02em" }}>
              Ready to work with us?
            </h2>
            <p className="mt-3 text-text-body leading-relaxed">
              Whether you are a hospital procurement team, a distributor, or an OEM buyer —
              our team is ready to discuss your requirements, provide samples, and issue a
              competitive quote within 24 hours.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/contact" className="btn-primary">Get in Touch</Link>
            <Link href="/catalog" className="btn-outline">View Catalogs</Link>
          </div>
        </div>
      </section>
    </>
  );
}

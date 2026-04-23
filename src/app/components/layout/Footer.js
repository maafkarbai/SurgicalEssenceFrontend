import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "@/app/components/forms/NewsletterForm";

// ─── Data ────────────────────────────────────────────────────────────────────

const SOLUTION_LINKS = [
  { href: "/products?cat=surgical", label: "Surgical Instruments" },
  { href: "/products?cat=dental", label: "Dental Tools" },
  { href: "/products?cat=beauty", label: "Beauty & Esthetics" },
  { href: "/products?cat=ophthalmic", label: "Ophthalmic Instruments" },
  { href: "/products?cat=single-use", label: "Single Use Instruments" },
];

const QUICK_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/quality-control", label: "Quality Assurance" },
  { href: "/certifications", label: "Certifications" },
  { href: "/distributor", label: "Global Distributors" },
  { href: "/catalog", label: "Product Catalog" },
  { href: "/press-releases", label: "Press Releases" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/contact", label: "Contact Support" },
];

const SOCIALS = [
  {
    label: "WhatsApp",
    href: "https://wa.me/923036029756",
    path: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  },
];

// ─── Icons ───────────────────────────────────────────────────────────────────

const PhoneIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.07 3.4 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16z" />
  </svg>
);

const MailIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MapPinIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ─── Footer ──────────────────────────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full" aria-label="Site footer">
      {/* ── Main body ── */}
      <div className="bg-slate-50 w-full pt-16 pb-8 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 max-w-screen-2xl mx-auto">
          {/* Col 1 — Brand */}
          <div className="col-span-1">
            <Link
              href="/"
              aria-label="Go to homepage"
              className="inline-flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00529b] rounded"
            >
              <Image
                src="/LogoIcon.svg"
                alt=""
                width={70}
                height={70}
                priority
              />
            </Link>
            <p className="text-[#444444] text-sm leading-relaxed mb-6">
              Established in 1986 in Sialkot, Pakistan. Surgical Essence
              manufactures high-quality re-usable medical devices trusted by
              healthcare providers across Europe and worldwide.
            </p>

            {/* Newsletter signup */}
            <NewsletterForm />

            {/* Shipping options */}
            <div className="mt-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-2">
                Shipping Options
              </p>
              <div
                className="flex flex-wrap items-center gap-2"
                aria-label="Shipping options"
              >
                {[
                  { src: "/dhl.svg", alt: "DHL", w: 78, h: 18 },
                  { src: "/fedex.svg", alt: "Fedex", w: 56, h: 36 },
                  { src: "/UPS.svg", alt: "UPS", w: 28, h: 36 },
                ].map(({ src, alt, w, h }) => (
                  <div
                    key={alt}
                    className="flex items-center justify-center h-9"
                  >
                    <Image
                      src={src}
                      alt={alt}
                      width={w}
                      height={h}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2 — Our Solutions */}
          <div>
            <h4 className="font-bold text-[#00529b] mb-3">Our Solutions</h4>
            <ul className="space-y-4 text-sm" role="list">
              {SOLUTION_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[#444444] hover:text-[#00529b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00529b] rounded"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Quick Links */}
          <div>
            <h4 className="font-bold text-[#00529b] mb-3">Quick Links</h4>
            <ul className="space-y-4 text-sm" role="list">
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[#444444] hover:text-[#00529b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00529b] rounded"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h4 className="font-bold text-[#00529b] mb-3">Contact Us</h4>
            <div className="space-y-4 text-sm text-[#444444]">
              <p className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-[#00529b]">
                  <MapPinIcon />
                </span>
                <span>
                  Industrial Estate, Sialkot
                  <br />
                  Punjab, Pakistan 51310
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-[#00529b]">
                  <PhoneIcon />
                </span>
                <a
                  href="tel:+923036029756"
                  className="hover:text-[#00529b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00529b] rounded"
                >
                  +92 303 602 9756
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-[#00529b]">
                  <PhoneIcon />
                </span>
                <a
                  href="tel:+923415511315"
                  className="hover:text-[#00529b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00529b] rounded"
                >
                  +92 341 551 1315
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-[#00529b]">
                  <MailIcon />
                </span>
                <a
                  href="mailto:info@surgicalessence.com"
                  className="hover:text-[#00529b] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00529b] rounded break-all"
                >
                  info@surgicalessence.com
                </a>
              </p>
              <div className="pt-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">
                  Business Hours
                </p>
                <p>Mon – Sat: 9:00 AM – 6:00 PM PKT</p>
              </div>
            </div>

            {/* Payment methods */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-2">
                We Accept
              </p>
              <div
                className="flex flex-wrap items-center gap-2"
                aria-label="Accepted payment methods"
              >
                {[
                  {
                    src: "/bank-transfer.png",
                    alt: "Bank Transfer",
                    w: 48,
                    h: 24,
                  },
                  {
                    src: "/Visa_Brandmark_Blue_RGB_2021.svg",
                    alt: "Visa",
                    w: 48,
                    h: 24,
                  },
                  {
                    src: "/Mastercard_2019_logo.svg",
                    alt: "Mastercard",
                    w: 38,
                    h: 24,
                  },
                  {
                    src: "/American_Express_logo_(2018).svg",
                    alt: "American Express",
                    w: 56,
                    h: 36,
                  },
                  {
                    src: "/paypal-mark-color.svg",
                    alt: "PayPal",
                    w: 28,
                    h: 24,
                  },
                  { src: "/Skrill_logo.svg", alt: "Skrill", w: 48, h: 24 },
                ].map(({ src, alt, w, h }) => (
                  <div
                    key={alt}
                    className="shadow-md flex items-center justify-center h-9"
                  >
                    <Image
                      src={src}
                      alt={alt}
                      width={w}
                      height={h}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Certifications ── */}
        <div className="max-w-screen-2xl mx-auto px-8 mt-12">
          <div className="border-t border-slate-200 pt-8">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-4 text-center">
              Certifications
            </p>
            <div
              className="flex flex-wrap justify-center items-center gap-6"
              aria-label="Quality certifications"
            >
              <div className="flex items-center justify-center h-14">
                <Image
                  src="/ISO_Logo_(Red_square).svg"
                  alt="ISO Certified"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-center h-14">
                <Image
                  src="/ce-mark.svg"
                  alt="CE Mark Certified"
                  width={112}
                  height={79}
                  className="object-contain h-14 w-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="max-w-screen-2xl mx-auto px-8 mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {year} Surgical Essence. All rights reserved. Sialkot, Pakistan.
          </p>

          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-slate-600 hover:text-[#00529b] transition-colors focus-visible:outline-1 focus-visible:outline-[#00529b] rounded"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-slate-600 hover:text-[#00529b] transition-colors focus-visible:outline-1 focus-visible:outline-[#00529b] rounded"
            >
              Terms of Use
            </Link>
            <Link
              href="/site-map"
              className="text-slate-600 hover:text-[#00529b] transition-colors focus-visible:outline-1 focus-visible:outline-[#00529b] rounded"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

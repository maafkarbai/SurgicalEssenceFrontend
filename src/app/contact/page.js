import Image from "next/image";
import Link from "next/link";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Request a Quote | Surgical Essence",
  description:
    "Get in touch with Surgical Essence for pricing, samples, and lead times on surgical, dental, ophthalmic, and beauty care instruments. We respond within 24 hours.",
};

// ─── Icons (Server Component — no interactivity needed) ───────────────────────

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.07 3.4 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <>
      {/* ── Page header (static — rendered on server) ── */}
      <div className="relative bg-brand-primary text-white py-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/images/Quality Control Image.jpg"
            alt=""
            fill
            className="object-cover opacity-15"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-brand-primary/75" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
            Get in Touch
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Request a Quote
          </h1>
          <p className="mt-3 text-white/80 text-lg max-w-xl leading-relaxed">
            Fill in your details and we'll respond within <strong className="text-white">24 hours</strong> with
            pricing, samples availability, and lead times.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">

          {/* ── Form (only client boundary on this page) ── */}
          <ContactForm />

          {/* ── Sidebar (static — rendered on server) ── */}
          <aside aria-label="Contact information" className="flex flex-col gap-6">

            <div className="bg-white rounded-md border border-gray-200 p-6 flex flex-col gap-5 shadow-sm">
              <h2 className="text-base font-bold text-gray-900">Contact Details</h2>

              <ul className="flex flex-col gap-4" role="list">
                <li className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-brand-primary"><PhoneIcon /></span>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                    <a href="tel:+923036029756" className="block text-sm text-gray-800 hover:text-brand-primary hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded">
                      +92 303 602 9756
                    </a>
                    <a href="tel:+923415511315" className="block text-sm text-gray-800 hover:text-brand-primary hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded">
                      +92 341 551 1315
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-brand-primary"><WhatsAppIcon /></span>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">WhatsApp</p>
                    <a
                      href="https://wa.me/923036029756"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-800 hover:text-brand-primary hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded"
                    >
                      Chat on WhatsApp →
                      <span className="sr-only">(opens in new tab)</span>
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-brand-primary"><MailIcon /></span>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <a href="mailto:info@surgicalessence.com" className="block text-sm text-gray-800 hover:text-brand-primary hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded break-all">
                      info@surgicalessence.com
                    </a>
                    <a href="mailto:infosurgicalessence@gmail.com" className="block text-sm text-gray-800 hover:text-brand-primary hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded break-all">
                      infosurgicalessence@gmail.com
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 text-brand-primary"><MapPinIcon /></span>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Address</p>
                    <address className="not-italic text-sm text-gray-800 leading-relaxed">
                      Sialkot, Punjab<br />Pakistan
                    </address>
                  </div>
                </li>
              </ul>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Business Hours</p>
                <p className="text-sm text-gray-800">Mon – Sat: 9:00 AM – 6:00 PM PKT</p>
              </div>
            </div>

            <div className="bg-brand-primary rounded-md p-6 text-white flex flex-col gap-4">
              <h2 className="text-base font-bold">What happens next?</h2>
              <ol className="flex flex-col gap-3" role="list">
                {[
                  "We review your enquiry and match it to the right product line.",
                  "Our export team sends you pricing, MOQ, and lead time within 24 hours.",
                  "We arrange samples if required before bulk ordering.",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold mt-0.5" aria-hidden="true">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-5 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Not ready to enquire yet? Browse our product catalogs first.
              </p>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-brand-primary text-brand-primary font-semibold text-sm hover:bg-brand-primary hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                View Catalogs
              </Link>
            </div>

          </aside>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PhoneField from "@/app/components/PhoneField";

// ─── Icons ────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const PackageIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const TagIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

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
  {
    name: "General Surgery",
    items: "Scissors, forceps, clamps, retractors, needle holders",
    color: "bg-slate-50 border-gray-200",
    dotColor: "bg-slate-500",
  },
  {
    name: "Dental Instruments",
    items: "Scalers, extractors, curettes, mirrors, explorers",
    color: "bg-slate-50 border-gray-200",
    dotColor: "bg-brand-primary",
  },
  {
    name: "Ophthalmic Instruments",
    items: "Iris scissors, specula, forceps, cannulas",
    color: "bg-slate-50 border-teal-200",
    dotColor: "bg-slate-500",
  },
  {
    name: "Beauty Care",
    items: "Scissors, nippers, tweezers, nail tools",
    color: "bg-slate-50 border-gray-200",
    dotColor: "bg-brand-primary",
  },
  {
    name: "Single Use / Disposable",
    items: "Scalpels, lancets, staplers, sterile instruments",
    color: "bg-amber-50 border-amber-200",
    dotColor: "bg-amber-500",
  },
  {
    name: "Veterinary Instruments",
    items: "Surgical scissors, forceps, clamps for veterinary use",
    color: "bg-green-50 border-green-200",
    dotColor: "bg-green-500",
  },
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
  { name: "Europe", status: "active" },
  { name: "Middle East", status: "active" },
  { name: "North America", status: "expanding" },
  { name: "South Asia", status: "active" },
  { name: "Southeast Asia", status: "expanding" },
  { name: "Africa", status: "expanding" },
  { name: "Latin America", status: "expanding" },
  { name: "Australia / Oceania", status: "expanding" },
];

const PRODUCTS_OF_INTEREST = [
  "General Surgical Instruments",
  "Dental Instruments",
  "Ophthalmic Instruments",
  "Beauty Care Instruments",
  "Single Use / Disposable",
  "Veterinary Instruments",
  "Full Product Range",
];

// ─── Application Form ─────────────────────────────────────────────────────────

function DistributorForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    country: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    yearsExperience: "",
    productsOfInterest: [],
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhone = (value) => {
    setFormData((prev) => ({ ...prev, phone: value ?? "" }));
  };

  const handleProductToggle = (product) => {
    setFormData((prev) => {
      const current = prev.productsOfInterest;
      return {
        ...prev,
        productsOfInterest: current.includes(product)
          ? current.filter((p) => p !== product)
          : [...current, product],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.companyName || !formData.country || !formData.contactPerson || !formData.email) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (formData.productsOfInterest.length === 0) {
      setError("Please select at least one product category of interest.");
      return;
    }

    setSubmitting(true);
    // TODO: wire up to /api/distributor once backend is ready
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-12 px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Thank you for your interest in becoming a Surgical Essence distributor. Our partnership
          team will review your application and contact you within 3–5 business days.
        </p>
      </div>
    );
  }

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition";

  const labelClass = "block text-sm font-semibold text-gray-700";

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Distributor application form">
      {error && (
        <div role="alert" className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Company Name */}
        <div className="sm:col-span-2">
          <label htmlFor="companyName" className={labelClass}>
            Company Name <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            required
            aria-required="true"
            autoComplete="organization"
            className={inputClass}
            placeholder="Your company or trading name"
            value={formData.companyName}
            onChange={handleChange}
          />
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className={labelClass}>
            Country / Region <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="country"
            name="country"
            type="text"
            required
            aria-required="true"
            autoComplete="country-name"
            className={inputClass}
            placeholder="e.g. Germany, UAE, USA"
            value={formData.country}
            onChange={handleChange}
          />
        </div>

        {/* Contact Person */}
        <div>
          <label htmlFor="contactPerson" className={labelClass}>
            Contact Person <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="contactPerson"
            name="contactPerson"
            type="text"
            required
            aria-required="true"
            autoComplete="name"
            className={inputClass}
            placeholder="Full name"
            value={formData.contactPerson}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClass}>
            Email Address <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            aria-required="true"
            autoComplete="email"
            className={inputClass}
            placeholder="you@company.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone / WhatsApp
          </label>
          <PhoneField
            id="phone"
            value={formData.phone}
            onChange={handlePhone}
            hasError={false}
          />
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className={labelClass}>
            Company Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            autoComplete="url"
            className={inputClass}
            placeholder="https://yourcompany.com"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        {/* Years Experience */}
        <div>
          <label htmlFor="yearsExperience" className={labelClass}>
            Years in Medical Distribution
          </label>
          <select
            id="yearsExperience"
            name="yearsExperience"
            className={inputClass + " bg-white"}
            value={formData.yearsExperience}
            onChange={handleChange}
          >
            <option value="">Select experience</option>
            <option value="0-2">Less than 2 years</option>
            <option value="2-5">2–5 years</option>
            <option value="5-10">5–10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>

        {/* Products of Interest */}
        <div className="sm:col-span-2">
          <fieldset aria-required="true">
            <legend className={labelClass + " mb-2"}>
              Products of Interest <span className="text-red-500" aria-hidden="true">*</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {PRODUCTS_OF_INTEREST.map((product) => {
                const selected = formData.productsOfInterest.includes(product);
                return (
                  <button
                    key={product}
                    type="button"
                    onClick={() => handleProductToggle(product)}
                    aria-pressed={selected}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
                      selected
                        ? "bg-brand-primary border-brand-primary text-white"
                        : "bg-white border-gray-300 text-gray-700 hover:border-brand-primary hover:text-brand-primary"
                    }`}
                  >
                    {product}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Message */}
        <div className="sm:col-span-2">
          <label htmlFor="message" className={labelClass}>
            Message / Additional Information
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className={inputClass + " resize-none"}
            placeholder="Tell us about your distribution network, target markets, and any specific requirements..."
            value={formData.message}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={submitting}
          aria-disabled={submitting}
          aria-busy={submitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-brand-primary hover:bg-brand-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          {submitting ? (
            <>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Submitting…
            </>
          ) : (
            "Submit Partnership Application"
          )}
        </button>
        <p className="mt-3 text-xs text-gray-500">
          <span className="text-red-500" aria-hidden="true">*</span> Required fields.
          We respond to all applications within 3–5 business days.
        </p>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DistributorPage() {
  return (
    <>
      {/* ── Hero / Introduction ────────────────────────────────────────────── */}
      <section
        aria-label="Distributor partnership invitation"
        className="bg-brand-primary text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col lg:flex-row items-center gap-8">
          {/* Text */}
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
              deliver high-quality surgical instruments to hospitals and healthcare providers
              worldwide.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="#apply"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-white text-brand-primary font-bold text-base hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Apply Now
              </a>
              <a
                href="#benefits"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg border-2 border-white/60 text-white font-bold text-base hover:bg-white/10 hover:border-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Hero image */}
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

        {/* Bouncing arrow pointing to form */}
        <div className="relative pb-8 flex justify-center">
          <a
            href="#apply"
            className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors animate-bounce focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded"
            aria-label="Scroll to application form"
          >
            <span className="text-xs font-semibold uppercase tracking-widest" aria-hidden="true">Apply Below</span>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── Application Form ───────────────────────────────────────────────── */}
      <section
        id="apply"
        aria-labelledby="apply-heading"
        className="py-16 sm:py-20 bg-white border-y border-gray-200"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="apply-heading" className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              Apply to Become a Distributor
            </h2>
            <p className="mt-3 text-gray-500 text-base sm:text-lg">
              Fill in the form below and our partnership team will get back to you within
              3–5 business days.
            </p>
          </div>

          <div className="bg-gray-50 rounded-md border border-gray-200 p-6 sm:p-8">
            <DistributorForm />
          </div>
        </div>
      </section>

      {/* ── Why Partner With Us ────────────────────────────────────────────── */}
      <section
        id="benefits"
        aria-labelledby="why-heading"
        className="py-16 sm:py-20 bg-gray-50 border-y border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="why-heading" className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              Why Partner With Surgical Essence?
            </h2>
            <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Join a trusted manufacturer with decades of export experience and a commitment
              to quality that your customers can rely on.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {WHY_US.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col gap-4 p-6 rounded-xl border border-gray-200 hover:border-brand-primary hover:shadow-md transition-all"
              >
                <span className="text-brand-primary">{icon}</span>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certifications highlight ───────────────────────────────────────── */}
      <section
        aria-label="Certifications and compliance"
        className="py-10 bg-slate-50 border-y border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 flex-wrap">
            {[
              { badge: "ISO 13485", label: "Medical Device Quality Management" },
              { badge: "CE", label: "European Conformity Certified" },
              { badge: "Sialkot", label: "Made in the Surgical Instruments Capital" },
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

      {/* ── Product Categories ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="categories-heading"
        className="py-16 sm:py-20 bg-gray-50 border-y border-gray-200"
      >
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
              <div
                key={name}
                className={`rounded-xl border p-5 ${color} flex items-start gap-4`}
              >
                <span className={`mt-1 w-3 h-3 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-gray-900">{name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{items}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-primary hover:bg-brand-dark text-white font-bold text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              Download Full Catalogs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Global Distribution Regions ────────────────────────────────────── */}
      <section
        aria-labelledby="regions-heading"
        className="py-16 sm:py-20 bg-white border-y border-gray-200"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="regions-heading" className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              Our Global Reach
            </h2>
            <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Currently supplying distributors across multiple continents, with active expansion
              into new markets.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {REGIONS.map(({ name, status }) => (
              <div
                key={name}
                className={`rounded-xl border p-4 text-center ${
                  status === "active"
                    ? "border-brand-primary bg-slate-100"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <p className="font-semibold text-sm text-gray-900">{name}</p>
                <span
                  className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                    status === "active"
                      ? "bg-brand-primary text-white"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {status === "active" ? "Active" : "Expanding"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Distributor Requirements ───────────────────────────────────────── */}
      <section
        aria-labelledby="requirements-heading"
        className="py-16 sm:py-20 bg-gray-50 border-y border-gray-200"
      >
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
              <li
                key={req}
                className="flex items-start gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4"
              >
                <span className="shrink-0 mt-0.5 text-green-600">
                  <CheckIcon />
                </span>
                <span className="text-gray-700 text-sm sm:text-base">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
      <section
        aria-label="Contact for more information"
        className="bg-brand-primary text-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Have questions before applying?
          </h2>
          <p className="mt-3 text-white/80 text-base sm:text-lg max-w-lg mx-auto">
            Our team is ready to discuss partnership terms, pricing, and product availability.
            Reach out directly and we will respond within 24 hours.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex px-8 py-3.5 rounded-lg bg-white text-brand-primary font-bold text-base hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Contact Our Team
          </Link>
        </div>
      </section>
    </>
  );
}

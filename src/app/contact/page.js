"use client";

import { useState, useId, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import PhoneField from "@/app/components/PhoneField";
import HCaptcha from "@hcaptcha/react-hcaptcha";

// ─── Data ────────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  "Distributor",
  "Hospital",
  "Clinic",
  "Supplier",
  "Retailer",
  "Government / Tender",
  "Other",
];

const PRODUCT_CATEGORIES = [
  "Surgical Instruments",
  "Dental Instruments",
  "Beauty Care Instruments",
  "Ophthalmic Instruments",
  "Single Use Instruments",
  "Multiple / All Categories",
];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Azerbaijan",
  "Bahrain","Bangladesh","Belgium","Brazil","Canada","Chile","China","Colombia",
  "Croatia","Czech Republic","Denmark","Egypt","Ethiopia","Finland","France",
  "Germany","Ghana","Greece","Hungary","India","Indonesia","Iran","Iraq","Ireland",
  "Italy","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Lebanon","Libya",
  "Malaysia","Mexico","Morocco","Netherlands","New Zealand","Nigeria","Norway",
  "Oman","Pakistan","Philippines","Poland","Portugal","Qatar","Romania",
  "Saudi Arabia","Singapore","South Africa","South Korea","Spain","Sri Lanka",
  "Sudan","Sweden","Switzerland","Syria","Tanzania","Thailand","Tunisia","Turkey",
  "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States",
  "Uzbekistan","Vietnam","Yemen","Zimbabwe","Other",
];

// ─── Icons ───────────────────────────────────────────────────────────────────

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.07 3.4 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// ─── Field components ─────────────────────────────────────────────────────────

function Label({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
    </label>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {message}
    </p>
  );
}

const inputClass = (hasError) =>
  `w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 bg-white transition
   focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
   ${hasError ? "border-red-400 bg-red-50/30" : "border-gray-300 hover:border-gray-400"}`;

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(fields) {
  const errors = {};

  if (!fields.name.trim())
    errors.name = "Full name is required.";

  if (!fields.company.trim())
    errors.company = "Company name is required.";

  if (!fields.email.trim()) {
    errors.email = "Business email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = "Please enter a valid email address.";
  } else if (/gmail\.com|yahoo\.com|hotmail\.com|outlook\.com/i.test(fields.email)) {
    errors.email = "Please use a business email address.";
  }

  if (!fields.country)
    errors.country = "Please select your country.";

  if (!fields.businessType)
    errors.businessType = "Please select your business type.";

  if (!fields.category)
    errors.category = "Please select a product category.";

  if (!fields.message.trim())
    errors.message = "Please tell us about your requirements.";
  else if (fields.message.trim().length < 20)
    errors.message = "Please provide a bit more detail (at least 20 characters).";

  return errors;
}

// ─── Page ────────────────────────────────────────────────────────────────────

const EMPTY = {
  name: "", company: "", email: "", country: "",
  phone: "", businessType: "", category: "", message: "",
};

export default function ContactPage() {
  const [fields,      setFields]      = useState(EMPTY);
  const [errors,      setErrors]      = useState({});
  const [status,      setStatus]      = useState("idle"); // idle | loading | success | error
  const [serverMsg,   setServerMsg]   = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState("");
  const captchaRef = useRef(null);

  const formId = useId();

  const set = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  // Phone value comes as a plain string from PhoneField (not an event)
  const setPhone = (value) => {
    setFields((f) => ({ ...f, phone: value ?? "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(`${formId}-${firstKey}`)?.focus();
      return;
    }

    if (!captchaToken) {
      setCaptchaError("Please complete the CAPTCHA before submitting.");
      return;
    }

    setStatus("loading");
    setServerMsg("");
    setCaptchaError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, captchaToken }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setFields(EMPTY);
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      } else {
        setStatus("error");
        setServerMsg(data.error || "Something went wrong. Please try again.");
        // Reset captcha so user can re-verify on next attempt
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      }
    } catch {
      setStatus("error");
      setServerMsg("Network error. Please check your connection and try again.");
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    }
  };

  return (
    <>
      {/* ── Page header ── */}
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

          {/* ── Form ── */}
          <div>
            {status === "success" ? (
              /* Success state */
              <div className="flex flex-col items-center text-center py-16 px-6 bg-green-50 border border-green-200 rounded-md">
                <span className="text-green-600 mb-4"><CheckCircleIcon /></span>
                <h2 className="text-2xl font-bold text-gray-900">Enquiry Received</h2>
                <p className="mt-3 text-gray-600 max-w-sm leading-relaxed">
                  Thank you. Our team will review your enquiry and get back to you
                  within <strong>24 hours</strong> on your business email.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-6 px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-dark text-white font-semibold text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                aria-label="Quote request form"
              >
                {/* Server error */}
                {status === "error" && serverMsg && (
                  <div role="alert" className="mb-6 flex items-start gap-3 px-4 py-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2.5" strokeLinecap="round" className="shrink-0 mt-0.5" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {serverMsg}
                  </div>
                )}

                {/* ── Row 1: Name + Company ── */}
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <Label htmlFor={`${formId}-name`} required>Full Name</Label>
                    <input
                      id={`${formId}-name`}
                      type="text"
                      autoComplete="name"
                      placeholder="Dr. John Smith"
                      value={fields.name}
                      onChange={set("name")}
                      aria-required="true"
                      aria-describedby={errors.name ? `${formId}-name-err` : undefined}
                      aria-invalid={!!errors.name}
                      className={inputClass(!!errors.name)}
                    />
                    <FieldError id={`${formId}-name-err`} message={errors.name} />
                  </div>

                  <div>
                    <Label htmlFor={`${formId}-company`} required>Company Name</Label>
                    <input
                      id={`${formId}-company`}
                      type="text"
                      autoComplete="organization"
                      placeholder="City General Hospital"
                      value={fields.company}
                      onChange={set("company")}
                      aria-required="true"
                      aria-describedby={errors.company ? `${formId}-company-err` : undefined}
                      aria-invalid={!!errors.company}
                      className={inputClass(!!errors.company)}
                    />
                    <FieldError id={`${formId}-company-err`} message={errors.company} />
                  </div>
                </div>

                {/* ── Row 2: Email + Phone ── */}
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <Label htmlFor={`${formId}-email`} required>Business Email</Label>
                    <input
                      id={`${formId}-email`}
                      type="email"
                      autoComplete="email"
                      placeholder="john@hospital.com"
                      value={fields.email}
                      onChange={set("email")}
                      aria-required="true"
                      aria-describedby={errors.email ? `${formId}-email-err` : `${formId}-email-hint`}
                      aria-invalid={!!errors.email}
                      className={inputClass(!!errors.email)}
                    />
                    <p id={`${formId}-email-hint`} className="mt-1 text-xs text-gray-400">
                      Please use your company email, not Gmail/Yahoo.
                    </p>
                    <FieldError id={`${formId}-email-err`} message={errors.email} />
                  </div>

                  <div>
                    <Label htmlFor={`${formId}-phone`}>Phone / WhatsApp</Label>
                    <PhoneField
                      id={`${formId}-phone`}
                      value={fields.phone}
                      onChange={setPhone}
                      hasError={false}
                      ariaDescribedBy={`${formId}-phone-hint`}
                    />
                    <p id={`${formId}-phone-hint`} className="mt-1 text-xs text-gray-400">
                      Select your country code, then enter your number.
                    </p>
                  </div>
                </div>

                {/* ── Row 3: Country + Business Type ── */}
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <Label htmlFor={`${formId}-country`} required>Country</Label>
                    <select
                      id={`${formId}-country`}
                      value={fields.country}
                      onChange={set("country")}
                      aria-required="true"
                      aria-describedby={errors.country ? `${formId}-country-err` : undefined}
                      aria-invalid={!!errors.country}
                      className={inputClass(!!errors.country)}
                    >
                      <option value="">Select country…</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <FieldError id={`${formId}-country-err`} message={errors.country} />
                  </div>

                  <div>
                    <Label htmlFor={`${formId}-businessType`} required>Business Type</Label>
                    <select
                      id={`${formId}-businessType`}
                      value={fields.businessType}
                      onChange={set("businessType")}
                      aria-required="true"
                      aria-describedby={errors.businessType ? `${formId}-businessType-err` : undefined}
                      aria-invalid={!!errors.businessType}
                      className={inputClass(!!errors.businessType)}
                    >
                      <option value="">Select type…</option>
                      {BUSINESS_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <FieldError id={`${formId}-businessType-err`} message={errors.businessType} />
                  </div>
                </div>

                {/* ── Row 4: Interested Product Category ── */}
                <div className="mb-5">
                  <fieldset aria-describedby={errors.category ? `${formId}-category-err` : undefined}>
                  <legend className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Interested Product Category
                    <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                  </legend>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => {
                      const checked = fields.category === cat;
                      return (
                        <label
                          key={cat}
                          className={`flex items-center gap-3 px-3.5 py-3 rounded-lg border cursor-pointer transition-colors
                            ${checked
                              ? "border-brand-primary bg-slate-50 text-brand-primary"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                            }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={cat}
                            checked={checked}
                            onChange={set("category")}
                            aria-required="true"
                            className="accent-brand-primary w-4 h-4 shrink-0"
                          />
                          <span className="text-sm font-medium">{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                  </fieldset>
                  <FieldError id={`${formId}-category-err`} message={errors.category} />
                </div>

                {/* ── Row 5: Message ── */}
                <div className="mb-6">
                  <Label htmlFor={`${formId}-message`} required>Your Requirements</Label>
                  <textarea
                    id={`${formId}-message`}
                    rows={5}
                    placeholder="Please describe what you're looking for — instrument types, quantities, quality certifications required, delivery timeline, etc."
                    value={fields.message}
                    onChange={set("message")}
                    aria-required="true"
                    aria-describedby={errors.message ? `${formId}-message-err` : undefined}
                    aria-invalid={!!errors.message}
                    className={`${inputClass(!!errors.message)} resize-none`}
                  />
                  <FieldError id={`${formId}-message-err`} message={errors.message} />
                </div>

                {/* Required fields note */}
                <p className="text-xs text-gray-400 mb-5">
                  Fields marked <span className="text-red-500" aria-hidden="true">*</span>{" "}
                  <span className="sr-only">(required)</span> are required.
                </p>

                {/* hCaptcha */}
                <div className="mb-5">
                  <HCaptcha
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                    ref={captchaRef}
                    onVerify={(token) => { setCaptchaToken(token); setCaptchaError(""); }}
                    onExpire={() => setCaptchaToken(null)}
                    onError={() => { setCaptchaToken(null); setCaptchaError("CAPTCHA error. Please try again."); }}
                  />
                  {captchaError && (
                    <p role="alert" className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {captchaError}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  aria-disabled={status === "loading"}
                  aria-busy={status === "loading"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-brand-primary hover:bg-brand-dark text-white font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  {status === "loading" ? (
                    <>
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" aria-hidden="true">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Sending Enquiry…
                    </>
                  ) : (
                    "Send Enquiry"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside aria-label="Contact information" className="flex flex-col gap-6">

            {/* Contact details card */}
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

            {/* Trust / what to expect */}
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

            {/* Catalog shortcut */}
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

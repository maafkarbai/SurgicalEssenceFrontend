"use client";

import { useState } from "react";
import PhoneField from "@/app/components/PhoneField";

const INITIAL = { name: "", email: "", phone: "", company: "", message: "" };

export default function HeroQuoteForm() {
  const [fields, setFields]   = useState(INITIAL);
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState("idle"); // idle | loading | success | error

  const validate = () => {
    const e = {};
    if (!fields.name.trim())                          e.name    = "Name is required.";
    if (!fields.email.trim())                         e.email   = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
                                                      e.email   = "Enter a valid email.";
    if (!fields.message.trim())                       e.message = "Please describe your enquiry.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, phone: fields.phone || undefined }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setFields(INITIAL);
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="w-full max-w-sm lg:max-w-md rounded-md bg-white p-8 flex flex-col items-center justify-center gap-4 text-center shadow-2xl shadow-black/20 min-h-[360px]">
        <span className="inline-flex w-16 h-16 rounded-full bg-green-50 border border-green-200 items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <h3 className="text-xl font-bold text-gray-900">Enquiry Received</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Thank you — our export team will get back to you within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 text-sm font-semibold text-brand-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Request a quote"
      className="w-full max-w-sm lg:max-w-md rounded-md bg-white p-6 sm:p-8 shadow-2xl shadow-black/20 flex flex-col gap-4"
    >
      <div>
        <h2 className="text-lg font-bold text-gray-900">Request a Quote</h2>
        <p className="text-sm text-gray-500 mt-0.5">We respond within 24 hours.</p>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label htmlFor="hqf-name" className="text-sm font-semibold text-gray-700">
          Full Name <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="hqf-name"
          name="name"
          type="text"
          autoComplete="name"
          value={fields.name}
          onChange={handleChange}
          aria-required="true"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "hqf-name-err" : undefined}
          placeholder="Dr. John Smith"
          className={`w-full h-10 px-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors
            focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
            ${errors.name ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
        />
        {errors.name && (
          <p id="hqf-name-err" role="alert" className="text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label htmlFor="hqf-email" className="text-sm font-semibold text-gray-700">
          Email <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="hqf-email"
          name="email"
          type="email"
          autoComplete="email"
          value={fields.email}
          onChange={handleChange}
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "hqf-email-err" : undefined}
          placeholder="you@hospital.com"
          className={`w-full h-10 px-3 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors
            focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
            ${errors.email ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
        />
        {errors.email && (
          <p id="hqf-email-err" role="alert" className="text-xs text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1">
        <label htmlFor="hqf-phone" className="text-sm font-semibold text-gray-700">
          Phone
        </label>
        <PhoneField
          id="hqf-phone"
          value={fields.phone}
          onChange={(val) => setFields((f) => ({ ...f, phone: val ?? "" }))}
        />
      </div>

      {/* Company */}
      <div className="flex flex-col gap-1">
        <label htmlFor="hqf-company" className="text-sm font-semibold text-gray-700">
          Company / Hospital
        </label>
        <input
          id="hqf-company"
          name="company"
          type="text"
          autoComplete="organization"
          value={fields.company}
          onChange={handleChange}
          placeholder="City General Hospital"
          className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1">
        <label htmlFor="hqf-message" className="text-sm font-semibold text-gray-700">
          Enquiry <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <textarea
          id="hqf-message"
          name="message"
          rows={3}
          value={fields.message}
          onChange={handleChange}
          aria-required="true"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "hqf-message-err" : undefined}
          placeholder="Which instruments are you looking for? Approximate quantities?"
          className={`w-full px-3 py-2 rounded-lg border text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors resize-none
            focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20
            ${errors.message ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
        />
        {errors.message && (
          <p id="hqf-message-err" role="alert" className="text-xs text-red-600">{errors.message}</p>
        )}
      </div>

      {status === "error" && (
        <p role="alert" className="text-xs text-red-600 -mt-1">
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full h-11 rounded-lg bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Sending…" : "Send Enquiry"}
      </button>
    </form>
  );
}

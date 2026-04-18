"use client";

import { useState } from "react";
import PhoneField from "@/app/components/PhoneField";

const PRODUCTS_OF_INTEREST = [
  "General Surgical Instruments",
  "Dental Instruments",
  "Ophthalmic Instruments",
  "Beauty Care Instruments",
  "Single Use / Disposable",
  "Veterinary Instruments",
  "Full Product Range",
];

const inputClass =
  "mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition";

const labelClass = "block text-sm font-semibold text-gray-700";

export default function DistributorForm() {
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
  const [submitted,  setSubmitted]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhone = (value) => setFormData((prev) => ({ ...prev, phone: value ?? "" }));

  const handleProductToggle = (product) => {
    setFormData((prev) => ({
      ...prev,
      productsOfInterest: prev.productsOfInterest.includes(product)
        ? prev.productsOfInterest.filter((p) => p !== product)
        : [...prev.productsOfInterest, product],
    }));
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

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Distributor application form">
      {error && (
        <div role="alert" className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label htmlFor="companyName" className={labelClass}>
            Company Name <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input id="companyName" name="companyName" type="text" required aria-required="true"
            autoComplete="organization" className={inputClass}
            placeholder="Your company or trading name"
            value={formData.companyName} onChange={handleChange} />
        </div>

        <div>
          <label htmlFor="country" className={labelClass}>
            Country / Region <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input id="country" name="country" type="text" required aria-required="true"
            autoComplete="country-name" className={inputClass}
            placeholder="e.g. Germany, UAE, USA"
            value={formData.country} onChange={handleChange} />
        </div>

        <div>
          <label htmlFor="contactPerson" className={labelClass}>
            Contact Person <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input id="contactPerson" name="contactPerson" type="text" required aria-required="true"
            autoComplete="name" className={inputClass} placeholder="Full name"
            value={formData.contactPerson} onChange={handleChange} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email Address <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input id="email" name="email" type="email" required aria-required="true"
            autoComplete="email" className={inputClass} placeholder="you@company.com"
            value={formData.email} onChange={handleChange} />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>Phone / WhatsApp</label>
          <PhoneField id="phone" value={formData.phone} onChange={handlePhone} hasError={false} />
        </div>

        <div>
          <label htmlFor="website" className={labelClass}>Company Website</label>
          <input id="website" name="website" type="url" autoComplete="url"
            className={inputClass} placeholder="https://yourcompany.com"
            value={formData.website} onChange={handleChange} />
        </div>

        <div>
          <label htmlFor="yearsExperience" className={labelClass}>Years in Medical Distribution</label>
          <select id="yearsExperience" name="yearsExperience"
            className={inputClass + " bg-white"}
            value={formData.yearsExperience} onChange={handleChange}>
            <option value="">Select experience</option>
            <option value="0-2">Less than 2 years</option>
            <option value="2-5">2–5 years</option>
            <option value="5-10">5–10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>

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

        <div className="sm:col-span-2">
          <label htmlFor="message" className={labelClass}>Message / Additional Information</label>
          <textarea id="message" name="message" rows={4}
            className={inputClass + " resize-none"}
            placeholder="Tell us about your distribution network, target markets, and any specific requirements..."
            value={formData.message} onChange={handleChange} />
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

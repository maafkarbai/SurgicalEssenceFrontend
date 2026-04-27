"use client";

import { useState, useRef, useEffect } from "react";

export default function HomeContactForm() {
  const [form, setForm]     = useState({ name: "", organization: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const successHeadingRef = useRef(null);

  useEffect(() => {
    if (status === "success" && successHeadingRef.current) {
      successHeadingRef.current.focus();
    }
  }, [status]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "homepage_quote_form" }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex flex-col items-center justify-center gap-4 py-16 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-[#006a63]/10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="#006a63" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3
          ref={successHeadingRef}
          tabIndex={-1}
          className="font-bold text-xl text-[#003b72] outline-none"
        >
          Request Received!
        </h3>
        <p className="text-slate-500 text-sm max-w-xs">
          Our team will get back to you within 24 hours with pricing and details.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="home-form-name" className="text-sm font-bold text-[#003b72] uppercase tracking-wide">Full Name</label>
          <input
            id="home-form-name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full border-b-2 border-slate-200 focus:border-[#006a63] outline-none transition-colors py-3 text-slate-800 bg-transparent placeholder:text-slate-500 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="home-form-organization" className="text-sm font-bold text-[#003b72] uppercase tracking-wide">Organization</label>
          <input
            id="home-form-organization"
            name="organization"
            type="text"
            value={form.organization}
            onChange={handleChange}
            placeholder="City Hospital"
            className="w-full border-b-2 border-slate-200 focus:border-[#006a63] outline-none transition-colors py-3 text-slate-800 bg-transparent placeholder:text-slate-500 text-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="home-form-email" className="text-sm font-bold text-[#003b72] uppercase tracking-wide">Work Email</label>
        <input
          id="home-form-email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="john@hospital.com"
          className="w-full border-b-2 border-slate-200 focus:border-[#006a63] outline-none transition-colors py-3 text-slate-800 bg-transparent placeholder:text-slate-500 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="home-form-message" className="text-sm font-bold text-[#003b72] uppercase tracking-wide">Message / Requirements</label>
        <textarea
          id="home-form-message"
          name="message"
          rows={3}
          required
          value={form.message}
          onChange={handleChange}
          placeholder="Specify instrument types and quantities..."
          className="w-full border-b-2 border-slate-200 focus:border-[#006a63] outline-none transition-colors py-3 text-slate-800 bg-transparent placeholder:text-slate-500 text-sm resize-none"
        />
      </div>

      {status === "error" && (
        <p role="alert" aria-live="assertive" className="text-sm text-red-600">
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        aria-busy={status === "loading"}
        className="w-full btn-primary py-4 justify-center disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Submit Quote Request"}
      </button>
    </form>
  );
}

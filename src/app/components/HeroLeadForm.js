"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const INTERESTS = [
  { value: "", label: "Select product interest…" },
  { value: "surgical",   label: "General Surgical Instruments" },
  { value: "dental",     label: "Dental Instruments" },
  { value: "beauty",     label: "Beauty Care Instruments" },
  { value: "ophthalmic", label: "Ophthalmic Instruments" },
  { value: "oem",        label: "Custom OEM / Private Label" },
  { value: "other",      label: "Other / General Enquiry" },
];

// ── Clinical Sanctuary input style ──────────────────────────────────────────
// Underline-only on surface_container_high fill; focus = opaque primary line
const FIELD =
  "w-full rounded px-4 py-3 text-sm text-text-heading placeholder:text-text-subtle " +
  "focus:outline-none transition-all duration-200 font-medium";

const FIELD_STYLE = {
  background: "#e6e8ea",         // surface_container_high
  border: "none",
  boxShadow: "none",
};

const FIELD_FOCUS_STYLE = {
  outline: "none",
  boxShadow: "0 2px 0 0 #006a63",  // teal underline on focus (Sterile Teal secondary)
};

function Field({ id, label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-white/60"
      >
        {label}{required && <span className="text-white/40 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function HeroLeadForm() {
  const [form, setForm]           = useState({ name: "", email: "", interest: "" });
  const [status, setStatus]       = useState("idle");
  const [errorMsg, setErrorMsg]   = useState("");
  const [captchaToken, setCaptcha] = useState(null);
  const [focused, setFocused]     = useState(null);
  const captchaRef = useRef(null);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function fieldStyle(name) {
    return focused === name ? { ...FIELD_STYLE, ...FIELD_FOCUS_STYLE } : FIELD_STYLE;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!captchaToken) {
      setStatus("error");
      setErrorMsg("Please complete the CAPTCHA.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          captchaToken,
          message: form.interest
            ? `Quick enquiry — interested in: ${form.interest}`
            : "Quick enquiry via homepage",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
      captchaRef.current?.resetCaptcha();
      setCaptcha(null);
    }
  }

  /* ── Success state ── */
  if (status === "success") {
    return (
      <div
        className="rounded-lg p-8 flex flex-col items-center justify-center text-center gap-5 min-h-[300px] animate-scale-in"
        style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <span
          className="inline-flex w-16 h-16 rounded-full items-center justify-center"
          style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        <div>
          <h3 className="text-xl font-extrabold text-text-heading mb-1.5">
            Enquiry Received
          </h3>
          <p className="text-sm text-text-body max-w-xs leading-relaxed">
            Our export team will respond within{" "}
            <strong className="text-brand-primary">24 hours</strong> with
            pricing, lead times, and MOQ details.
          </p>
        </div>
        <button
          onClick={() => { setStatus("idle"); setForm({ name: "", email: "", interest: "" }); setCaptcha(null); }}
          className="text-xs font-semibold text-brand-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    /* Glass card — surface_container_lowest at 88% opacity + 20px backdrop blur */
    <div
      className="rounded-lg overflow-hidden animate-slide-right delay-400"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 24px 80px rgba(0,59,114,0.16), 0 2px 0 rgba(255,255,255,0.6) inset",
      }}
    >
      {/* Header — gradient strip */}
      <div
        className="px-7 pt-6 pb-5"
        style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}
      >
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/60 mb-1.5">
          Direct from Manufacturer · No Commitment
        </p>
        <h2 className="text-xl font-extrabold text-white leading-tight">
          Get a Quote in 24 Hours
        </h2>
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit} noValidate className="px-7 py-6 flex flex-col gap-4">

        <Field id="hf-name" label="Full Name" required>
          <input
            id="hf-name"
            type="text"
            required
            autoComplete="name"
            placeholder="Jane Smith"
            value={form.name}
            onChange={set("name")}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            className={FIELD}
            style={fieldStyle("name")}
          />
        </Field>

        <Field id="hf-email" label="Work Email" required>
          <input
            id="hf-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={set("email")}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            className={FIELD}
            style={fieldStyle("email")}
          />
        </Field>

        <Field id="hf-interest" label="Product Interest">
          <select
            id="hf-interest"
            value={form.interest}
            onChange={set("interest")}
            onFocus={() => setFocused("interest")}
            onBlur={() => setFocused(null)}
            className={FIELD + " cursor-pointer"}
            style={fieldStyle("interest")}
          >
            {INTERESTS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>

        {/* hCaptcha */}
        <div className="flex justify-center">
          <HCaptcha
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
            onVerify={(token) => setCaptcha(token)}
            onExpire={() => setCaptcha(null)}
            ref={captchaRef}
            size="normal"
          />
        </div>

        {/* Error */}
        {status === "error" && (
          <p role="alert" className="text-xs text-red-600 bg-red-50 rounded px-4 py-2.5">
            {errorMsg}
          </p>
        )}

        {/* Submit — solid Trust Blue */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-2 text-white font-bold text-sm rounded px-6 py-3.5 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-60 hover:bg-brand-dark"
          style={{ backgroundColor: "#00529B", boxShadow: "0 4px 24px rgba(0,59,114,0.20)" }}
        >
          {status === "loading" ? (
            <>
              <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Sending…
            </>
          ) : (
            <>
              Send Enquiry
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>

        <p className="text-xs text-text-muted text-center leading-relaxed">
          We&apos;ll respond within 24 hours with pricing &amp; MOQ details.{" "}
          <Link href="/contact" className="text-brand-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded">
            Need a detailed form?
          </Link>
        </p>
      </form>
    </div>
  );
}

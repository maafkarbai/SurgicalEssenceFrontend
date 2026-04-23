"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email,     setEmail]     = useState("");
  const [status,    setStatus]    = useState("idle"); // idle | loading | success | error
  const [message,   setMessage]   = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res  = await fetch("/api/newsletter", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const json = await res.json();

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(json.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="bg-[#003b72]"
    >
      <div className="max-w-screen-2xl mx-auto px-8 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">

          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#77f4e8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          {/* Copy */}
          <div>
            <h2
              id="newsletter-heading"
              className="font-headline text-2xl sm:text-3xl font-extrabold text-white"
            >
              Stay Ahead of Surgical Innovation
            </h2>
            <p className="mt-3 text-[#a5c7ff] leading-relaxed text-sm sm:text-base">
              Get the latest product launches, industry insights, and company
              news delivered directly to your inbox.
            </p>
          </div>

          {/* Form */}
          {status === "success" ? (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#77f4e8" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span className="font-semibold">You&rsquo;re subscribed — thank you!</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-md flex flex-col sm:flex-row gap-3"
              noValidate
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={status === "loading"}
                autoComplete="email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[#77f4e8] focus:ring-2 focus:ring-[#77f4e8]/30 transition disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === "loading" || !email.trim()}
                aria-busy={status === "loading"}
                className="px-6 py-3 rounded-lg bg-[#77f4e8] hover:bg-[#5ee8da] text-[#003b72] font-bold text-sm transition-colors disabled:opacity-50 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#77f4e8]"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}

          {/* Error message */}
          {status === "error" && message && (
            <p role="alert" aria-live="assertive" className="text-sm text-red-300 -mt-3">
              {message}
            </p>
          )}

          {/* Trust note */}
          {status !== "success" && (
            <p className="text-xs text-white/40">
              No spam · Unsubscribe any time
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

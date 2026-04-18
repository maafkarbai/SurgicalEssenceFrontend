"use client";

import { useState, useRef } from "react";

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function CatalogEmailForm({ catalogKey, catalogLabel }) {
  const [email, setEmail]     = useState("");
  const [status, setStatus]   = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading" || status === "success") return;

    const trimmed = email.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/send-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, catalogKey }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(`Catalog sent to ${trimmed}`);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  // Reset error state when user starts typing again
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (status === "error") {
      setStatus("idle");
      setMessage("");
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs text-gray-500 mb-2 font-medium">
        Email this catalog to yourself
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
          <CheckIcon />
          <span>{message}</span>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label={`Email ${catalogLabel} catalog`}
        >
          <div className="flex gap-2">
            <label htmlFor={`email-${catalogKey}`} className="sr-only">
              Your email address
            </label>
            <input
              ref={inputRef}
              id={`email-${catalogKey}`}
              type="email"
              value={email}
              onChange={handleChange}
              placeholder="your@email.com"
              autoComplete="email"
              required
              disabled={status === "loading"}
              aria-describedby={status === "error" ? `email-error-${catalogKey}` : undefined}
              aria-invalid={status === "error"}
              className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:opacity-60 disabled:cursor-not-allowed transition"
            />
            <button
              type="submit"
              disabled={status === "loading" || !email.trim()}
              aria-label={status === "loading" ? "Sending catalog…" : "Send catalog to email"}
              aria-busy={status === "loading"}
              className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-primary hover:bg-brand-dark text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              {status === "loading" ? (
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                </svg>
              ) : (
                <SendIcon />
              )}
              <span className="hidden sm:inline">
                {status === "loading" ? "Sending…" : "Send"}
              </span>
            </button>
          </div>

          {status === "error" && (
            <p
              id={`email-error-${catalogKey}`}
              role="alert"
              className="mt-1.5 text-xs text-red-600"
            >
              {message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

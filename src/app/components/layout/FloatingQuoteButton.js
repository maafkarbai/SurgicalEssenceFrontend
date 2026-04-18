"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function FloatingQuoteButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show once user scrolls past the hero (~500px)
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Link
      href="/contact"
      aria-label="Get a quote"
      style={{ backgroundColor: "#00529B" }}
      className={`fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 px-5 py-3 rounded text-white text-sm font-bold transition-all duration-300 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary shadow-ambient ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      Get a Quote
    </Link>
  );
}

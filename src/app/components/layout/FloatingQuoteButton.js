"use client";

import { useEffect, useState } from "react";
import { useQuoteCart } from "@/app/context/QuoteCartContext";

export default function FloatingQuoteButton() {
  const [visible, setVisible] = useState(false);
  const { itemCount, setDrawerOpen } = useQuoteCart();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setDrawerOpen(true)}
      aria-label={`Open quote cart${itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? "s" : ""}` : ""}`}
      className={`fixed bottom-6 left-6 z-50 inline-flex items-center gap-2 px-5 py-3 rounded bg-brand-primary text-white text-sm font-bold transition-all duration-300 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary shadow-ambient ${
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
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      Quote Cart
      {itemCount > 0 && (
        <span className="bg-white/25 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}

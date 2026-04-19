"use client";

import { useQuoteCart } from "@/app/context/QuoteCartContext";

export default function AddToQuoteButton({ product, compact = false }) {
  const { addItem, setDrawerOpen } = useQuoteCart();

  const handleClick = () => {
    addItem({ productId: product.id, name: product.name, sku: product.sku });
    setDrawerOpen(true);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="mt-auto w-full py-2 rounded text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}
      >
        + Add to Quote
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded text-base font-bold text-white transition-opacity hover:opacity-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary shadow-ambient-sm"
      style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Add to Quote
    </button>
  );
}

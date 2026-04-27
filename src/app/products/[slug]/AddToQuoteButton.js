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
        className="mt-auto w-full btn-primary py-2 text-sm justify-center"
      >
        + Add to Quote
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex-1 btn-primary px-6 py-3 text-base justify-center"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Add to Quote
    </button>
  );
}

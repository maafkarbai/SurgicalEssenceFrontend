"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "se_quote_cart";

const QuoteCartContext = createContext(null);

export function QuoteCartProvider({ children }) {
  const [items,      setItems]      = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated,   setHydrated]   = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* ignore */ }
  }, [items, hydrated]);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.productId
            ? { ...i, quantity: i.quantity + (product.quantity ?? 1) }
            : i
        );
      }
      return [...prev, { ...product, quantity: product.quantity ?? 1, notes: product.notes ?? "" }];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    const qty = Math.max(1, Number(quantity) || 1);
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: qty } : i));
  }, []);

  const updateNotes = useCallback((productId, notes) => {
    setItems((prev) => prev.map((i) => i.productId === productId ? { ...i, notes } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <QuoteCartContext.Provider value={{
      items, itemCount, hydrated,
      addItem, removeItem, updateQuantity, updateNotes, clearCart,
      drawerOpen, setDrawerOpen,
    }}>
      {children}
    </QuoteCartContext.Provider>
  );
}

export function useQuoteCart() {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) throw new Error("useQuoteCart must be used inside QuoteCartProvider");
  return ctx;
}

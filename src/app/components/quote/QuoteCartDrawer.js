"use client";

import { useState, useEffect, useRef } from "react";
import { useQuoteCart } from "@/app/context/QuoteCartContext";
import { useAuth } from "@/app/context/AuthContext";

// ─── Icons ────────────────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Azerbaijan","Bahrain",
  "Bangladesh","Belgium","Brazil","Canada","Chile","China","Colombia","Croatia","Czech Republic",
  "Denmark","Egypt","Ethiopia","Finland","France","Germany","Ghana","Greece","Hungary","India",
  "Indonesia","Iran","Iraq","Ireland","Italy","Japan","Jordan","Kazakhstan","Kenya","Kuwait",
  "Lebanon","Libya","Malaysia","Mexico","Morocco","Netherlands","New Zealand","Nigeria","Norway",
  "Oman","Pakistan","Philippines","Poland","Portugal","Qatar","Romania","Saudi Arabia","Singapore",
  "South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria",
  "Tanzania","Thailand","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Uzbekistan","Vietnam","Yemen","Zimbabwe","Other",
];

const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#003b72]/20 focus:border-[#003b72] transition";

// ─── Cart Item Row ────────────────────────────────────────────────────────────

function CartItemRow({ item }) {
  const { updateQuantity, updateNotes, removeItem } = useQuoteCart();

  return (
    <div className="flex flex-col gap-2 py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-tight truncate">{item.productName}</p>
          {item.productSku && <p className="text-xs text-gray-400 mt-0.5">SKU: {item.productSku}</p>}
        </div>
        <button
          type="button"
          onClick={() => removeItem(item.productId)}
          aria-label={`Remove ${item.productName}`}
          className="shrink-0 text-gray-300 hover:text-red-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 rounded"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">Qty:</span>
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <button type="button"
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm font-bold transition-colors focus-visible:outline-none"
            aria-label="Decrease quantity">−</button>
          <span className="w-8 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
          <button type="button"
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm font-bold transition-colors focus-visible:outline-none"
            aria-label="Increase quantity">+</button>
        </div>
      </div>

      {/* Notes */}
      <input
        type="text"
        value={item.notes}
        onChange={(e) => updateNotes(item.productId, e.target.value)}
        placeholder="Add a note (size, grade, etc.)"
        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#003b72]/20 focus:border-[#003b72] transition"
      />
    </div>
  );
}

// ─── Quote Form ───────────────────────────────────────────────────────────────

function QuoteForm({ onSuccess }) {
  const { items, clearCart } = useQuoteCart();
  const { user, openLogin }  = useAuth();

  const [fields,   setFields]   = useState({
    name: user?.name || "", email: user?.email || "",
    phone: user?.phone || "", organization: user?.company || "",
    country: user?.country || "", message: "",
  });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Re-sync pre-fill when user logs in while drawer is open
  useEffect(() => {
    if (user) {
      setFields((f) => ({
        ...f,
        name:         f.name         || user.name    || "",
        email:        f.email        || user.email   || "",
        organization: f.organization || user.company || "",
        country:      f.country      || user.country || "",
        phone:        f.phone        || user.phone   || "",
      }));
    }
  }, [user]);

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fields.name.trim()) { setError("Name is required."); return; }
    if (!fields.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      setError("Valid email is required."); return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit.");
      clearCart();
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      {!user && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-xs text-blue-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>
            <button type="button" onClick={openLogin} className="font-semibold underline hover:no-underline">Sign in</button>
            {" "}to pre-fill your details and save this quote to your account.
          </span>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="qf-name" className="block text-xs font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
          <input id="qf-name" type="text" required value={fields.name} onChange={set("name")}
            placeholder="Dr. John Smith" className={inputCls} />
        </div>
        <div>
          <label htmlFor="qf-org" className="block text-xs font-semibold text-gray-700 mb-1">Organisation</label>
          <input id="qf-org" type="text" value={fields.organization} onChange={set("organization")}
            placeholder="City Hospital" className={inputCls} />
        </div>
        <div className="col-span-2">
          <label htmlFor="qf-email" className="block text-xs font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
          <input id="qf-email" type="email" required value={fields.email} onChange={set("email")}
            placeholder="you@company.com" className={inputCls} />
        </div>
        <div>
          <label htmlFor="qf-phone" className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
          <input id="qf-phone" type="tel" value={fields.phone} onChange={set("phone")}
            placeholder="+1 555 0000" className={inputCls} />
        </div>
        <div>
          <label htmlFor="qf-country" className="block text-xs font-semibold text-gray-700 mb-1">Country</label>
          <select id="qf-country" value={fields.country} onChange={set("country")} className={inputCls + " bg-white"}>
            <option value="">Select…</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label htmlFor="qf-message" className="block text-xs font-semibold text-gray-700 mb-1">Message / Requirements</label>
          <textarea id="qf-message" rows={3} value={fields.message} onChange={set("message")}
            placeholder="Quantities, certifications needed, delivery timeline…"
            className={inputCls + " resize-none"} />
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-lg bg-[#003b72] hover:bg-[#00529b] text-white font-bold text-sm disabled:opacity-60 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]">
        {loading ? "Sending…" : "Submit Quote Request"}
      </button>
      <p className="text-center text-xs text-gray-400">Our team responds within 24 hours.</p>
    </form>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

export default function QuoteCartDrawer() {
  const { items, itemCount, drawerOpen, setDrawerOpen } = useQuoteCart();
  const [step, setStep] = useState("cart"); // "cart" | "form" | "success"
  const closeRef = useRef(null);
  const panelRef = useRef(null);

  const close = () => {
    setDrawerOpen(false);
    // Reset step after animation
    setTimeout(() => setStep("cart"), 300);
  };

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Focus close button on open
  useEffect(() => {
    if (drawerOpen) setTimeout(() => closeRef.current?.focus(), 50);
  }, [drawerOpen]);

  // Tab trap within the drawer panel
  useEffect(() => {
    if (!drawerOpen) return;
    const handleTab = (e) => {
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [drawerOpen]);

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Quote cart"
        className={`fixed top-0 right-0 z-[160] h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-[#003b72]">
          <div className="flex items-center gap-2 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span className="font-bold text-base">
              {step === "success" ? "Quote Sent" : "Quote Cart"}
            </span>
            {step === "cart" && itemCount > 0 && (
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button ref={closeRef} type="button" onClick={close} aria-label="Close cart"
            className="text-white/70 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded">
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── Step: success ── */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center px-6 py-16">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Quote Request Sent!</h2>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                We've received your request and will respond with pricing within <strong>24 hours</strong>.
              </p>
              <button type="button" onClick={close}
                className="mt-6 px-6 py-2.5 rounded-lg bg-[#003b72] text-white font-bold text-sm hover:bg-[#00529b] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]">
                Close
              </button>
            </div>
          )}

          {/* ── Step: cart ── */}
          {step === "cart" && (
            <div className="px-5 py-4">
              {items.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                    className="mx-auto mb-3 opacity-30" aria-hidden="true">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                  </svg>
                  <p className="text-sm font-medium">Your quote cart is empty.</p>
                  <p className="text-xs mt-1">Browse products and click "Add to Quote".</p>
                </div>
              ) : (
                <div>
                  {items.map((item) => <CartItemRow key={item.productId} item={item} />)}
                </div>
              )}
            </div>
          )}

          {/* ── Step: form ── */}
          {step === "form" && (
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Your Details
              </p>
              <QuoteForm onSuccess={() => setStep("success")} />
            </div>
          )}
        </div>

        {/* Footer — only on cart step */}
        {step === "cart" && items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{itemCount} item{itemCount !== 1 ? "s" : ""} in cart</span>
            </div>
            <button type="button" onClick={() => setStep("form")}
              className="w-full py-3 rounded-lg bg-[#003b72] hover:bg-[#00529b] text-white font-bold text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]">
              Proceed to Submit Quote →
            </button>
          </div>
        )}

        {/* Back button on form step */}
        {step === "form" && (
          <div className="px-5 py-3 border-t border-gray-100">
            <button type="button" onClick={() => setStep("cart")}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72] rounded">
              ← Back to cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}

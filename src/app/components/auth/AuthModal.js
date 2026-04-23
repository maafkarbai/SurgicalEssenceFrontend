"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const inputCls = (err) =>
  `w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400 bg-white transition
   focus:outline-none focus:ring-2 focus:ring-[#003b72]/20 focus:border-[#003b72]
   ${err ? "border-red-400 bg-red-50/30" : "border-gray-300 hover:border-gray-400"}`;

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }) {
  const { login, openRegister } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="login-email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
        <input id="login-email" type="email" autoComplete="email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com" className={inputCls(false)} />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
        <input id="login-password" type="password" autoComplete="current-password" required
          value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••" className={inputCls(false)} />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-lg bg-[#003b72] hover:bg-[#00529b] text-white font-bold text-sm disabled:opacity-60 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]">
        {loading ? "Signing in…" : "Sign In"}
      </button>
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <button type="button" onClick={openRegister}
          className="font-semibold text-[#003b72] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72] rounded">
          Create one
        </button>
      </p>
    </form>
  );
}

// ─── Register form ────────────────────────────────────────────────────────────

function RegisterForm({ onSuccess }) {
  const { register, openLogin } = useAuth();
  const [fields,  setFields]  = useState({ name: "", email: "", company: "", password: "", confirm: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (fields.password !== fields.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register({
        name:     fields.name,
        email:    fields.email,
        company:  fields.company,
        password: fields.password,
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label htmlFor="reg-name" className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
          <input id="reg-name" type="text" autoComplete="name" required
            value={fields.name} onChange={set("name")} placeholder="Dr. John Smith"
            className={inputCls(false)} />
        </div>
        <div className="col-span-2">
          <label htmlFor="reg-email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
          <input id="reg-email" type="email" autoComplete="email" required
            value={fields.email} onChange={set("email")} placeholder="you@company.com"
            className={inputCls(false)} />
        </div>
        <div className="col-span-2">
          <label htmlFor="reg-company" className="block text-sm font-semibold text-gray-700 mb-1.5">Company / Organisation</label>
          <input id="reg-company" type="text" autoComplete="organization"
            value={fields.company} onChange={set("company")} placeholder="City General Hospital"
            className={inputCls(false)} />
        </div>
        <div>
          <label htmlFor="reg-password" className="block text-sm font-semibold text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
          <input id="reg-password" type="password" autoComplete="new-password" required
            value={fields.password} onChange={set("password")} placeholder="Min. 8 characters"
            className={inputCls(false)} />
        </div>
        <div>
          <label htmlFor="reg-confirm" className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm <span className="text-red-500">*</span></label>
          <input id="reg-confirm" type="password" autoComplete="new-password" required
            value={fields.confirm} onChange={set("confirm")} placeholder="Repeat password"
            className={inputCls(false)} />
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-lg bg-[#003b72] hover:bg-[#00529b] text-white font-bold text-sm disabled:opacity-60 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72]">
        {loading ? "Creating account…" : "Create Account"}
      </button>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button type="button" onClick={openLogin}
          className="font-semibold text-[#003b72] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72] rounded">
          Sign in
        </button>
      </p>
    </form>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

export default function AuthModal() {
  const { modalOpen, modalTab, setModalTab, closeModal } = useAuth();
  const overlayRef = useRef(null);
  const panelRef   = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen]);

  // Tab trap within the modal panel
  useEffect(() => {
    if (!modalOpen) return;
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
  }, [modalOpen]);

  if (!modalOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) closeModal(); }}
      role="dialog"
      aria-modal="true"
      aria-label={modalTab === "login" ? "Sign in to your account" : "Create an account"}
    >
      <div ref={panelRef} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {["login", "register"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setModalTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72] ${
                  modalTab === tab
                    ? "bg-white text-[#003b72] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003b72] rounded"
          >
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-xs text-gray-500 mb-5">
            {modalTab === "login"
              ? "Sign in to pre-fill your quote details and view order history."
              : "Create a free account to save your details and track quotes."}
          </p>
          {modalTab === "login"
            ? <LoginForm onSuccess={closeModal} />
            : <RegisterForm onSuccess={closeModal} />
          }
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function AdminLoginPage() {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState("");
  const captchaRef = useRef(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCaptchaError("");

    if (!captchaToken) {
      setCaptchaError("Please complete the CAPTCHA.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
        return;
      }
      router.push("/admin/press-releases");
    } catch {
      setError("Network error. Please try again.");
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo/SurgicalEssenceLogo.png"
            alt="Surgical Essence"
            width={160}
            height={60}
            priority
          />
        </div>

        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Admin Login</h1>
          <p className="text-sm text-gray-500 mb-6">Press release management</p>

          {error && (
            <div role="alert" className="mb-5 px-3 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition"
                placeholder="admin@surgicalessence.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
                ref={captchaRef}
                onVerify={(token) => { setCaptchaToken(token); setCaptchaError(""); }}
                onExpire={() => setCaptchaToken(null)}
                onError={() => { setCaptchaToken(null); setCaptchaError("CAPTCHA error. Please try again."); }}
              />
              {captchaError && (
                <p role="alert" className="mt-2 text-xs text-red-600">{captchaError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm disabled:opacity-60 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

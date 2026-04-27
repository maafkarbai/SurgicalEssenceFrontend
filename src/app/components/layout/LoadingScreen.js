"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Durations (ms)
const HOLD_MS = 1600; // how long the screen stays fully visible
const FADE_MS = 500; // CSS transition duration

export default function LoadingScreen() {
  const [phase, setPhase] = useState("visible"); // "visible" | "fading" | "gone"

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fading"), HOLD_MS);
    const goneTimer = setTimeout(() => setPhase("gone"), HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    // White background — brand-primary (#1E3A5F) on white = 5.88:1 (WCAG AA)
    <div
      role="status"
      aria-label="Loading Surgical Essence, please wait"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-surface-lowest transition-opacity duration-500 ${
        phase === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-fade-in-up">
        {/* Logo */}
        <Image
          src="/images/logo/SurgicalEssenceLogo.svg"
          alt="Surgical Essence"
          width={280}
          height={112}
          priority
        />

        {/* Progress bar — soulful gradient, ambient glow */}
        <div
          className="w-52 h-[3px] bg-surface-high rounded-full overflow-hidden"
          role="progressbar"
          aria-label="Loading progress"
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full animate-loading-bar"
            style={{ background: "linear-gradient(90deg, #003b72, #00529B)" }}
          />
        </div>
      </div>
    </div>
  );
}

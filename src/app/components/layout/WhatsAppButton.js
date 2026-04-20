"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567";
  const message = encodeURIComponent("Hi, I'd like to get a quote for surgical instruments.");
  const href = `https://wa.me/${number}?text=${message}`;

  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show the bubble after 3 s, hide after 8 s (unless user dismissed it)
  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 3000);
    const hide = setTimeout(() => setVisible(false), 8000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  const dismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">

      {/* Chat bubble */}
      {!dismissed && (
        <div
          aria-live="polite"
          className={`relative flex items-center gap-2 bg-white text-[#111] text-sm font-semibold px-4 py-2.5 rounded-2xl rounded-br-sm shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all duration-300 max-w-55 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          {/* Tail */}
          <span
            aria-hidden="true"
            className="absolute -bottom-2 right-3 w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "0px solid transparent",
              borderTop: "8px solid white",
            }}
          />

          <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.535 5.845L.057 23.547a.75.75 0 0 0 .931.899l5.765-1.507A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.698-.505-5.245-1.388l-.374-.217-3.876 1.013 1.02-3.78-.237-.386A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>

          <span>Get a quote via WhatsApp</span>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="ml-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer leading-none"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* WhatsApp button */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get a quote via WhatsApp"
        onClick={() => setVisible(false)}
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
        style={{ backgroundColor: "#25D366" }}
      >
        <Image src="/WhatsApp.svg" alt="" width={30} height={30} aria-hidden="true" />
      </a>
    </div>
  );
}

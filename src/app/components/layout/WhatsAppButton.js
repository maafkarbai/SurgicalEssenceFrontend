"use client";

import Image from "next/image";

export default function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567";
  const href = `https://wa.me/${number}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-ambient transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
      style={{ backgroundColor: "#25D366" }}
    >
      <Image
        src="/WhatsApp.svg"
        alt=""
        width={30}
        height={30}
        aria-hidden="true"
      />
    </a>
  );
}

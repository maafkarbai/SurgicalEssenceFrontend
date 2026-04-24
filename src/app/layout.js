import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/layout/Footer";
import ClientOverlays from "@/app/components/layout/ClientOverlays";
import Providers from "@/app/components/layout/Providers";

// Manrope — display & headlines (editorial authority)
const ManropeFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

// Inter — body copy & UI (clinical legibility, tall x-height for medical data)
const InterFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://surgicalessence.com",
  ),
  title: {
    default: "Surgical Essence | Precision Surgical Instruments Manufacturer",
    template: "%s | Surgical Essence",
  },
  description:
    "Surgical Essence is an international surgical instruments manufacturer and a wholesale supplier, providing high-quality surgical instruments, medical devices, and hospital equipment to healthcare professionals worldwide. We specialize in precision surgical tools, including general surgery instruments, orthopedic instruments, dental instruments, gynecology instruments, and sterilization equipment. Our products are designed to meet the needs of surgeons, hospitals, clinics, and medical distributors, ensuring accuracy, reliability, and durability in every instrument. As a trusted wholesale surgical instruments supplier and OEM manufacturer, we offer bulk supply, custom branding, and ISO-standard medical instruments for global healthcare markets.",
  openGraph: {
    siteName: "Surgical Essence",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@SurgicalEssence",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${ManropeFont.variable} ${InterFont.variable} antialiased`}
      >
        <Providers>
          {/* Skip link — first focusable element; visible only on focus */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded focus:bg-brand-primary focus:text-white focus:font-semibold focus:text-sm focus:outline-2 focus:outline-offset-2 focus:outline-white"
          >
            Skip to main content
          </a>

          {/* Landmark: site-wide navigation */}
          <header>
            <Navbar />
          </header>

          {/* Landmark: page content — skip link target */}
          {/* pt offsets the fixed navbar: mobile h-24 (96px), desktop h-11+h-24+h-14 (196px) */}
          <main
            id="main-content"
            tabIndex={-1}
            className="outline-none pt-24 md:pt-[196px]"
          >
            {children}
          </main>

          {/* Landmark: site-wide footer */}
          <Footer />

          {/* All floating/interactive overlays in one client boundary */}
          <ClientOverlays />
        </Providers>
      </body>
    </html>
  );
}

"use client";

import LoadingScreen from "./LoadingScreen";
import ScrollToTop from "./ScrollToTop";
import FloatingQuoteButton from "./FloatingQuoteButton";
import WhatsAppButton from "./WhatsAppButton";

// Groups all floating/interactive overlays into a single client boundary,
// keeping RootLayout a pure Server Component.
export default function ClientOverlays() {
  return (
    <>
      <LoadingScreen />
      <ScrollToTop />
      <FloatingQuoteButton />
      <WhatsAppButton />
    </>
  );
}

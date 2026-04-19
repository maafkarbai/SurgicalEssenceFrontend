"use client";

import LoadingScreen from "./LoadingScreen";
import ScrollToTop from "./ScrollToTop";
import FloatingQuoteButton from "./FloatingQuoteButton";
import WhatsAppButton from "./WhatsAppButton";
import AuthModal from "@/app/components/auth/AuthModal";
import QuoteCartDrawer from "@/app/components/quote/QuoteCartDrawer";

export default function ClientOverlays() {
  return (
    <>
      <LoadingScreen />
      <ScrollToTop />
      <FloatingQuoteButton />
      <WhatsAppButton />
      <AuthModal />
      <QuoteCartDrawer />
    </>
  );
}

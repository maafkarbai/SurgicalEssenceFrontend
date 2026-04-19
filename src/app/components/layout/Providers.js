"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import { QuoteCartProvider } from "@/app/context/QuoteCartContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <QuoteCartProvider>
        {children}
      </QuoteCartProvider>
    </AuthProvider>
  );
}

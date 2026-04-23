import ProductsFilter from "./ProductsFilter";
import { PRODUCTS } from "@/lib/products";

export const metadata = {
  title: "Our Instruments | Surgical Essence",
  description:
    "Browse our full range of precision-engineered surgical, dental, beauty, and ophthalmic instruments. ISO-certified and exported worldwide from Sialkot, Pakistan.",
  openGraph: {
    title: "Our Instruments | Surgical Essence",
    description:
      "Browse our full range of precision-engineered surgical, dental, beauty, and ophthalmic instruments. ISO-certified and exported worldwide from Sialkot, Pakistan.",
    images: [{ url: "/images/hero/Hero.png", width: 1200, height: 630, alt: "Surgical Essence instrument catalogue" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Instruments | Surgical Essence",
    description:
      "Browse our full range of precision-engineered surgical, dental, beauty, and ophthalmic instruments. ISO-certified and exported worldwide from Sialkot, Pakistan.",
    images: ["/images/hero/Hero.png"],
  },
};

// Static hero — rendered on the server, zero client JS
function ProductsHero() {
  return (
    <div className="text-white py-10 px-4 sm:px-6 lg:px-8" style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">
            Product Range
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Our Instruments</h1>
          <p className="mt-2 text-white/80 text-base max-w-xl leading-relaxed">
            Precision-engineered surgical instruments manufactured in Sialkot, Pakistan.
            ISO-certified and exported to healthcare professionals worldwide.
          </p>
        </div>
        <div className="flex gap-6 shrink-0">
          {[
            [String(PRODUCTS.length) + "+", "Instruments"],
            ["4",                            "Categories"  ],
            ["ISO",                          "Certified"   ],
          ].map(([val, lbl]) => (
            <div key={lbl} className="flex flex-col items-center">
              <span className="text-2xl font-extrabold text-white leading-none">{val}</span>
              <span className="text-xs text-white/60 font-semibold uppercase tracking-wide">{lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Page is a Server Component — only ProductsFilter is sent as client JS
export default function ProductsPage() {
  return (
    <>
      <ProductsHero />
      <ProductsFilter />
    </>
  );
}

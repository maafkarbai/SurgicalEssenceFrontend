import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Page Not Found | Surgical Essence" };

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full">

        {/* Product image */}
        <div className="relative w-48 h-48 mx-auto mb-8 rounded-full overflow-hidden bg-surface-low shadow-ambient">
          <Image
            src="/images/products/forceps-1.jpg"
            alt="Surgical forceps"
            fill
            className="object-cover"
            sizes="192px"
          />
        </div>

        <p className="text-eyebrow text-brand-primary mb-3">404</p>
        <h1 className="font-headline text-3xl font-extrabold text-text-heading mb-3">
          Page not found
        </h1>
        <p className="text-text-body leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Browse our instrument catalogue or get in touch.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded font-bold text-white text-sm shadow-ambient-sm hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            style={{ background: "linear-gradient(135deg, #003b72, #00529B)" }}
          >
            Browse Products
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded border-2 border-[#003b72] text-brand-primary font-bold text-sm hover:bg-brand-secondary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

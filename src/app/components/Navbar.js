"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SearchModal from "@/app/components/SearchModal";
import { useAuth } from "@/app/context/AuthContext";
import { useQuoteCart } from "@/app/context/QuoteCartContext";

const CATEGORIES = [
  {
    href: "/products?cat=surgical",
    label: "Surgical",
    desc: "Scissors, forceps, clamps, retractors & more",
    image: "/images/products/scalpel-1.jpg",
  },
  {
    href: "/products?cat=dental",
    label: "Dental",
    desc: "Scalers, forceps, mirrors & more",
    image: "/images/products/probe-1.jpg",
  },
  {
    href: "/products?cat=beauty",
    label: "Beauty Care",
    desc: "Scissors, nippers, tweezers & more",
    image: "/images/products/forceps-9.jpg",
  },
  {
    href: "/products?cat=ophthalmic",
    label: "Ophthalmic",
    desc: "Iris scissors, specula, forceps & more",
    image: "/images/products/forceps-1.jpg",
  },
];

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/quality-control", label: "Quality Control" },
  { href: "/certifications", label: "Certifications" },
  { href: "/distributor", label: "Distributors" },
  { href: "/products", label: "Products", hasDropdown: true },
  { href: "/press-releases", label: "News" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const CatalogIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const PhoneIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16l.19.92z" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const MailIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChevronDown = ({ open }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Products dropdown ────────────────────────────────────────────────────────

function ProductsDropdown({ onClose }) {
  return (
    <div
      id="products-dropdown"
      role="menu"
      aria-label="Product categories"
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-surface-lowest rounded-md overflow-hidden animate-slide-down z-50 shadow-ambient"
    >
      <Link
        href="/products"
        onClick={onClose}
        aria-label="View all surgical instruments"
        role="menuitem"
        className="flex items-center justify-between px-4 py-2.5 bg-brand-primary text-white font-semibold text-sm hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
      >
        <span>All Instruments</span>
        <span className="text-white/70 text-xs">View all →</span>
      </Link>
      <ul role="none" className="py-1.5">
        {CATEGORIES.map(({ href, label, desc, image }) => (
          <li role="none" key={href}>
            <Link
              href={href}
              onClick={onClose}
              role="menuitem"
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-colors group"
            >
              {/* Instrument thumbnail */}
              <div className="relative shrink-0 w-10 h-14 rounded-lg bg-surface-low overflow-hidden">
                <Image
                  src={image}
                  alt={label}
                  fill
                  className="object-contain p-1.5"
                  sizes="40px"
                />
              </div>
              {/* Text */}
              <div className="min-w-0">
                <span className="block font-semibold text-sm text-gray-900 group-hover:text-brand-primary transition-colors">
                  {label}
                </span>
                <span className="block text-xs text-gray-500 truncate">
                  {desc}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const menuTriggerRef = useRef(null);

  const { itemCount, setDrawerOpen } = useQuoteCart();
  const { user, loading: authLoading, openLogin, openRegister, logout } = useAuth();

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return (
      pathname === href ||
      pathname.startsWith(href + "/") ||
      pathname.startsWith(href + "?")
    );
  };

  // Global keyboard shortcuts (search, escape for dropdown)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setDropdownOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (
        e.key === "/" &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA" &&
        e.target.tagName !== "SELECT"
      ) {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close products dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Focus management: move focus into menu on open, return to trigger on close
  useEffect(() => {
    if (menuOpen && mobileMenuRef.current) {
      const firstFocusable = mobileMenuRef.current.querySelector("a, button");
      firstFocusable?.focus();
    } else if (!menuOpen && menuTriggerRef.current) {
      if (mobileMenuRef.current?.contains(document.activeElement)) {
        menuTriggerRef.current.focus();
      }
    }
  }, [menuOpen]);

  // Tab trap inside mobile menu
  useEffect(() => {
    if (!menuOpen) return;
    const handleTab = (e) => {
      if (e.key !== "Tab" || !mobileMenuRef.current) return;
      const focusables = mobileMenuRef.current.querySelectorAll(
        'a, button, input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [menuOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  return (
    <header className="w-full bg-surface-lowest fixed top-0 left-0 right-0 z-40 shadow-ambient-sm">
      {/* ══ Row 1: Utility bar ══════════════════════════════════════════════ */}
      <div className="hidden md:block bg-brand-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between">
          {/* Left — phone */}
          <a
            href="tel:+923036029756"
            aria-label="Call us at +92 303 602 9756"
            className="flex items-center gap-1.5 min-h-11 py-2 text-white hover:text-white/80 text-xs font-medium transition-colors focus-visible:outline-1 focus-visible:outline-white"
          >
            <PhoneIcon />
            +92 303 602 9756
          </a>

          {/* Right — WhatsApp + Email */}
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/923036029756"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="flex items-center gap-1.5 min-h-11 py-2 text-white hover:text-white/80 text-xs font-medium transition-colors focus-visible:outline-1 focus-visible:outline-white"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
            <span className="text-white/30" aria-hidden="true">
              |
            </span>
            <a
              href="mailto:info@surgicalessence.com"
              aria-label="Email info@surgicalessence.com"
              className="flex items-center gap-1.5 min-h-11 py-2 text-white hover:text-white/80 text-xs font-medium transition-colors focus-visible:outline-1 focus-visible:outline-white"
            >
              <MailIcon />
              info@surgicalessence.com
            </a>
          </div>
        </div>
      </div>

      {/* ══ Row 2: Logo + Search + CTAs ════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4 h-24">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Go to homepage"
          className="flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded"
        >
          <Image
            src="/images/logo/SurgicalEssenceLogo.png"
            alt="Surgical Essence"
            width={220}
            height={88}
            priority
          />
        </Link>

        {/* Search — grows to fill available space */}
        <button
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="Search products"
          aria-expanded={searchOpen}
          aria-haspopup="dialog"
          className="hidden md:flex items-center gap-2 px-3 h-11 flex-1 max-w-xl rounded border border-border text-text-muted bg-surface-low hover:border-brand-primary hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-colors"
        >
          <SearchIcon />
          <span className="text-sm">Search products…</span>
        </button>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Cart button — Fix 6: w-10 h-10 → w-11 h-11 */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={`Open quote cart${itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? "s" : ""}` : ""}`}
            className="relative flex items-center justify-center w-11 h-11 rounded border border-border text-text-body hover:text-brand-primary hover:border-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>

          {/* Auth — Fix 6: h-10 → h-11 */}
          {!authLoading && (
            user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label="Account menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 px-2.5 h-11 rounded border border-border text-text-body hover:border-brand-primary hover:text-brand-primary transition-colors text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                  </span>
                  <span className="hidden lg:inline max-w-[80px] truncate text-sm">
                    {user.name?.split(" ")[0] ?? "Account"}
                  </span>
                  <ChevronDown open={userMenuOpen} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    <p className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100 truncate">{user.email}</p>
                    <Link
                      href="/my-account"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors"
                    >
                      My Account
                    </Link>
                    <button
                      type="button"
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                aria-label="Sign in to your account"
                className="flex items-center gap-1.5 px-3 h-11 rounded border border-border text-text-body hover:border-brand-primary hover:text-brand-primary transition-colors text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                <UserIcon />
                Sign In
              </button>
            )
          )}

          <Link href="/catalog" className="btn-outline py-2 px-4 text-sm">
            <CatalogIcon />
            View Catalog
          </Link>
          <Link href="/contact" className="btn-primary py-2 px-4 text-sm">
            Get a Quote
          </Link>
        </div>

        {/* Mobile: cart + auth + search + hamburger — Fix 6: w-9 h-9 → w-11 h-11 */}
        <div className="md:hidden flex items-center gap-1.5 ml-auto">
          {/* Mobile cart icon */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={`Open quote cart${itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? "s" : ""}` : ""}`}
            className="relative flex items-center justify-center w-11 h-11 rounded bg-surface-low text-text-muted hover:bg-brand-secondary hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </button>

          {/* Mobile auth icon */}
          {!authLoading && (
            user ? (
              <Link
                href="/my-account"
                aria-label="My account"
                className="flex items-center justify-center w-11 h-11 rounded bg-surface-low text-text-muted hover:bg-brand-secondary hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                aria-label="Sign in"
                className="flex items-center justify-center w-11 h-11 rounded bg-surface-low text-text-muted hover:bg-brand-secondary hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                <UserIcon />
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search products"
            className="flex items-center justify-center w-11 h-11 rounded bg-surface-low text-text-muted hover:bg-brand-secondary hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <SearchIcon />
          </button>

          {/* Hamburger — Fix 5: add ref; Fix 6: w-9 h-9 → w-11 h-11 */}
          <button
            ref={menuTriggerRef}
            type="button"
            className="flex items-center justify-center w-11 h-11 rounded text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-colors"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ══ Row 3: Nav links (desktop only) ════════════════════════════════ */}
      <nav
        className="hidden md:block bg-surface-low drop-shadow-sm"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-14">
          <ul className="flex items-center gap-0.5 flex-1" role="list">
            {NAV_LINKS.map(({ href, label, hasDropdown }) => (
              <li
                key={href}
                className="relative"
                ref={hasDropdown ? dropdownRef : undefined}
                onBlur={
                  hasDropdown
                    ? (e) => {
                        if (!dropdownRef.current?.contains(e.relatedTarget))
                          setDropdownOpen(false);
                      }
                    : undefined
                }
              >
                {hasDropdown ? (
                  <>
                    {/* Fix 8: aria-haspopup="true" → aria-haspopup="menu" */}
                    <button
                      type="button"
                      onClick={() => setDropdownOpen((v) => !v)}
                      onMouseEnter={() => setDropdownOpen(true)}
                      aria-haspopup="menu"
                      aria-expanded={dropdownOpen}
                      aria-controls="products-dropdown"
                      aria-current={isActive(href) ? "page" : undefined}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold hover:text-brand-primary hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-colors
                        ${isActive(href) ? "text-brand-primary border-b-2 border-brand-primary" : "text-black"}`}
                    >
                      {label}
                      <ChevronDown open={dropdownOpen} />
                    </button>
                    {dropdownOpen && (
                      <div onMouseLeave={() => setDropdownOpen(false)}>
                        <ProductsDropdown
                          onClose={() => setDropdownOpen(false)}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={`inline-block px-3 py-1.5 text-sm font-semibold hover:text-brand-primary hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-colors
                      ${isActive(href) ? "text-brand-primary border-b-2 border-brand-primary" : "text-black"}`}
                  >
                    {label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Search modal ── */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      {/* ══ Mobile menu — Fix 5: role="dialog" + aria-modal + ref ═════════ */}
      {menuOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="md:hidden bg-surface-lowest px-4 pb-5"
        >
          {/* Nav links */}
          <ul className="flex flex-col gap-0.5 mt-3" role="list">
            {NAV_LINKS.map(({ href, label, hasDropdown }) => (
              <li key={href}>
                {hasDropdown ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMobileProductsOpen((v) => !v)}
                      aria-expanded={mobileProductsOpen}
                      aria-current={isActive(href) ? "page" : undefined}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm font-semibold hover:text-brand-primary hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-colors
                        ${isActive(href) ? "text-brand-primary bg-slate-100" : "text-black"}`}
                    >
                      {label}
                      <ChevronDown open={mobileProductsOpen} />
                    </button>
                    {mobileProductsOpen && (
                      <ul
                        className="mt-0.5 ml-4 flex flex-col pl-4"
                        role="list"
                      >
                        <li>
                          <Link
                            href="/products"
                            onClick={() => setMenuOpen(false)}
                            className="block py-1.5 text-sm font-semibold text-brand-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                          >
                            All Instruments →
                          </Link>
                        </li>
                        {CATEGORIES.map(({ href, label }) => (
                          <li key={href}>
                            <Link
                              href={href}
                              onClick={() => setMenuOpen(false)}
                              className="block py-1.5 text-sm text-gray-600 hover:text-brand-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-colors"
                            >
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={`block px-3 py-2 rounded text-sm font-semibold hover:text-brand-primary hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-colors
                      ${isActive(href) ? "text-brand-primary bg-slate-100" : "text-black"}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Contact actions */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex gap-2">
              <a
                href="tel:+923036029756"
                aria-label="Call us at +92 303 602 9756"
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-surface-low text-text-body text-sm font-medium hover:bg-brand-secondary hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                <PhoneIcon />
                Call Us
              </a>
              <a
                href="https://wa.me/923036029756"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-surface-low text-text-body text-sm font-medium hover:bg-brand-secondary hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
            </div>
            <Link
              href="/catalog"
              className="btn-outline py-2 px-4 text-sm w-full justify-center"
              onClick={() => setMenuOpen(false)}
            >
              <CatalogIcon />
              View Catalog
            </Link>
            <Link
              href="/contact"
              className="btn-primary py-2 px-4 text-sm w-full justify-center"
              onClick={() => setMenuOpen(false)}
            >
              Get a Quote
            </Link>

            {/* Auth section */}
            {!authLoading && (
              user ? (
                <div className="pt-2 border-t border-gray-100 mt-1 flex flex-col gap-0.5">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <span className="w-8 h-8 rounded-full bg-brand-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
                      {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name ?? "Account"}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/my-account"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded text-sm text-gray-700 font-medium hover:text-brand-primary hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    My Account
                  </Link>
                  <button
                    type="button"
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded text-sm text-red-600 font-medium hover:bg-red-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-100 mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => { openLogin(); setMenuOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded border border-brand-primary text-brand-primary text-sm font-semibold hover:bg-brand-secondary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    <UserIcon />
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { openRegister(); setMenuOpen(false); }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-brand-primary text-white text-sm font-semibold hover:bg-brand-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    Register
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

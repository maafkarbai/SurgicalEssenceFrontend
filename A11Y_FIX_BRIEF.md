# Accessibility Fix Brief — Claude Code Action Plan

**Target:** WCAG 2.1 AA compliance on the home page and shared components.
**Scope:** 11 fixes across 6 files. Estimated effort: 2–3 hours.
**How to use:** Paste this entire file into Claude Code with the instruction: *"Execute all fixes in this brief. Show me a diff summary after each fix."*

---

## Prerequisites

- Node/Next.js dev server running on `localhost:3000`
- Files reside under `src/app/**`
- Tailwind v4 with CSS custom properties in `src/app/globals.css`
- Project uses `@/` path alias for `src/`

---

## Fix 1 — Associate form labels with inputs (CRITICAL, WCAG 1.3.1 / 3.3.2 / 4.1.2)

**File:** `src/app/components/HomeContactForm.js`

**Problem:** All 4 `<label>` elements lack `htmlFor`; all 4 `<input>`/`<textarea>` lack `id`. Screen readers announce fields as "edit text" with no context.

**Change — add matching `id` + `htmlFor` to each field:**

```jsx
// BEFORE
<label className="text-sm font-bold text-[#003b72] uppercase tracking-wide">Full Name</label>
<input name="name" type="text" required ... />

// AFTER
<label htmlFor="home-form-name" className="text-sm font-bold text-[#003b72] uppercase tracking-wide">Full Name</label>
<input id="home-form-name" name="name" type="text" required ... />
```

Apply the same pattern to:

| Field | `id` value |
|---|---|
| Full Name | `home-form-name` |
| Organization | `home-form-organization` |
| Work Email | `home-form-email` |
| Message / Requirements | `home-form-message` |

---

## Fix 2 — Add live regions for form status messages (CRITICAL, WCAG 3.3.1 / 4.1.3)

**File:** `src/app/components/HomeContactForm.js`

**Problem:** Error message renders silently for screen readers; success-state swap is not announced.

**Change 2a — error message:**

```jsx
// BEFORE
{status === "error" && (
  <p className="text-sm text-red-600">Something went wrong. Please try again or email us directly.</p>
)}

// AFTER
{status === "error" && (
  <p role="alert" aria-live="assertive" className="text-sm text-red-600">
    Something went wrong. Please try again or email us directly.
  </p>
)}
```

**Change 2b — success block:** Wrap the success-state `<div>` with a status role and move focus to it on mount.

```jsx
// Add near the top of the component:
import { useRef, useEffect } from "react";

const successHeadingRef = useRef(null);

useEffect(() => {
  if (status === "success" && successHeadingRef.current) {
    successHeadingRef.current.focus();
  }
}, [status]);

// BEFORE
if (status === "success") {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="w-14 h-14 rounded-full ...">...</div>
      <h3 className="font-bold text-xl text-[#003b72]">Request Received!</h3>
      ...
    </div>
  );
}

// AFTER
if (status === "success") {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <div className="w-14 h-14 rounded-full ...">...</div>
      <h3
        ref={successHeadingRef}
        tabIndex={-1}
        className="font-bold text-xl text-[#003b72] outline-none"
      >
        Request Received!
      </h3>
      ...
    </div>
  );
}
```

**Change 2c — submit button loading state:** Add `aria-busy` so AT announces the pending state.

```jsx
<button
  type="submit"
  disabled={status === "loading"}
  aria-busy={status === "loading"}
  className="..."
>
  {status === "loading" ? "Sending…" : "Submit Request"}
</button>
```

---

## Fix 3 — Raise contrast on subtle text tokens (CRITICAL, WCAG 1.4.3)

**File:** `src/app/globals.css`

**Problem:** Three token values fail 4.5:1 contrast minimum on white:
- `--color-text-subtle: #909AAB` → **2.83:1** ❌
- `text-slate-400` (#94A3B8 Tailwind default) used in press-release metadata → **2.57:1** ❌
- Form placeholders using `text-slate-400` → **2.57:1** ❌

**Change 3a — darken `--color-text-subtle` token in `globals.css`:**

```css
/* BEFORE */
--color-text-subtle: #909aab;   /* placeholders, timestamps */

/* AFTER — 4.61:1 on white */
--color-text-subtle: #6B7280;   /* placeholders, timestamps — WCAG AA */
```

**Change 3b — replace `text-slate-400` with `text-slate-600` in press-release card:**

**File:** `src/app/page.js`

Search for `text-slate-400` in the press-release card block (line near `{readingTime(item.content)} min read`). Replace:

```jsx
// BEFORE
<p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">

// AFTER
<p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
```

Also replace in the footer bottom bar:

**File:** `src/app/components/layout/Footer.js`

```jsx
// BEFORE — Privacy Policy / Terms / Sitemap links
className="text-slate-400 hover:text-[#00529b] ..."

// AFTER
className="text-slate-600 hover:text-[#00529b] ..."
```

**Change 3c — fix form placeholder contrast:**

**File:** `src/app/components/HomeContactForm.js`

Replace `placeholder:text-slate-400` with `placeholder:text-slate-500` on all 4 inputs:

```jsx
// BEFORE
className="... placeholder:text-slate-400 ..."

// AFTER
className="... placeholder:text-slate-500 ..."
```

(Tailwind's `slate-500` = `#64748B` → 4.77:1 on white, passes WCAG AA.)

---

## Fix 4 — Add skip-to-main-content link (MAJOR, WCAG 2.4.1)

**Files:** `src/app/layout.js` and `src/app/globals.css`

**Problem:** Keyboard users must tab through ~15 header elements on every page load before reaching content.

**Change 4a — add utility classes to `globals.css`:**

```css
/* Append to @layer base or to the end of the file */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only.focus\:not-sr-only:focus {
  position: absolute;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

**Change 4b — modify `src/app/layout.js` to add skip link + id on `<main>`:**

Open `src/app/layout.js`. Inside the `<body>` (or wherever the layout root is), add the skip link as the first focusable element and add `id="main-content"` to the main content wrapper:

```jsx
// Inside <body> before <Navbar />
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] bg-[#00529b] text-white px-4 py-2 rounded font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
>
  Skip to main content
</a>
<Navbar />
<main id="main-content" tabIndex={-1}>
  {children}
</main>
<Footer />
```

If the layout already has a `<main>` element, just add `id="main-content"` and `tabIndex={-1}` to it. If children render their own layout chrome, ensure `id="main-content"` lands on the page's actual content container.

---

## Fix 5 — Focus trap + focus return for mobile menu (MAJOR, WCAG 2.1.2 / 2.4.3 / 4.1.2)

**File:** `src/app/components/Navbar.js`

**Problem:** When the mobile menu is open (`menuOpen === true`), keyboard focus can escape into the hidden background. No focus return to the trigger on close.

**Minimal fix — native approach without adding dependencies:**

```jsx
// Add near top of Navbar component
const mobileMenuRef = useRef(null);
const menuTriggerRef = useRef(null);

// Focus first link when menu opens; return focus to trigger on close
useEffect(() => {
  if (menuOpen && mobileMenuRef.current) {
    const firstLink = mobileMenuRef.current.querySelector("a, button");
    firstLink?.focus();
  } else if (!menuOpen && menuTriggerRef.current) {
    // Only restore focus if it was previously in the menu
    if (mobileMenuRef.current?.contains(document.activeElement)) {
      menuTriggerRef.current.focus();
    }
  }
}, [menuOpen]);

// Trap Tab within the mobile menu when open
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

// Close on Escape
useEffect(() => {
  if (!menuOpen) return;
  const handleEscape = (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  };
  document.addEventListener("keydown", handleEscape);
  return () => document.removeEventListener("keydown", handleEscape);
}, [menuOpen]);
```

**Attach the refs:**

```jsx
// Mobile hamburger button
<button
  ref={menuTriggerRef}
  type="button"
  className="..."
  aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
  aria-expanded={menuOpen}
  aria-controls="mobile-menu"
  onClick={() => setMenuOpen((v) => !v)}
>
  ...
</button>

// Mobile menu container
{menuOpen && (
  <div
    id="mobile-menu"
    ref={mobileMenuRef}
    role="dialog"
    aria-modal="true"
    aria-label="Navigation menu"
    className="md:hidden bg-surface-lowest px-4 pb-5"
  >
    ...
  </div>
)}
```

**Apply the same pattern** (focus trap, focus return, Escape key, `role="dialog"` + `aria-modal="true"`) to:
- `src/app/components/SearchModal.js`
- `src/app/components/quote/QuoteCartDrawer.js`
- `src/app/components/auth/AuthModal.js`

If refactoring all four by hand is too noisy, install `focus-trap-react`:

```bash
npm install focus-trap-react
```

Then wrap each modal/drawer:

```jsx
import FocusTrap from "focus-trap-react";

<FocusTrap active={menuOpen} focusTrapOptions={{ escapeDeactivates: false, returnFocusOnDeactivate: true }}>
  <div role="dialog" aria-modal="true" aria-label="Navigation menu">
    ...
  </div>
</FocusTrap>
```

---

## Fix 6 — Raise touch target sizes to 44×44 px (MAJOR, WCAG 2.5.8 WCAG 2.2 AA / mobile UX)

**File:** `src/app/components/Navbar.js`

**Problem:** Mobile action buttons at `w-9 h-9` (36×36 px) and desktop cart/auth at `w-10 h-10` (40×40 px) are below the 44×44 recommended target size.

**Change — replace sizing classes:**

| Target | Find | Replace with |
|---|---|---|
| Mobile cart button | `w-9 h-9 rounded bg-surface-low` | `w-11 h-11 rounded bg-surface-low` |
| Mobile auth button | `w-9 h-9 rounded bg-surface-low` | (same element — already covered above) |
| Mobile search button | `w-9 h-9 rounded bg-surface-low` | `w-11 h-11 rounded bg-surface-low` |
| Mobile hamburger | `w-9 h-9 rounded text-gray-700` | `w-11 h-11 rounded text-gray-700` |
| Desktop cart button | `w-10 h-10 rounded border border-border` | `w-11 h-11 rounded border border-border` |
| Sign-In button | `h-10 rounded border` | `h-11 rounded border` |
| Account dropdown trigger | `h-10 rounded border` | `h-11 rounded border` |
| Utility bar anchor links (phone/WhatsApp/email) | no min-height | add `min-h-11 py-2` |

**Also file:** `src/app/globals.css` — check `.btn-primary` and `.btn-outline` classes. If their padding produces < 44px total height, bump `padding` from `0.75rem 1.75rem` to `0.875rem 1.75rem`.

---

## Fix 7 — Fix WhatsApp auto-bubble timing (MAJOR, WCAG 2.2.1 / 2.2.2)

**File:** `src/app/components/layout/WhatsAppButton.js`

**Problem:** Bubble auto-shows at 3s and auto-hides at 8s — user cannot pause/extend. Violates 2.2.1 (Timing Adjustable) since the window is less than 20 seconds.

**Change — remove auto-hide; keep manual dismiss:**

```jsx
// BEFORE
useEffect(() => {
  const show = setTimeout(() => setVisible(true), 3000);
  const hide = setTimeout(() => setVisible(false), 8000);
  return () => { clearTimeout(show); clearTimeout(hide); };
}, []);

// AFTER — show after 3s, stays until user dismisses or clicks the button
useEffect(() => {
  const show = setTimeout(() => setVisible(true), 3000);
  return () => clearTimeout(show);
}, []);
```

The existing dismiss button already satisfies 2.2.2 (Pause, Stop, Hide).

---

## Fix 8 — Fix products dropdown aria-haspopup value (MINOR, WCAG 4.1.2)

**File:** `src/app/components/Navbar.js`

**Problem:** `aria-haspopup="true"` is deprecated; should declare the popup type. The dropdown is structured as a navigable list, closest to a `menu`.

**Change:**

```jsx
// BEFORE
<button
  type="button"
  aria-haspopup="true"
  aria-expanded={dropdownOpen}
  aria-controls="products-dropdown"
  ...
>

// AFTER
<button
  type="button"
  aria-haspopup="menu"
  aria-expanded={dropdownOpen}
  aria-controls="products-dropdown"
  ...
>
```

**Also update the dropdown itself** in the `ProductsDropdown` component — change `role="region"` to `role="menu"` and add `role="menuitem"` to each `<Link>`:

```jsx
// BEFORE
<div id="products-dropdown" role="region" aria-label="Product categories" ...>
  <ul role="list" className="py-1.5">
    {CATEGORIES.map(({ href, label, desc, image }) => (
      <li key={href}>
        <Link href={href} onClick={onClose} className="...">

// AFTER
<div id="products-dropdown" role="menu" aria-label="Product categories" ...>
  <ul role="none" className="py-1.5">
    {CATEGORIES.map(({ href, label, desc, image }) => (
      <li role="none" key={href}>
        <Link href={href} role="menuitem" onClick={onClose} className="...">
```

**Optional — add arrow-key navigation** inside the dropdown. If scope allows, use `useEffect` with `keydown` listener to cycle focus through `menuitem` elements with ArrowDown / ArrowUp / Home / End. This is not required for WCAG AA compliance but matches the ARIA Authoring Practices Guide for menu pattern.

---

## Fix 9 — Associate newsletter form label with input (MINOR, WCAG 1.3.1 / 3.3.2)

**File:** `src/app/components/forms/NewsletterForm.js`

**Problem:** Visible "Newsletter" text is a `<p>`, not a `<label>`. Input relies on `aria-label` only.

**Change:**

```jsx
// BEFORE
<p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-2">
  Newsletter
</p>
<form onSubmit={(e) => e.preventDefault()} className="flex gap-2" aria-label="Newsletter signup">
  <input
    type="email"
    required
    placeholder="Your email address"
    aria-label="Email address for newsletter"
    className="..."
  />

// AFTER
<label
  htmlFor="newsletter-email"
  className="block text-xs text-gray-500 uppercase tracking-wide font-bold mb-2"
>
  Newsletter
</label>
<form onSubmit={(e) => e.preventDefault()} className="flex gap-2" aria-label="Newsletter signup">
  <input
    id="newsletter-email"
    type="email"
    required
    placeholder="Your email address"
    className="..."
  />
```

(Remove the redundant `aria-label` on the input since the `<label>` now provides the accessible name.)

---

## Fix 10 — Standardize CTA wording for "quote" action (MINOR, WCAG 3.2.4)

Consistency fix. Choose one verb per action type across the site:

| Action type | Standard label |
|---|---|
| Top-level conversion CTA | **Get a Quote** |
| Add one product to cart | **Add to Quote** |
| Submit the quote form | **Submit Quote Request** |

**Files affected:**
- `src/app/page.js` — hero CTA: change `"Request a Quote"` → `"Get a Quote"`
- `src/app/components/HomeContactForm.js` — submit button: change `"Submit Request"` → `"Submit Quote Request"`
- `src/app/components/ProductBrowser.js` and `src/app/components/HomepageProductBrowser.js` — product card buttons: ensure all say `"Add to Quote"` (some currently say `"+ Quote"` or `"+"`)

---

## Fix 11 — Cleanup: remove `dangerouslySetInnerHTML` for `&amp;` (MINOR, code hygiene)

**File:** `src/app/page.js`

**Problem:** Lead Capture bullets use `dangerouslySetInnerHTML` to render an HTML-entity encoded ampersand unnecessarily.

**Change:**

```jsx
// BEFORE
{[
  "Custom surgical sets tailored to your needs.",
  "Global door-to-door delivery.",
  "Bulk pricing for hospitals &amp; distributors.",
].map((item) => (
  <li key={item} className="flex items-center gap-4">
    ...
    <span dangerouslySetInnerHTML={{ __html: item }} />
  </li>
))}

// AFTER
{[
  "Custom surgical sets tailored to your needs.",
  "Global door-to-door delivery.",
  "Bulk pricing for hospitals & distributors.",
].map((item) => (
  <li key={item} className="flex items-center gap-4">
    ...
    <span>{item}</span>
  </li>
))}
```

---

## Verification Checklist

After all fixes are applied, run the following checks:

### Automated
- [ ] `npm run lint` — no new ESLint errors
- [ ] `npm run build` — build succeeds
- [ ] Open DevTools → Lighthouse → Accessibility audit → score should be ≥ 95

### Manual — keyboard only
- [ ] Load homepage, press Tab once → "Skip to main content" link visible and focused
- [ ] Press Enter on skip link → focus moves past header to main content
- [ ] Tab through header → visible focus ring on every element, no dead stops
- [ ] Open mobile menu (resize window < 768px) → focus moves into menu
- [ ] Tab to last menu item, press Tab again → focus wraps to first item (trap works)
- [ ] Press Escape → menu closes AND focus returns to hamburger button
- [ ] Open Products dropdown with Enter key → dropdown appears
- [ ] Press Escape → dropdown closes AND focus returns to trigger
- [ ] Submit quote form with empty required field → browser validation fires, field gets focus
- [ ] Submit form with valid data (or mock error) → error announced by VoiceOver/NVDA
- [ ] On success → "Request Received!" heading announced + focused

### Screen reader (macOS VoiceOver / Windows NVDA)
- [ ] Tab to "Full Name" input → VoiceOver says `"Full Name, edit text, required"`
- [ ] Tab to all form fields → each announces its label
- [ ] Products dropdown trigger → announces `"Products, menu, collapsed, button"`
- [ ] Active nav link → announces `"current page"`
- [ ] Submit error → immediately announces error message
- [ ] Submit success → announces `"Request Received"`

### Contrast
- [ ] Use browser extension (axe DevTools or WebAIM WAVE) → no contrast errors on home page
- [ ] Press-release metadata visible and readable
- [ ] Footer copyright/privacy links visible and readable

### Touch targets (mobile)
- [ ] Open DevTools → Device toolbar → iPhone SE
- [ ] All header icon buttons ≥ 44×44 px (inspect element, check computed height)
- [ ] No overlapping tap targets

---

## Files Touched (summary)

| File | Fixes | Lines changed (est.) |
|---|---|---|
| `src/app/components/HomeContactForm.js` | 1, 2, 3c, 10 | ~40 |
| `src/app/globals.css` | 3a, 4a | ~25 |
| `src/app/page.js` | 3b, 10, 11 | ~15 |
| `src/app/components/layout/Footer.js` | 3b | ~3 |
| `src/app/layout.js` | 4b | ~10 |
| `src/app/components/Navbar.js` | 5, 6, 8 | ~60 |
| `src/app/components/layout/WhatsAppButton.js` | 7 | ~4 |
| `src/app/components/forms/NewsletterForm.js` | 9 | ~6 |
| `src/app/components/SearchModal.js` | 5 | ~30 |
| `src/app/components/quote/QuoteCartDrawer.js` | 5 | ~30 |
| `src/app/components/auth/AuthModal.js` | 5 | ~30 |

**Total:** ~250 lines across 11 files.

---

## Out-of-scope / follow-up

The following require broader work and are intentionally excluded from this brief:

1. Replace low-resolution product imagery (design/content task, not code)
2. Restructure home page IA to move full filtered product grid to `/products` (design decision)
3. Add `searchFallback` for mobile arrow-key menu navigation (AAA, not required)
4. Audit additional pages: `/products`, `/products/[slug]`, `/contact`, `/about`, `/certifications`

---

## Rollout Order (recommended)

Execute in this sequence to minimize merge conflicts:

1. Fixes 1 + 2 + 3c + 10 (HomeContactForm) — single file, single commit
2. Fix 3a (globals.css token) + 3b (page.js + Footer.js) — contrast sweep
3. Fix 4 (skip link in layout + globals)
4. Fix 11 (page.js cleanup)
5. Fixes 5 + 6 + 8 (Navbar.js)
6. Fix 7 (WhatsApp timing)
7. Fix 9 (NewsletterForm)
8. Replicate Fix 5 pattern across SearchModal / QuoteCartDrawer / AuthModal

Commit each numbered group separately with message: `a11y: <fix number/description>`.

# Design System Specification: Clinical Precision & Editorial Excellence

## 1. Overview & Creative North Star

### The Creative North Star: "The Clinical Curator"

This design system rejects the cluttered, utility-first aesthetic of legacy healthcare software. Instead, it adopts the persona of **The Clinical Curator**—a high-end editorial approach to medical data. By blending the precision of surgical instruments with the sophisticated layout of a premium scientific journal, we establish B2B reliability through "intentional emptiness" (whitespace) and authoritative typography.

The system breaks the "standard template" look by utilizing **asymmetric sectioning** and **tonal layering**. We do not use borders to define space; we use light and shadow to define importance. The result is a digital environment that feels sterile yet inviting, technical yet human.

---

## 2. Colors & Surface Philosophy

The palette is rooted in medical heritage but elevated through Material Design 3 logic to ensure depth and accessibility.

- **Primary Trust Blue (`#003b72` / `#00529b`):** The foundation of authority. Use the `primary_container` for high-impact brand moments.
- **Secondary Sterile Teal (`#006a63`):** Evokes the surgical environment. Reserved for success states, precision tools, and specialized CTAs.
- **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Structural boundaries must be defined solely through background shifts. For example, a `surface_container_low` section sitting against a `surface` background creates a clear but sophisticated division.
- **The "Glass & Gradient" Rule:** To avoid a flat, "budget" feel, use Glassmorphism for floating navigation or overlays. Utilize a `backdrop-blur` of 12px–20px with a semi-transparent `surface_container_lowest` (80% opacity).
- **Signature Textures:** For Hero sections or primary CTAs, apply a subtle linear gradient from `primary` to `primary_container` at a 135-degree angle to provide "visual soul."

---

## 3. Typography

We use a dual-font strategy to balance high-end editorial character with clinical legibility.

- **Display & Headlines (Manrope):** A modern geometric sans-serif with subtle flair. Used for high-level messaging to convey "Innovation."
  - `display-lg`: 3.5rem (The "Hero" statement)
  - `headline-md`: 1.75rem (Section entry points)
- **Body & UI (Inter):** The workhorse of precision. Inter’s tall x-height ensures readability of complex medical data.
  - `body-lg`: 1rem (16px) - The absolute minimum for body copy to ensure B2B accessibility.
  - `label-md`: 0.75rem - Used for metadata and technical specs.

**Editorial Tip:** Use extreme contrast in the type scale. Pair a `display-sm` headline with `label-md` uppercase tracking (0.05em) to create an "Architectural" layout feel.

---

## 4. Elevation & Depth

In this system, depth is a functional tool, not a decoration. We use **Tonal Layering** to convey hierarchy.

- **The Layering Principle:** Stack surfaces to create focus.
  - _Level 0:_ `surface` (The canvas)
  - _Level 1:_ `surface_container_low` (Content groupings)
  - _Level 2:_ `surface_container_lowest` (Interactive cards/modals)
- **Ambient Shadows:** For floating elements, use a "Medical Glow." Instead of grey, use a tinted shadow: `rgba(0, 59, 114, 0.06)` with a 32px blur and 16px Y-offset.
- **The "Ghost Border" Fallback:** If a container requires a boundary (e.g., in high-density data grids), use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components & Interaction Patterns

### Buttons: The "Surgical Tool" Style

- **Primary:** Solid `primary` color, `DEFAULT` (4px) radius. No gradient, unless used in a Hero.
- **Secondary:** `surface_container_highest` background with `on_surface` text. This feels integrated rather than "pasted on."
- **Interaction:** On hover, shift background to `primary_container`. Transitions must be a crisp `200ms cubic-bezier(0.4, 0, 0.2, 1)`.

### Cards & Lists: The "No-Divider" Rule

- **Cards:** Forbid 1px borders. Use `surface_container_low` and padding `8` (2.75rem) to create separation.
- **Lists:** Never use horizontal divider lines. Separate list items using vertical whitespace `3` (1rem) and a subtle `surface_variant` hover state.

### Input Fields: Precision Inputs

- **State:** Use `none` (0px) or `sm` (2px) rounding for inputs to emphasize "sharpness."
- **Focus:** A 2px `secondary` (Teal) bottom-border only. Avoid the "boxed-in" look for a more open, modern feel.

### Specialized Component: The "Data Glass"

- A specific container for real-time surgical metrics. Uses `surface_bright` at 60% opacity, `backdrop-blur: 16px`, and a `sm` (0.125rem) `outline_variant` border at 10% opacity.

---

## 6. Do’s and Don’ts

### Do:

- **DO** use asymmetric padding. A wider left margin (e.g., `20` or `24` scale) creates a high-end editorial "magazine" feel.
- **DO** use `secondary_container` (Teal) sparingly to highlight key clinical data points or "Live" statuses.
- **DO** embrace the `16` (5.5rem) spacing token between major sections to let the design breathe.

### Don’t:

- **DON’T** use pure black `#000000`. Use `on_surface` (`#191c1d`) for all text to maintain a professional, soft-contrast look.
- **DON’T** use heavy drop shadows. If an element looks like it’s "falling" off the page, the shadow is too dark.
- **DON’T** use rounded corners larger than `0.5rem (lg)`. We are aiming for "Precision," and overly round corners feel "Consumer/Playful."

---

## 7. Spacing & Grid Logic

We utilize a **baseline 0.35rem (1) increment** system.

- **Standard Padding:** `5` (1.7rem) for internal components.
- **Section Gaps:** `12` (4rem) to `16` (5.5rem).
- **The "Intention Gap":** Use a `20` (7rem) gap to separate global navigation from the "Hero" content to establish an immediate sense of premium scale.

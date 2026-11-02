# Executed verification — 2 November 2026

Environment: Windows, Node 22.14.0, installed Microsoft Edge via Playwright. Temporary databases contained synthetic enquiries only. No email was sent and no production site was modified.

## Results
- `npm test`: **11 passing integration/security tests**. Core pages and unique metadata; catalogue search/filter/empty results; HTML escaping; sitemap/robots/redirects/security headers; CSRF; inline validation; accepted request persistence; repeated payload/idempotency; unknown/duplicate/malformed/negative/fractional quote entries; honeypot; origin rejection; body size; unavailable storage; process-restart persistence; burst rate limiting.
- `npm run check`: JavaScript syntax checks pass. There is no bundler/build step; EJS templates are rendered by the route tests. This is not a claim of an ESLint run.
- `npm run test:browser`: **45 responsive page checks** across nine routes at **320, 375, 768, 1024 and 1440px**, without horizontal overflow.
- **18 axe scans**: nine routes at both 375 and 1440px, WCAG 2 A/AA and supported WCAG 2.1/2.2 AA rules, **zero detected violations**.
- Browser journeys: mobile menu/Escape; search by reference; category empty state; type filter; add and persist quote list; edit quantity; remove a selected instrument; inline form errors; progressive OEM fields; successful RFQ stored with correct quantity; reference display; cleared list; successful server-rendered enquiry with JavaScript disabled.
- **29 unique internal links** checked, including source PDFs, products and enquiry paths; no broken links. Loaded catalogue images checked for failures. No page JavaScript errors or unexpected browser console errors in the tested flows.
- `npm audit --omit=dev`: **0 known vulnerabilities** at verification time.
- Independent code review: corrected incomplete breadcrumb microdata and increased enquiry references to 96 random bits; documented single-worker email delivery and provided a private CLI for stored-request review.
- Local preview at http://localhost:3000 returns HTTP 200. CLI list command works against the preview database.

## Visual inspection
Screenshots are saved in `test-results/`: home, catalogue, product detail and RFQ at 375 and 1440px. Desktop/home, mobile/home, desktop/catalogue and mobile/RFQ screenshots were inspected. Fixed mobile product-image height expansion, mobile line-break spacing, instrument crop fragments and missing whitespace. Original catalogue pages and an asset contact sheet are also saved there for provenance review.

## Bugs found and corrected during checks
- Initial count assertion did not account for semantic HTML around the count; adjusted the assertion to the rendered markup.
- Helmet's default no-referrer policy caused native browser form posts to send Origin:null. Set strict-origin-when-cross-origin, retaining signed CSRF and same-origin checks; JavaScript-disabled RFQ now succeeds.
- Old dependency major versions had known advisories. Upgraded EJS and Nodemailer, then reran tests and the audit.
- Confirmed the existing site uses `/distributor` and `?cat=` category links; included regression tests and corresponding redirects.

## Limits, not claimed as tested
No real SMTP delivery, production hosting, load testing, backup recovery, field Core Web Vitals, Safari/Firefox behavior, assistive-technology user testing, complete manual WCAG audit or real regulatory-document verification. Automated axe results are useful evidence, not a WCAG conformance certification. Original PDF accessibility and claims remain business review items. Attachments are not enabled, so no upload-security claims are made.

The SMTP queue is at-least-once and single-worker. Email configuration and production acceptance checks remain required. Core Web Vitals remain the brief's field targets, not measured guarantees.

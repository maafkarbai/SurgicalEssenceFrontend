# Surgical Essence redesign — 2 November 2026

## Audit and design
The initial directory contains only public assets: five PDF catalogues, logo variants, banners, misleadingly named product crops and certification graphics. No source, package manifest, deployment configuration, routes, working functionality or tests exist to retain. A Next.js reference in the asset README is not an application. Node 22 is available, PHP is not. Retain every original asset and use the supplied SVG logo instead of the PNG named in the pasted brief.

Build server-rendered Express/EJS with small browser JavaScript and SQLite persistence, avoiding a frontend framework. Compared with React/Vite this yields directly indexable pages without a second rendering layer; PHP would suit basic cPanel but is neither present nor testable here. Node-capable hosting is required. This is an implementation choice, not an assertion about existing hosting.

Visual direction: #0068B7 action blue, #171D24 graphite, #F5F7F9 off-white, #65717D steel, white. System sans-serif with a locally hosted professional font if available, 1240px content, 4/8/12/16/24/32/48/64/96 spacing, restrained 2px corners, borders rather than shadows. A compact split hero uses supplied catalogue imagery; product-led content, category rows and technical tables carry the design. No generated product or facility photos, badges, testimonials or invented capabilities.

Architecture: Home → Products → product detail → Quote list → RFQ; OEM → RFQ with OEM intent; Quality → documentation enquiry. Also About, Privacy, sitemap, robots, explicit 404. The quote list is browser-local, with quantities validated again server-side. RFQ is account-free, progressively enhanced, accessible and works without JS for manually entered requirements.

## Content provenance
Source: supplied public/documents/surgical.pdf. PDF page 5 (printed page 3): No. 4, 4L, 8, 9 handles and references/dimensions. PDF page 18 (printed page 17): four Grazil scissor patterns at 13cm. Illustrations are cropped from exactly these pages, labelled catalogue illustrations. No material, sterility or regulatory facts inferred. Eight records represent a selected online range, not total business inventory.
The PDF company page contains conflicting founding years (1986/1995) and unsupported certification claims. Omit these. Existing website contact: info@surgicalessence.com, +92 303 602 9756, Industrial Estate, Sialkot. Existing OEM text mentions laser marking/private labelling; phrase as requirements to discuss, with feasibility and quantities to confirm. Document links are historic supplied catalogues, not compliance certificates.

## Research (accessed 2 November 2026)
- https://we.inc/blog/on-page-seo-checklist — map intent to useful pages, use unique metadata and genuine visible evidence; numeric headline recommendations are heuristics, not guaranteed Google limits.
- https://we.inc/blog/ai-slop-websites — avoid interchangeable copy, unverifiable statistics and scaled thin pages.
- https://www.klsmartin.com/shop/en/products/instruments-and-accessories/1/ — categories, disciplines and direct catalogue navigation. Main homepage fetch timed out; catalogue was accessible.
- https://www.sklarcorp.com/distributor-resources — distributor support and documentation. Main homepage fetch timed out; resources page accessible.
- https://www.aesculapusa.com/en.html — separates professional and patient paths, exposes IFU access.
- https://www.cardicinstruments.com/ — specialty navigation and catalogue/contact access.
- https://surgicalessence.com — existing categories and contact details; visible empty catalogue count and broad unsubstantiated compliance badges. Text/structure inspected; no claims about measured competitor responsive behavior or performance.

Keyword intent map (qualitative, no search-volume claims): wholesale surgical instruments → home/products; category and reference terms → products/detail; OEM/private-label → OEM; exporter/Pakistan supplier → about; quality documentation → quality. Do not target manufacturer claims until confirmed.

## Execution plan
1. Write failing integration tests for HTML routes, filters, metadata, validation, CSRF, durable acceptance, duplicate requests and failures.
2. Build data model and extract reference-linked product illustrations; optimize supplied assets.
3. Build shared shell, homepage, catalogue and technical detail templates.
4. Build OEM, quality, about, quote review and progressively enhanced RFQ.
5. Add SQLite acceptance, signed CSRF cookie, request bounds, honeypot, per-IP throttling, idempotency and optional SMTP outbox alerts.
6. Add SEO, redirects for observed legacy routes, privacy disclosure and secure response headers.
7. Execute server tests, browser journeys, axe and screenshots at 320/375/768/1024/1440px. Refine and document actual results and launch requirements.

Proceeding without intermediate concept approval follows the user's explicit direction to present findings briefly then implement. No generated image concept is needed to override the detailed supplied visual direction or misrepresent the supplied instrument imagery.

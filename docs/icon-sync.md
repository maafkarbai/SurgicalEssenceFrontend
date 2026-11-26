# Custom icon integration — 26 November 2026

The approved [Figma set](https://www.figma.com/design/ifwHZvsxlWSsmLhMyWYGND?node-id=2-115) is now used by the existing website. Original 24px SVG artwork is in `assets/icons/`. The generated sprite is `public/icons/se-icons.svg` (24 symbols, 6,718 bytes). It uses currentColor so the same artwork remains legible on blue buttons, white pages and the light footer.

Run `npm run icons:build` after changing the original assets. The build also regenerates `views/partials/icon.ejs` and `icon-sprite.ejs`. A content hash in the URL invalidates the previous sprite cache. Templates use standard EJS includes and require no new backend runtime or frontend dependency.

## Changes verified

| Surface | Behavior |
| --- | --- |
| Main navigation and utility links | Custom instrument, OEM, documentation, contact, account, email and quotation icons; existing labels retained. |
| Homepage and catalogue | Five instrument categories, related catalogue navigation, search/filter controls and downloadable PDF links. Catalogue images remain product illustrations. |
| Product cards and details | Reference, view-details and quote-list artwork. Client updates preserve the icon after adding an instrument or reloading the page. |
| OEM, distributor and contact pages | Symbols support the existing sourcing, distribution and contact actions. |
| RFQ and success | Quotation and confirmation artwork works both with browser enhancement and server-rendered forms. |
| Footer | Shared account, news, catalogue, distribution and business contact links inherit the footer colour. The subsequent light-only theme update uses dark icons and the original colour logo on a pale surface. |

Icons are decorative (`aria-hidden`, non-focusable); links and buttons retain descriptive text or existing accessible names. No icon font, external icon CDN, patient/clinical symbol claims or new upload capability was introduced. Unknown category names use the neutral catalogue symbol.

## QA

- `npm test`: 129 passed, zero failures.
- `npm run check`: syntax checks passed.
- `npm run test:browser`: 45 responsive checks across 320/375/768/1024/1440px, 18 axe checks, four buyer journeys, 35 internal links; zero reported accessibility violations or browser errors. Added-state icon survival after reload explicitly checked.
- Browser plugin not available; repository Playwright and installed Microsoft Edge used against isolated synthetic test data at `http://127.0.0.1:3101`.
- Page identity, meaningful content, rendering/console health, screenshots and real menu/search/quote/RFQ interactions verified. The catalogue selected-label contrast inherited from the old generic span rule was corrected.
- Independent review found no material issues with escaping, icon allowlists, same-origin CSP, decorative accessibility or client update behavior.
- The existing local preview at `http://localhost:3000` was checked separately: homepage 200 with custom icon markup, sprite 200 with 24 symbols. The integration works through updated templates without restarting its process. Automatic approval review had rejected stopping/restarting that process (`blocked by policy`); no process was stopped.

Screenshot/report evidence is in `test-results/home-375.png`, `test-results/home-1440.png`, `test-results/products-375.png`, `test-results/products-1440.png` and `test-results/browser-report.json`. The original files are backed up in `tmp/icon-sync-baseline/`.

Changes are installed locally. No production deployment or external account update was performed. Existing business records, publication rules and enquiry behavior were not changed.

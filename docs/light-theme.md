# Light-only theme — 26 November 2026

Public pages, buyer accounts, newsletter forms and the administrator area now use a light-only theme. CSS declares `color-scheme:light` and document heads declare the light browser colour scheme. Browser chrome uses a white theme colour. There is no automatic device-dark theme or theme switch.

The footer and quality band use pale backgrounds with dark text; the full-blue quotation banner is now pale blue with an ordinary blue button. The footer uses the colour logo intended for light surfaces. The admin sidebar, navigation hover and logout control also use light surfaces. Source colours were changed directly rather than adding a separate override theme.

Validation: 129 server tests passed; syntax checks passed. Existing browser suite passed 45 responsive checks at five widths, 18 WCAG axe checks and four buyer journeys. An additional isolated Playwright/Edge run emulated a dark device preference and checked 11 public/account/newsletter/admin page states at 375px and 1440px: computed colour scheme stayed light, backgrounds remained light, light/dark preference backgrounds matched, no horizontal overflow, no console errors and 11 theme-specific colour-contrast checks passed. Other account-page accessibility rules were outside this theme-only supplemental check; the general public browser suite was retained.

Screenshots: `C:\Users\local user\Documents\Codex Previews\surgical-essence-light-footer.png` and `surgical-essence-light-admin.png`. Temporary report: `tmp/light-theme-report.json`. Browser plugin not available; installed Playwright and Edge used. All test records were synthetic and temporary. The existing local preview also serves the updated light footer/logo and browser theme metadata.

No production deployment was performed. Source baselines are in `tmp/light-theme-baseline/`.

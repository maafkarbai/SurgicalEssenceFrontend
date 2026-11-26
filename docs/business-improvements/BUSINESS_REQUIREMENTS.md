# Business requirements and gap analysis — 25 November 2026

Statuses describe inspected local implementation, not live production assurance. COMPLETE is scoped to the named capability. BLOCKED BY BUSINESS INFORMATION means supporting evidence/approval is absent, even where safe enquiry infrastructure exists. No requirement was classified NOT APPLICABLE: none has been ruled out by the business.

Evidence: existing design/CMS/import/bulk-publishing documentation, `src/`, `views/`, `tests/`, read-only SQLite counts and `output/catalog-bulk-import/README.md`. Existing published state does not establish product verification.

Benchmark inspected: [Aesculap surgical instruments](https://surgical-instruments.bbraun.com/en-01), 25 November 2026. Observable capabilities include search, separate category/discipline navigation, catalogues and a regional-availability notice. These support a discoverability/qualification benchmark; no branding, images or proprietary content were copied.

## P0 — Business credibility

| Requirement | Status | Evidence / remaining gap |
| --- | --- | --- |
| Consistent legal company information | BLOCKED BY BUSINESS INFORMATION | Trading name/contact retained; legal entity and registration evidence absent. |
| Verified regulatory and certification claims | BLOCKED BY BUSINESS INFORMATION | No badges claimed; current entity/scope/issuer/expiry evidence absent. |
| Removal of unsupported historical claims | PARTIALLY IMPLEMENTED | Web copy omits founding/export claims; original PDFs still need review. |
| Centralised business information | COMPLETE | BI-P0-001: shared profile consumed by contact copy, metadata and errors. |
| Correct handling of expired certificates | PARTIALLY IMPLEMENTED | Certificates withheld, but no expiry-aware document lifecycle. |
| Consistent quality information across all pages | PARTIALLY IMPLEMENTED | Cautious public copy; source PDFs require claim reconciliation. |
| Correct redirects for obsolete pages | PARTIALLY IMPLEMENTED | Known legacy routes and CMS slugs redirect; complete historical inventory absent. |
| Valid sitemap and canonical URLs | COMPLETE | Dynamic published-product sitemap and canonical routes covered by existing tests. |
| Working enquiry submission and delivery | PARTIALLY IMPLEMENTED | Durable acceptance and cloud outbox worker tested locally; approved live SMTP/scheduler and staging delivery acceptance remain. |

## P1 — Commercial positioning

| Requirement | Status | Evidence / remaining gap |
| --- | --- | --- |
| Clear international B2B homepage positioning | COMPLETE | Distributor/importer/procurement messaging, catalogue and RFQ CTAs. |
| Dedicated wholesale customer journey | PARTIALLY IMPLEMENTED | Home → catalogue → quote list → RFQ exists; wholesale qualification/terms incomplete. |
| Dedicated OEM and private-label journey | PARTIALLY IMPLEMENTED | OEM route and RFQ fields exist; structured project qualification incomplete. |
| Dedicated distributor partnership journey | NOT IMPLEMENTED | Buyer-type option exists; legacy distributor URLs redirect to general/OEM enquiry. |
| Manufacturing capabilities page | BLOCKED BY BUSINESS INFORMATION | No verified ownership, processes or capacity evidence. |
| Authentic manufacturing photographs | BLOCKED BY BUSINESS INFORMATION | No verified facility photo set/permissions established. |
| Supplier qualification information | PARTIALLY IMPLEMENTED | Quality guidance and documentation enquiry; verified pack absent. |
| Business-specific calls to action | COMPLETE | Quote, OEM and documentation CTAs already work. |
| Verified commercial differentiators | BLOCKED BY BUSINESS INFORMATION | No supported capacity, lead-time, MOQ or export-count claims. |
| Procurement workflow explanation | COMPLETE | Homepage selection → requirements → confirmation process. |

## P2 — Digital product catalogue

| Requirement | Status | Evidence / remaining gap |
| --- | --- | --- |
| Existing PDF catalogue digitisation | PARTIALLY IMPLEMENTED | Five-PDF extraction plus repeatable provenance staging: 4,935 unreviewed draft candidates, 253 withheld rows; source review/publication remains pending. |
| Structured product database | COMPLETE | CMS SQLite/PostgreSQL repository, revisions, draft/archive/publication. |
| Product reference search | COMPLETE | Search/SKU aliases, importer and RFQ snapshots. |
| Product name search | COMPLETE | Derived searchable text and paginated results. |
| Product type navigation | COMPLETE | Public type filter from current catalogue. |
| Surgical specialty navigation | NOT IMPLEMENTED | Broad categories/types exist; no distinct discipline taxonomy. |
| Product family organisation | PARTIALLY IMPLEMENTED | Type/pattern fields; no full family hierarchy. |
| Product variants | PARTIALLY IMPLEMENTED | Variations/pattern/dimension fields; no complete verified family/variant grouping. |
| Accurate product photographs | PARTIALLY IMPLEMENTED | Source-linked seed illustrations and galleries; imported image matching needs review. |
| Verified technical specifications | PARTIALLY IMPLEMENTED | BI-P0-002 now gates manual/import/bulk publishing; all 257 existing records still require owner evidence review. |
| Individual SEO-friendly product pages | COMPLETE | Current slug, redirects, metadata and Product microdata. |
| Related products | NOT IMPLEMENTED | No related-product selection/rendering in current detail template. |
| Downloadable technical documentation where available | PARTIALLY IMPLEMENTED | Source catalogue/page links; product-specific IFU/specification documents absent. |
| Instrument set organisation | NOT IMPLEMENTED | No set entities/composition model. |

## P3 — Procurement functionality

| Requirement | Status | Evidence / remaining gap |
| --- | --- | --- |
| Existing quotation list improvements | PARTIALLY IMPLEMENTED | Add/remove/persist and RFQ transfer work; bulk intake still absent. |
| Quantity management | COMPLETE | Browser quantities revalidated and snapshotted server-side. |
| Bulk RFQ functionality | PARTIALLY IMPLEMENTED | Multi-item list and manual requirements; no buyer file intake. |
| Excel and CSV requirement uploads | NOT IMPLEMENTED | Admin catalogue CSV import is separate; no buyer CSV/XLSX intake. |
| Secure PDF attachment support | NOT IMPLEMENTED | Public attachments deliberately disabled; admin image upload is not PDF support. |
| Structured quotation request template | NOT IMPLEMENTED | Structured web form exists; no downloadable buyer requirements template. |
| Uploaded data validation and preview | NOT IMPLEMENTED | No buyer upload preview; existing admin importer must remain private. |
| Sample request functionality | PARTIALLY IMPLEMENTED | Free-text sample enquiries only. |
| Documentation requests | COMPLETE | Documentation CTA/prefilled RFQ and durable storage. |
| Factory audit enquiries | PARTIALLY IMPLEMENTED | General message can ask; no structured audit enquiry/process. |
| Appropriate submission confirmations | COMPLETE | Honest stored-request success, failure and duplicate states. |
| Internal enquiry reference numbers | COMPLETE | Random SE references stored and displayed. |

## P4 — Distributor and OEM acquisition

| Requirement | Status | Evidence / remaining gap |
| --- | --- | --- |
| Distributor qualification form | NOT IMPLEMENTED | General Distributor buyer type is not a qualification questionnaire. |
| OEM project enquiry form | PARTIALLY IMPLEMENTED | OEM field/intent; no structured project scope and qualification. |
| Country and territory information | PARTIALLY IMPLEMENTED | Country field exists; proposed territories absent. |
| Product category selection | PARTIALLY IMPLEMENTED | Catalogue categories exist; partnership form category selection absent. |
| Estimated purchasing requirements | PARTIALLY IMPLEMENTED | RFQ quantities exist; annual/recurring purchasing qualification absent. |
| Branding and packaging requirements | COMPLETE | OEM textarea captures requirements without promising capability. |
| Supplier qualification document pack | BLOCKED BY BUSINESS INFORMATION | Owner-approved documents, validity, scope and disclosure rules required. |
| Commercial onboarding information | BLOCKED BY BUSINESS INFORMATION | Approved business onboarding terms/process absent. |
| Sample evaluation process | BLOCKED BY BUSINESS INFORMATION | Sample availability, charges, approval and feedback process unconfirmed. |
| Verified wholesale and MOQ policies | BLOCKED BY BUSINESS INFORMATION | No approved policy; current copy asks buyers to confirm. |
| Distributor relationship management process | NOT IMPLEMENTED | No relationship stages, ownership or follow-up tooling. |

## P5 — CRM and business analytics

| Requirement | Status | Evidence / remaining gap |
| --- | --- | --- |
| Structured enquiry storage | COMPLETE | RFQ SQLite/PostgreSQL payload and timestamps. |
| Lead categorisation | PARTIALLY IMPLEMENTED | Buyer type captured; no managed qualification status. |
| CRM integration | NOT IMPLEMENTED | Private CLI/database review only; no provider selected. |
| Duplicate lead detection | PARTIALLY IMPLEMENTED | Idempotency and 15-minute content dedup; no cross-enquiry company matching. |
| Acquisition source tracking | NOT IMPLEMENTED | No persisted source/referrer fields. |
| Campaign attribution | NOT IMPLEMENTED | No UTM capture or attribution model. |
| Quotation tracking | NOT IMPLEMENTED | RFQ receipt reference is not a commercial quotation lifecycle. |
| Sample tracking | NOT IMPLEMENTED | No sample records/stages. |
| Commercial pipeline stages | NOT IMPLEMENTED | Notification status is not sales status. |
| Qualified lead reporting | NOT IMPLEMENTED | No qualification/reporting interface. |
| Sales conversion tracking | NOT IMPLEMENTED | No won/lost records or reporting. |
| Distributor intelligence CSV import | NOT IMPLEMENTED | Product importer is not a prospect importer. |
| Evidence provenance | PARTIALLY IMPLEMENTED | CMS source document/page/image notes and server-stamped review/fingerprint now exist; extraction sidecars remain; no lead evidence provenance. |
| Outreach suppression records | NOT IMPLEMENTED | No outreach/suppression dataset; no outreach performed. |

## P6 — SEO, performance and security

| Requirement | Status | Evidence / remaining gap |
| --- | --- | --- |
| Commercial keyword mapping | PARTIALLY IMPLEMENTED | Existing qualitative intent map; no full product/market mapping. |
| Technical SEO validation | PARTIALLY IMPLEMENTED | Route/meta/sitemap tests; live indexing/crawl audit pending. |
| Product metadata | COMPLETE | Per-product titles/descriptions and stable canonical slugs. |
| Accurate structured data | PARTIALLY IMPLEMENTED | Organization/Product/Breadcrumb data; wider catalogue specifications unverified. |
| Internal linking | COMPLETE | Category/detail/source/RFQ paths; browser link checks. |
| Search Console readiness | PARTIALLY IMPLEMENTED | Sitemap/robots exist; ownership and live property validation absent. |
| Conversion tracking | NOT IMPLEMENTED | No analytics events or configured provider. |
| Image optimisation | COMPLETE | WebP/responsive media derivatives and local fonts. |
| Mobile responsiveness | COMPLETE | Existing public browser checks across five widths; rerun in this step. |
| Accessibility | PARTIALLY IMPLEMENTED | Semantic/progressive forms and axe checks; full manual/assistive-tech audit absent. |
| Secure form submissions | COMPLETE | Server validation, CSRF/origin, bounds, idempotency and honest acceptance. |
| Rate limiting | COMPLETE | Burst + durable hourly RFQ limits; CMS login protection. |
| Secure file upload processing | PARTIALLY IMPLEMENTED | Admin CSV/ZIP/image controls; buyer PDF/Excel uploads absent. |
| Secret management | PARTIALLY IMPLEMENTED | Server-side env/session hashes; production rotation/access/recovery unverified. |
| Appropriate data retention | BLOCKED BY BUSINESS INFORMATION | Private deletion exists; approved retention period and backup/email rules absent. |
| Production readiness testing | PARTIALLY IMPLEMENTED | Local suites exist; real cloud locks/storage/mail, recovery and field performance pending. |

## Business evidence register

Reuse [content-verification.md](../content-verification.md) as the authoritative register. Additional required inputs: legal entity/registration evidence; named enquiry owner; current certificate issuer/entity/scope/expiry; reviewed product-source matches and image rights; authenticated manufacturing processes/photos; approved wholesale/OEM/sample/audit terms; supplier-pack disclosure permissions; retention policy; verified mail sender/recipient and staging access. No missing input was replaced with an invented claim.

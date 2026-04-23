# Surgical Essence — User Research Plan

**Business context:** Established 1986 in Sialkot, Pakistan. Manufactures reusable surgical, dental, beauty, and ophthalmic instruments. ISO 13485 + CE certified. Currently has a marketing/catalog website at `localhost:3000` (soon to launch globally). Needs a proper online sales + lead generation system.

**Core business question:** What do hospitals, clinics, distributors, and resellers — globally — need to see, read, trust, and be able to do on the Surgical Essence site before they submit a quote request or place an order?

**Research goal:** Produce segment-specific conversion requirements that inform site IA, trust signals, lead-form design, and sales-ops workflow.

---

## Why research before redesigning

```
Common failure path (skip research):
  Build site → launch globally → get 200 visitors/week → 2 leads/month →
  assume "traffic problem" → spend on ads → still 2 leads/month →
  real problem was trust signals for European hospital buyers

Research-first path:
  Interview 12 buyers across 4 segments →
  discover: EU hospitals won't engage without published lot-tracking docs
             + Pakistani origin triggers 3 extra compliance questions →
  redesign adds Compliance Hub + origin FAQ →
  convert 8% of traffic instead of 1%
```

**Why-need scenario:** A German hospital procurement officer visits the site, sees ISO 13485 badge, then looks for REACH compliance, MDR class declaration, UDI (Unique Device Identification), and Declaration of Conformity. None are visible. She leaves and never asks. The site never knew she was there. Research surfaces the 4–6 documents each segment needs visible before engaging.

---

## 1. Research Plan

### Objectives (ranked)

1. **Identify the minimum viable trust signals** each segment needs on the home page, product page, and quote form before submitting a lead
2. **Map the buying workflow** of each segment: discovery → evaluation → shortlist → RFQ → negotiation → order → reorder
3. **Identify deal-breakers** — certifications missing, MOQ misaligned, shipping/terms opaque, origin concerns
4. **Validate the "Add to Quote" cart model** vs. traditional RFQ email vs. direct price list for each segment
5. **Prioritize site IA and content** based on what drives the quote request

### Out of scope (for this research round)

- Pricing research
- Brand perception / naming
- Internal CRM / ERP tooling
- Offline channel (trade shows, catalog distribution) research

### Research phases

| Phase | Method | N | Timeline | Output |
|---|---|---|---|---|
| 1 | Discovery interviews — 4 segments | 12 (3 per segment) | Weeks 1–3 | Themes, JTBD, trust-signal ranking |
| 2 | Usability test on current site + redesign mocks | 8 (2 per segment) | Weeks 4–5 | Task-success rates, friction log, redesign priorities |
| 3 | Quantitative validation survey | 100+ | Weeks 6–7 | Statistical ranking of decision criteria, segment sizing |
| 4 | Synthesis + report-out | — | Week 8 | Final report, redesign brief, roadmap |

**Total timeline:** 8 weeks. Phase 3 is optional — skip if budget-constrained and move directly to build.

### Participant segments

```
┌─────────────────────────────────────────────────────────────────────┐
│  SEGMENT          │ WHO               │ ORDER SIZE │ DECISION CYCLE │
├─────────────────────────────────────────────────────────────────────┤
│  Hospital         │ Procurement/      │ 500–5000   │ 2–9 months     │
│  (public/private) │ sourcing manager  │ units/year │ (tender-based) │
├─────────────────────────────────────────────────────────────────────┤
│  Clinic           │ Owner / practice  │ 20–200     │ 2–6 weeks      │
│  (dental, beauty, │ manager           │ units/year │                │
│   small surgical) │                   │            │                │
├─────────────────────────────────────────────────────────────────────┤
│  Distributor      │ Category buyer /  │ 1000–10k+  │ 3–12 months    │
│  (country-level)  │ supplier manager  │ units/yr   │ (contract)     │
├─────────────────────────────────────────────────────────────────────┤
│  Reseller         │ Owner-operator,   │ 50–500     │ 1–4 weeks      │
│  (online/B2B2C,   │ e-commerce store  │ units/yr   │                │
│   white-label)    │                   │            │                │
└─────────────────────────────────────────────────────────────────────┘
```

### Participant recruiting — screening criteria

**Hospital procurement (3 participants)**
- Works in procurement / sourcing / materials management at a hospital
- Has purchased surgical/dental/ophthalmic instruments in the last 12 months
- Involved in at least one supplier-evaluation decision
- Mix: 1 public sector, 1 private sector, 1 group-purchasing-organization (GPO) member
- Geographies to prioritize: Germany, UK, US, UAE, Turkey

**Clinic owner/manager (3 participants)**
- Owns or manages a clinic (dental, beauty, veterinary, or small surgical)
- Personally buys or approves instrument purchases
- Has considered or used an international supplier in the last 24 months
- Mix: 1 dental, 1 beauty/aesthetic, 1 small surgical
- Geographies to prioritize: US, EU, Middle East

**Distributor (3 participants)**
- Works at a distributor that carries surgical/medical instruments
- Holds a category-buyer or supplier-relationship role
- Evaluates new manufacturers as potential supply partners
- Mix: 1 mid-market, 1 enterprise, 1 regional/niche
- Geographies to prioritize: Germany, US, Saudi Arabia, Brazil

**Reseller (3 participants)**
- Runs an online store or B2B2C operation selling medical/beauty instruments
- Has sourced from Pakistan, China, or another non-domestic manufacturer
- Mix: 1 Amazon seller, 1 D2C brand, 1 private-label reseller
- Geographies to prioritize: US, UK, Australia, Germany

**Recruiting channels to consider:**
- LinkedIn Sales Navigator (most effective for procurement/distributor roles)
- Respondent.io or User Interviews (platforms pay $150–$300/session)
- Existing customer list (warm outreach — risk of bias)
- Clutch.co or industry directories for distributors/resellers
- Trade show contact lists (Arab Health, MEDICA, IDS)

**Incentive:** USD 150–250 per 45-min interview (procurement/clinic owners), USD 300–500 per 60-min interview (distributor/reseller decision-makers). Global rates vary — adjust via Payoneer/bank transfer.

### Ethics & consent

- Written consent before session (recording, storage, use in anonymized reports)
- Option to skip any question
- Session recordings retained 12 months, then deleted
- Quotes anonymized by default (segment + region only)
- Research is conducted by Surgical Essence or contracted researcher — disclose affiliation upfront

---

## 2. Interview Guide — shared backbone

**Duration:** 45 minutes (60 minutes for distributor/reseller)

**Format:** Remote video call (Zoom/Teams). One moderator + one note-taker. Recording with consent.

### 0 — Warm-up (5 min)

- Thanks for joining. I'm [name], a researcher working with a manufacturer exploring how to serve [segment] better. This is not a sales call. Anything you say stays anonymous.
- Before we start, two things: (1) Are you OK if I record this for note-taking purposes? (2) Any question, you can skip or pause.
- Tell me a bit about your role and what you do on a typical day.

### 1 — Context (10 min)

- Walk me through the last time you needed to buy surgical/medical instruments. Start from when you first realized you needed them.
- Who else was involved in that decision?
- How long did the full process take from first need to order placed?
- What tools, websites, or people did you use along the way?

**Probes:**
- How did you discover potential suppliers? (Search, referral, trade show, distributor catalog, other)
- What was the first thing you did when you landed on a supplier's website?
- At what point did you decide "yes, I'll reach out to this company"?

### 2 — Deep dive: trust and evaluation (15 min)

- When you're evaluating a new supplier — especially one based in a country you haven't bought from before — what do you look for?
- Rank these trust signals by importance [show list]: ISO certifications, CE mark, FDA registration, customer references, published catalog, quality-control documentation, factory audit reports, years in business, distributor network.
- Have you ever walked away from a supplier that seemed promising? What made you walk away?
- Tell me about a time you trusted a supplier and it went well. What made them trustworthy?
- Tell me about a time you trusted a supplier and it didn't go well. What was missing?

**Probes (country-origin specific):**
- What's your perception of suppliers based in Pakistan? China? India? Germany? (Expect bias — collect honestly)
- Does the country of manufacture affect what documentation you require?
- Do you need country-specific certifications (MDR, FDA, PMDA, ANVISA)?

### 3 — Deep dive: the quote/RFQ process (10 min)

- Walk me through how you typically request a quote from a new supplier.
- What makes a quote process feel easy vs. painful?
- Do you prefer: (a) submit a form and wait for a human reply, (b) download a price list and contact sales, (c) self-serve configurator with instant prices, (d) direct email to a sales rep?
- What fields on a quote form are unnecessary? What's missing that you wish they asked?
- How quickly do you expect a response? What's too slow?

### 4 — Reaction: the Surgical Essence site (10 min — usability portion)

Share screen. Ask them to land on the home page and think-aloud.

**Tasks (by segment — use segment-specific version from §3):**
1. You've been asked to source 200 forceps for a dental department. How would you proceed on this site?
2. Find out whether this company is certified for export to [their region].
3. Imagine you want pricing for a bulk order. How would you submit that?
4. Looking at the whole site — is there anything missing that would stop you from engaging further?

### 5 — Wrap-up (5 min)

- Is there anything we didn't cover that you think is important?
- Anyone else we should talk to?
- Thanks — we'll send the incentive within [X] days.

---

## 3. Segment-specific interview probes

### 3a. Hospital procurement

**Additional questions:**
- How does your hospital handle supplier onboarding? Vendor-master forms, financial checks, quality audits?
- What role do group purchasing organizations (GPOs) play in your sourcing?
- Do you run formal tenders / RFPs? What triggers a tender vs. a direct order?
- How are instrument reprocessing and sterilization handled, and does that affect supplier choice?
- What's your position on single-use vs. reusable instruments post-COVID?
- Is there a committee that approves new suppliers? What does the committee ask for?

**Usability task — tailored:**
> "Your infection-control committee has mandated that you re-evaluate suppliers of scissors, forceps, and retractors for the general surgery department. Your annual volume is about 2,500 units. Using this site, tell me what you'd do first, what documents you'd download, and what you'd ask for before engaging further."

### 3b. Clinic owner/manager

**Additional questions:**
- How do you currently decide between buying from a local distributor vs. importing directly?
- What order quantities typically make direct-from-manufacturer worthwhile?
- What's your experience with shipping/import/customs for medical goods?
- Do you resell to patients (aesthetic clinics) or is everything in-house?
- How price-sensitive are you vs. quality-sensitive?
- Have you ever private-labeled an instrument?

**Usability task — tailored:**
> "You run a dental clinic with 4 chairs. You need to replace your extraction forceps and add a new set for the hygienist. Budget is around [segment-appropriate number]. Walk me through how you'd evaluate and buy from this site."

### 3c. Distributor

**Additional questions:**
- How do you evaluate new manufacturers for your portfolio?
- What's your typical margin expectation, MOQ, and payment terms?
- Do you white-label, private-label, or resell under the manufacturer's brand?
- What regulatory filings do you handle vs. expect the manufacturer to handle?
- How long does your internal product-onboarding take from handshake to first purchase order?
- Do you expect a distributor portal with tiered pricing, stock visibility, and order history?

**Usability task — tailored:**
> "You're evaluating this manufacturer as a potential new line for your catalog — you cover the [region] market and sell to hospitals and clinics. What do you need to see to move them from 'interesting' to 'schedule a call'? Walk through the site accordingly."

### 3d. Reseller

**Additional questions:**
- Where do you sell? (Amazon, Shopify, eBay, B2B marketplace, own website)
- Do you private-label or resell under the manufacturer's brand?
- What's your typical order cycle — fixed monthly restock, demand-driven, or seasonal?
- How do you handle returns, warranty, and quality complaints from end customers?
- What's your realistic MOQ tolerance — are you starting at 50 units or 500?
- Do you need dropship capability?

**Usability task — tailored:**
> "You run a private-label beauty instruments brand on Amazon US. You're looking for a new supplier for nail nippers and tweezers to launch a new SKU line. Using this site, tell me what you'd do from discovery through first contact."

---

## 4. Usability Test Script (Phase 2)

Runs **after** Phase 1 interviews surface core requirements. Tests current live site + any redesign mockups.

**Session length:** 30 minutes
**N:** 8 (2 per segment)

### Structure

| Time | Activity |
|---|---|
| 0:00–0:05 | Intro, consent, think-aloud coaching |
| 0:05–0:25 | 4 tasks (see below) |
| 0:25–0:30 | Post-task debrief + SUS questionnaire |

### Task list

| # | Task | Success metric |
|---|---|---|
| 1 | *Landing scan* — "You just landed on this site. Take 30 seconds and tell me what this company does and who it's for." | Correct identification of: manufacturer / medical / B2B / reusable |
| 2 | *Find a product* — "Find a [segment-appropriate instrument]. Show me what you'd click to learn more." | Time-to-product-detail; correct category navigation |
| 3 | *Verify certification* — "Your buying department only approves suppliers with [cert relevant to region]. Find that documentation." | Cert page found within 60s; can download/screenshot |
| 4 | *Request quote* — "You want pricing for 200 units of [product]. Submit a quote request." | Form submitted; friction points logged |
| 5 | *Trust check* (unprompted) — "Overall, would you trust this company enough to place a $50K order? Why or why not?" | Qualitative — capture verbatim |

### Post-task debrief questions

- On a scale of 1–7, how easy was it to find what you needed? (SUS proxy)
- What was the most confusing part?
- What was missing that would have made you confident?
- Would you submit a quote request here? Why/why not?

### System Usability Scale (SUS) — 10 items

Standard 10-question SUS administered at the end. Score benchmark:
- ≥ 80 = excellent
- 68 = average
- < 50 = unusable

---

## 5. Quantitative Survey (Phase 3, optional)

**N:** 100+ (target 25 per segment)
**Platform:** Typeform / SurveyMonkey / Google Forms
**Distribution:** LinkedIn ads targeting job titles, industry newsletters, partner distributor lists
**Incentive:** USD 10 Amazon gift card or entry into USD 500 draw

### Core questions (abbreviated)

1. Role / segment (screening)
2. Country / region
3. Annual instrument spend range
4. Rank importance: Price / Quality / Certifications / Country-of-origin / Lead time / Warranty / MOQ flexibility / Reputation
5. Preferred first-contact method: Quote form / Email / WhatsApp / Phone / Video call
6. Must-have certifications checklist
7. Country-of-origin preference (if any)
8. Open text: "What's the biggest frustration when sourcing surgical instruments from a new manufacturer?"
9. Open text: "What would make you confident enough to place a first order with a Pakistan-based manufacturer?"
10. Willingness to receive product updates (email capture, permission-based)

---

## 6. Synthesis Framework

Run after Phase 1 interviews (12 sessions).

### 6a. Affinity mapping

```
Raw observations (from notes/transcripts)
   ↓
Cluster by theme — e.g., "Trust signals", "Procurement process",
                       "Origin concerns", "Payment terms"
   ↓
Sub-cluster by segment — does this theme behave the same across all 4?
   ↓
Identify patterns — 8+ participants say X = strong signal
                   3-5 participants = worth testing
                   1-2 = outlier, flag but don't act
```

### 6b. Jobs-to-be-done (JTBD) statements

Fill in per segment:

> When I'm **[situation]**, I want to **[motivation]**, so I can **[expected outcome]**.

Example (hospital procurement):
> When I'm onboarding a new supplier for high-volume consumables, I want to verify their quality-control documentation and export history to my country, so I can defend the choice to the infection-control committee without three weeks of email back-and-forth.

Produce **2–3 JTBDs per segment** (8–12 total).

### 6c. Trust-signal ranking

Cross-reference what each segment said they needed. Build a prioritized matrix:

```
                    Hospital  Clinic   Distrib  Reseller
ISO 13485              ●●●     ●●●      ●●●       ●●
CE mark                ●●●     ●●       ●●●       ●●
FDA registration       ●       ●●●      ●●●       ●●●
MDR Class declaration  ●●●     ●●       ●●●       ●
Country of origin      ●       ●        ●         ●●●
Factory audit report   ●●●     ●        ●●        ●
Sample shipment        ●       ●●       ●●●       ●●●
Customer references    ●●      ●        ●●●       ●●
Published catalog/LOT  ●●●     ●●       ●●●       ●●

Legend: ●●● = must-have   ●● = strongly preferred   ● = nice-to-have
```

### 6d. Conversion friction log

One row per observed drop-off / hesitation / complaint in Phase 2 usability:

| # | Segment | Task | Friction | Quote | Severity | Fix cost | Priority |
|---|---|---|---|---|---|---|---|
| 1 | Hospital | #3 Verify cert | Couldn't find MDR class declaration | *"I'd need to email them just to find out — too slow."* | High | Low | P0 |
| 2 | Distributor | #4 Quote form | No MOQ field on form | *"How do I tell them I want 10k units vs 50?"* | High | Low | P0 |

### 6e. Recommendation deliverable

Final write-up structure:

1. Executive summary (1 page)
2. Methodology (1 page)
3. Segment profiles (1 page × 4 segments)
4. Top 5 findings (evidence-backed, quote-supported)
5. Trust-signal priority matrix
6. JTBD statements
7. Redesign recommendations — tied to specific findings
8. Roadmap (P0 / P1 / P2 with effort estimates)
9. Appendix: raw quotes, session recordings index

---

## 7. Redesign hypotheses to validate

Based on existing site review, these are candidate changes to test against research findings:

| # | Hypothesis | Test in | Research signal needed |
|---|---|---|---|
| H1 | Adding a "Compliance Hub" with downloadable MDR/FDA/REACH docs will increase quote-form submissions from EU/US buyers | Phase 2 | Phase 1 confirms these docs are gating requirement |
| H2 | An "Add to Quote" cart beats a single "Contact Us" form for distributors/resellers buying multiple SKUs | Phase 2 | Phase 1 confirms multi-SKU RFQ is common |
| H3 | Showing MOQ + lead time on product pages reduces unqualified leads | Phase 2 | Phase 1 confirms MOQ confusion is real |
| H4 | A distributor-specific landing page with tiered pricing and portal access improves distributor engagement | Phase 2 | Phase 1 confirms distributors need separate entry point |
| H5 | WhatsApp as primary channel (already present) converts Middle East / South Asia buyers faster than form | Survey | Survey confirms regional channel preference |
| H6 | Real product photography (vs. current blurry catalog images) materially changes trust rating | Phase 2 | A/B with/without photos during session |
| H7 | Country-of-origin disclosure, when framed with "ISO 13485 + 40 years export history," neutralizes Pakistan-origin friction | Phase 1 + Phase 2 | Direct question during interview + observe reaction |

---

## 8. Budget (rough)

| Line item | Estimate (USD) |
|---|---|
| Recruiting platform fees (Respondent.io, User Interviews) | 800 |
| Interview incentives (12 × avg $250) | 3,000 |
| Usability test incentives (8 × $200) | 1,600 |
| Survey incentives ($500 draw + platform fees) | 700 |
| Transcription (Otter.ai, Rev) | 400 |
| Researcher time (self-done or contractor) — ~80 hrs @ $75/hr | 6,000 |
| **Total** | **~12,500** |

Reduce by ~40% if:
- Skip Phase 3 (survey)
- Self-conduct interviews
- Use existing customer network for 3–4 participants

---

## 9. Immediate next steps

1. Confirm scope — do you want all three phases, or Phase 1 + 2 only?
2. Decide researcher — internal (you/team) or contract?
3. Draft screener questionnaire for recruiting (can produce next)
4. Set up recruiting account (Respondent.io recommended for B2B)
5. Book first 3 interview slots within 10 days to keep momentum

**First artifacts you'll need before any interviews begin:**
- Recruiting screener (~15 questions, filters to the right participants)
- Consent form
- Calendar link (Calendly) with 45/60-min slots
- Zoom/Teams room with recording enabled
- Shared note-taking doc (Notion, Google Doc, or Dovetail if budget allows)

Reply with which artifact to produce next: **screener**, **consent form**, or **full interview guide as standalone doc for moderator use**.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Surgical Essence is a surgical instruments manufacturing business based in Sialkot, Pakistan. This B2B website serves hospitals, healthcare businesses, and other professional entities looking to source high-quality surgical instruments. The primary goal is lead generation through an accessible, user-friendly platform.

## Business Requirements

### Core Functionality

1. **Lead Generation System**
   - Contact forms should capture lead information
   - Leads must be automatically stored in database
   - Export capability to dashboard/Excel for business team
   - Multiple contact methods: email, phone, and other applicable channels

2. **Catalog Management**
   - Downloadable product catalog (PDF/document format)
   - Easy access without long scrolling
   - Should showcase surgical instruments inventory

3. **Navigation & UX Principles**
   - Intuitive navigation for B2B audience
   - Critical actions within immediate reach (no excessive scrolling)
   - Impulse-driven design for contact and catalog access
   - Clear call-to-action buttons throughout

4. **Accessibility (WCAG Standards)**
   - Full keyboard navigation support
   - Screen reader compatibility
   - Proper ARIA labels and semantic HTML
   - Color contrast compliance
   - Focus indicators for interactive elements

5. **Multi-language Support**
   - Translated pages for international B2B clients
   - Language switcher in navigation

6. **Search Functionality**
   - Product/instrument search capability
   - Filter and category support

7. **Certifications & Trust Signals**
   - Display manufacturing certifications
   - Show quality standards and compliance badges
   - Footer must include: business address, certifications

8. **Press Releases (Protected Route)**
   - Admin login required
   - Add/edit press releases with:
     - Title
     - Text content
     - Image uploads
   - Form validation for all inputs

9. **Loading Experience**
   - Animated loading screen with company logo
   - Smooth transitions between pages

10. **Form Validation**
    - Client-side validation for all user inputs
    - Server-side validation for security
    - Clear error messages

11. **Product Management**
    - Category → Subcategory → Product → Variants hierarchy
    - Technical specs per product: material, usage, sterilization method, certifications
    - Image uploads (multiple per product) and product PDF datasheets
    - Soft delete (never hard-delete products; set `active: false`)
    - Admin CRUD for all levels of the hierarchy

12. **Quote System (replaces "Buy Now")**
    - "Add to Quote" button on every product and variant — no e-commerce checkout
    - Persistent quote cart (localStorage or session): add, edit quantity, add notes, remove items
    - Quote submission form fields: Name, Email, Phone, Organization, Country, Message
    - Submitted quotes stored in database with status pipeline: `NEW → CONTACTED → NEGOTIATION → CLOSED`
    - Email notification to admin on new quote
    - Confirmation email to user after submission
    - Admin can view, filter, update status, and assign quotes in dashboard

13. **Instrument Finder**
    - User selects a surgical procedure → system shows the required instruments
    - "Add All to Quote" button to bulk-add suggested instruments to quote cart
    - Admin manages procedure → instrument mappings

14. **Surgical Sets / Kits**
    - Admin creates predefined sets (e.g., Cataract Kit, Laparoscopy Set)
    - Each set has a name, description, and a list of products/variants
    - Users can add an entire set to the quote cart in one click

15. **Gated Catalog Download**
    - User must provide email (and optionally name/company) before downloading catalog PDF
    - Submission stored as a Subscriber/Lead record
    - Download link provided immediately after form submission

16. **Advanced Search & Filtering**
    - Search by product name, SKU, category, subcategory, or procedure
    - Filter results by category, material, and usage type
    - URL-based filter state for shareable/bookmarkable searches

17. **CRM Integration**
    - Sync quotes and leads to CRM (EspoCRM or SuiteCRM)
    - Admin can assign leads/quotes to sales team members
    - Webhook or API push on new quote/lead creation

18. **WhatsApp Integration**
    - Floating WhatsApp button on all pages (direct link to business WhatsApp)
    - Configure number via environment variable `WHATSAPP_NUMBER`

19. **Newsletter / Email Campaigns**
    - Subscribe form (email + optional name) captures Subscriber records
    - Admin can compose and send newsletter emails to all subscribers (Nodemailer)

20. **Promotions & Banners**
    - Admin can create/activate promotional banners displayed site-wide or on specific pages
    - Banners support title, description, CTA link, and expiry date

21. **Testimonials**
    - Admin manages customer testimonials (name, company, country, quote text, optional logo)
    - Displayed in a dedicated trust section on the homepage

22. **Global Reach Display**
    - Show countries/regions served (static or admin-managed list)
    - Visual map or flag grid component

23. **Blog System**
    - Admin creates/edits/publishes blog articles (title, content, cover image, tags)
    - Public blog index and individual article pages
    - SEO metadata per article

24. **Analytics & Tracking**
    - Integrate Google Analytics 4 (or Plausible for privacy-first)
    - Track: page views, quote cart additions, quote submissions, catalog downloads
    - Configure via `NEXT_PUBLIC_GA_ID` environment variable

### Non-Functional Requirements

| ID     | Category        | Requirement      | Target                                        |
| ------ | --------------- | ---------------- | --------------------------------------------- |
| NFR-01 | Performance     | Page Load        | Under 2 seconds (Core Web Vitals green)       |
| NFR-02 | Performance     | Optimization     | CDN (Vercel Edge) + Next.js Image compression |
| NFR-03 | Usability       | Navigation       | Max 2 clicks to reach any product             |
| NFR-04 | UX              | Primary CTA      | "Request Quote" always visible and prominent  |
| NFR-05 | UX              | Visual Hierarchy | Guide attention: hero → products → quote      |
| NFR-06 | Accessibility   | WCAG 2.1 AA      | Contrast, keyboard nav, alt text, focus rings |
| NFR-07 | Security        | HTTPS            | Enforced in production; HSTS header           |
| NFR-08 | Security        | Input Validation | XSS/SQLi prevention on all inputs             |
| NFR-09 | Security        | Data Encryption  | Passwords hashed; TLS in transit              |
| NFR-10 | Compliance      | GDPR             | Cookie consent banner; data deletion on request; privacy policy page |
| NFR-11 | Scalability     | Global Traffic   | Stateless API; Vercel edge-ready              |
| NFR-12 | Maintainability | Architecture     | Modular components; typed API responses       |

### Security Requirements

1. **Input Validation**
   - Sanitize all user inputs on both client and server
   - Prevent XSS (Cross-Site Scripting) attacks
   - Prevent SQL injection (parameterized queries)
   - Validate email formats, phone numbers, and other structured data
   - Whitelist allowed characters for each input type

2. **Rate Limiting**
   - Implement rate limiting on API endpoints
   - Prevent brute force attacks on login
   - Limit contact form submissions per IP/session
   - Protect against DoS attacks

3. **CAPTCHA Integration (hCaptcha)**
   - Add hCaptcha to contact form to prevent spam
   - Add hCaptcha to admin login
   - Documentation: https://docs.hcaptcha.com/
   - More privacy-focused alternative to reCAPTCHA

4. **Secure Password Storage (Admin)**
   - Use bcrypt or Argon2 for password hashing
   - Never store plaintext passwords
   - Implement minimum password strength requirements
   - Consider 2FA (Two-Factor Authentication) for admin accounts

5. **Additional Security Measures**
   - HTTPS enforcement in production
   - Secure HTTP headers (CSP, X-Frame-Options, etc.)
   - CSRF protection for forms
   - Secure session management
   - Regular dependency updates for vulnerabilities

6. **GDPR Compliance**
   - Cookie consent banner on first visit; respect user preferences
   - Privacy Policy page explaining data collection
   - Allow users to request deletion of their data (contact form / email)
   - Do not store personally identifiable information beyond what is necessary
   - Do not share PII with third parties without disclosure

## Database Setup (Supabase + Prisma)

### Initial Setup

**1. Create Supabase Project**
- Go to https://supabase.com
- Create new project
- Note your project URL and API keys
- Get database connection string from Settings > Database

**2. Install Prisma**
```bash
bun add @prisma/client
bun add -d prisma
```

**3. Initialize Prisma**
```bash
bunx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema
- `.env` - Adds DATABASE_URL (move to `.env.local`)

**4. Configure DATABASE_URL**
Add to `.env.local`:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

Note: Supabase uses connection pooling (pgbouncer), so we need both URLs.

### Prisma Schema

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Lead {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  company   String?
  message   String   @db.Text
  country   String?
  source    String?  // "contact_form" | "catalog_download" | "newsletter"
  createdAt DateTime @default(now())

  @@index([email])
  @@index([createdAt(sort: Desc)])
}

model Category {
  id            String        @id @default(cuid())
  name          String
  slug          String        @unique
  description   String?
  imageUrl      String?
  sortOrder     Int           @default(0)
  subcategories Subcategory[]
  products      Product[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Subcategory {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  imageUrl    String?
  sortOrder   Int       @default(0)
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([categoryId])
}

model Product {
  id              String           @id @default(cuid())
  sku             String           @unique
  name            String
  slug            String           @unique
  description     String?          @db.Text
  material        String?
  usage           String?          @db.Text
  sterilization   String?
  certifications  String[]         // e.g. ["ISO 13485", "CE"]
  imageUrls       String[]
  pdfUrl          String?
  active          Boolean          @default(true)
  categoryId      String?
  category        Category?        @relation(fields: [categoryId], references: [id])
  subcategoryId   String?
  subcategory     Subcategory?     @relation(fields: [subcategoryId], references: [id])
  variants        ProductVariant[]
  quoteItems      QuoteItem[]
  surgicalSetItems SurgicalSetItem[]
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([categoryId])
  @@index([subcategoryId])
  @@index([active])
}

model ProductVariant {
  id          String      @id @default(cuid())
  sku         String      @unique
  name        String      // e.g. "5mm", "Curved", "Left-Hand"
  description String?
  imageUrls   String[]
  active      Boolean     @default(true)
  productId   String
  product     Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  quoteItems  QuoteItem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([productId])
}

// Status values: NEW | CONTACTED | NEGOTIATION | CLOSED
model QuoteRequest {
  id           String      @id @default(cuid())
  status       String      @default("NEW")
  name         String
  email        String
  phone        String?
  organization String?
  country      String?
  message      String?     @db.Text
  assignedTo   String?     // admin User id
  items        QuoteItem[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  @@index([status])
  @@index([email])
  @@index([createdAt(sort: Desc)])
}

model QuoteItem {
  id             String          @id @default(cuid())
  quantity       Int             @default(1)
  notes          String?
  quoteRequestId String
  quoteRequest   QuoteRequest    @relation(fields: [quoteRequestId], references: [id], onDelete: Cascade)
  productId      String?
  product        Product?        @relation(fields: [productId], references: [id])
  variantId      String?
  variant        ProductVariant? @relation(fields: [variantId], references: [id])

  @@index([quoteRequestId])
}

model SurgicalSet {
  id          String           @id @default(cuid())
  name        String
  slug        String           @unique
  description String?          @db.Text
  imageUrl    String?
  active      Boolean          @default(true)
  items       SurgicalSetItem[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}

model SurgicalSetItem {
  id           String      @id @default(cuid())
  quantity     Int         @default(1)
  surgicalSetId String
  surgicalSet  SurgicalSet @relation(fields: [surgicalSetId], references: [id], onDelete: Cascade)
  productId    String
  product      Product     @relation(fields: [productId], references: [id])

  @@index([surgicalSetId])
}

model Catalog {
  id          String   @id @default(cuid())
  name        String
  fileUrl     String
  version     String?
  active      Boolean  @default(true)
  gated       Boolean  @default(true) // true = require email before download
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Subscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  company   String?
  active    Boolean  @default(true)
  createdAt DateTime @default(now())

  @@index([email])
}

model Testimonial {
  id        String   @id @default(cuid())
  name      String
  company   String?
  country   String?
  logoUrl   String?
  quote     String   @db.Text
  active    Boolean  @default(true)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model BlogPost {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  content     String    @db.Text
  coverImage  String?
  tags        String[]
  published   Boolean   @default(false)
  publishedAt DateTime?
  authorId    String
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([published, publishedAt(sort: Desc)])
  @@index([slug])
}

model PromotionBanner {
  id          String    @id @default(cuid())
  title       String
  description String?
  ctaText     String?
  ctaUrl      String?
  active      Boolean   @default(true)
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model PressRelease {
  id          String   @id @default(cuid())
  title       String
  content     String   @db.Text
  imageUrl    String?
  published   Boolean  @default(false)
  publishedAt DateTime?
  authorId    String
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([published, publishedAt(sort: Desc)])
}

model User {
  id            String           @id @default(cuid())
  email         String           @unique
  passwordHash  String
  role          String           @default("admin")
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  pressReleases PressRelease[]
  blogPosts     BlogPost[]

  @@index([email])
}
```

### Prisma Commands

```bash
# Generate Prisma Client (run after schema changes)
bunx prisma generate

# Create and apply migrations
bunx prisma migrate dev --name init

# Open Prisma Studio (database GUI)
bunx prisma studio

# Reset database (WARNING: deletes all data)
bunx prisma migrate reset

# Apply migrations in production
bunx prisma migrate deploy

# Seed database (if seed file exists)
bunx prisma db seed
```

### Using Prisma in Code

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Usage in API routes:

```typescript
import { prisma } from '@/lib/prisma'

// Create a lead
const lead = await prisma.lead.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Interested in surgical instruments'
  }
})

// Get all leads
const leads = await prisma.lead.findMany({
  orderBy: { createdAt: 'desc' }
})
```

### Supabase Storage (for files)

**Setup for catalog PDFs and press release images**:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Upload file
const { data, error } = await supabase.storage
  .from('press-releases')
  .upload('image.jpg', file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('press-releases')
  .getPublicUrl('image.jpg')
```

## Environment Setup

### Environment Variables

The project uses environment variables for configuration. **Never commit `.env.local` or `.env` files to git.**

**File Structure**:
- `.env.local` - Local development secrets (gitignored, contains real keys)
- `.env.example` - Template file (committed to git, shows required variables)
- `.env` - Legacy file (gitignored, use `.env.local` instead)

**Required Variables**:

```env
# Supabase (https://supabase.com/dashboard)
DATABASE_URL=                           # Connection pooling URL (with ?pgbouncer=true)
DIRECT_URL=                             # Direct connection URL (for migrations)
NEXT_PUBLIC_SUPABASE_URL=               # Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=          # Public anon key
SUPABASE_SERVICE_ROLE_KEY=              # Service role key (server-side only)

# hCaptcha (https://dashboard.hcaptcha.com/)
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=          # Public site key
HCAPTCHA_SECRET_KEY=                    # Secret key for verification

# Email (for lead notifications)
SMTP_HOST=                              # SMTP server (or use Supabase Auth emails)
SMTP_PORT=                              # Usually 587 for TLS
SMTP_USER=                              # Email username
SMTP_PASS=                              # Email password
EMAIL_FROM=                             # From email address

# NextAuth (admin authentication)
NEXTAUTH_URL=                           # http://localhost:3000 (dev) or production URL
NEXTAUTH_SECRET=                        # Random secret (generate with: openssl rand -base64 32)

# Admin
ADMIN_EMAIL=                            # Initial admin email

# WhatsApp
WHATSAPP_NUMBER=                        # E.164 format e.g. 923001234567 (no + sign)

# CRM (EspoCRM / SuiteCRM)
CRM_API_URL=                            # Base URL of CRM instance
CRM_API_KEY=                            # CRM API key

# Analytics
NEXT_PUBLIC_GA_ID=                      # Google Analytics 4 measurement ID (e.g. G-XXXXXXXX)
```

**Setup Instructions**:
1. Copy `.env.example` to `.env.local`
2. Fill in real values in `.env.local`
3. Never commit `.env.local` to git (already in .gitignore)

## Development Commands

### Initial Setup (First Time)

1. **Install Dependencies**
```bash
bun install
```

2. **Set up Environment Variables**
```bash
# Copy example to .env.local
cp .env.example .env.local
# Edit .env.local and add your Supabase credentials
```

3. **Set up Database**
```bash
# Install Prisma
bun add @prisma/client
bun add -d prisma

# Initialize Prisma (if not already done)
bunx prisma init

# Generate Prisma Client
bunx prisma generate

# Run migrations
bunx prisma migrate dev --name init
```

4. **Start Development Server**
```bash
bun dev
```

### Daily Development

**Running the Development Server**
```bash
bun dev
# or npm run dev / yarn dev / pnpm dev
```
The application runs on http://localhost:3000

**After Schema Changes**
```bash
# Generate updated Prisma Client
bunx prisma generate

# Create and apply migration
bunx prisma migrate dev --name your_migration_name
```

**View Database**
```bash
bunx prisma studio
```
Opens GUI at http://localhost:5555

### Building for Production
```bash
bun run build
# or npm run build
```

### Starting Production Server
```bash
bun start
# or npm start
```

### Linting
```bash
bun run lint
# or npm run lint
```

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **Styling**: Tailwind CSS v4 (PostCSS-based)
- **Font**: Open Sans (Google Fonts via next/font)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (can also use Supabase Auth)
- **File Storage**: Supabase Storage (catalog PDFs, product images, press release images)
- **Email**: Nodemailer (quote notifications, user confirmations, newsletters)
- **CAPTCHA**: hCaptcha
- **CRM**: EspoCRM or SuiteCRM (lead/quote sync via REST API)
- **Analytics**: Google Analytics 4 (via `next/script`)
- **Package Manager**: Bun (lockfile present, though npm/yarn/pnpm also work)
- **Linting**: ESLint with Next.js config

## Design System

### Brand Colors

**Primary Brand Color**: `#0168b3` (Professional Blue)
- Use for primary CTAs, links, and brand elements
- Accent color from company logo
- Conveys trust, professionalism, and medical precision

**Color Scheme Guidelines**:
- Primary: `#0168b3` - Main brand color for buttons, links, headers
- Secondary: Complementary colors for hierarchy (consider neutral grays and whites)
- Success: Green tones for form success states
- Error: Red tones for validation errors
- Background: Clean whites/light grays for professional B2B aesthetic

**Tailwind v4 Configuration** (to be added to `globals.css`):
```css
@import "tailwindcss";

@theme {
  --color-brand-primary: #0168b3;
  --color-brand-light: #0180d3;
  --color-brand-dark: #014f8f;
}
```

Usage in components:
```jsx
<button className="bg-brand-primary hover:bg-brand-dark text-white">
  Contact Us
</button>
```

### Design Principles

- **Professional & Medical**: Clean, trustworthy design appropriate for healthcare B2B
- **High Contrast**: Ensure readability and WCAG compliance
- **Minimal & Focused**: Reduce cognitive load for busy healthcare professionals
- **Trust Signals**: Use brand blue strategically with certifications and quality badges

## Project Architecture

### Directory Structure

```
surgicalessencefrontend/
├── src/
│   └── app/              # Next.js App Router
│       ├── components/   # React components
│       ├── layout.js     # Root layout with metadata & fonts
│       ├── page.js       # Home page
│       └── globals.css   # Global styles (Tailwind imports)
├── public/               # Static assets (SVG icons)
└── [config files]
```

### App Router Pattern

This project uses Next.js App Router (not Pages Router). Key conventions:
- `src/app/layout.js` - Root layout defining HTML structure, metadata, and fonts
- `src/app/page.js` - Home page route
- `src/app/components/` - Shared React components
- Server Components by default (use `"use client"` directive when needed)

### Path Aliases

The project uses `@/` alias for imports:
- Configured in `jsconfig.json`
- Example: `import Navbar from "@/app/components/Navbar"`

### Styling Approach

- Tailwind CSS v4 with PostCSS integration
- Global styles imported via `@import "tailwindcss"` in `globals.css`
- Component-level utility classes
- Font loaded globally via `layout.js` with CSS variable `--font-ibm-plex-sans`

### Asset Management

**Static Assets Location**: `public/` directory

**Recommended Organization**:
```
public/
├── images/
│   ├── logo/              # Company logo variations
│   │   ├── logo.svg       # Main logo
│   │   ├── logo-light.svg # Light version (for dark backgrounds)
│   │   └── logo-icon.svg  # Icon only
│   ├── hero/              # Hero section images
│   ├── products/          # Product/instrument images
│   ├── certifications/    # Certification badges/documents
│   └── team/              # Team/about images
├── documents/
│   └── catalog.pdf        # Downloadable product catalog
└── icons/                 # UI icons (if not using icon library)
```

**Image Usage**:
```jsx
import Image from 'next/image'

<Image
  src="/images/logo/logo.svg"
  alt="Surgical Essence Logo"
  width={200}
  height={60}
  priority // For above-the-fold images
/>
```

**Image Optimization**:
- Use Next.js `<Image>` component for automatic optimization
- Provide multiple sizes for responsive images
- Use WebP format where possible for better compression
- Add descriptive alt text for accessibility

## Implementation Roadmap

### Completed
- ✅ Next.js project setup with App Router
- ✅ Tailwind CSS v4 configuration
- ✅ Basic Navbar component structure
- ✅ Root layout with IBM Plex Sans font
- ✅ Brand color defined: `#0168b3`

### Assets Provided by Client
- ✅ Company logo: `public/images/logo/SurgicalEssenceLogo.png` (with `#0168b3` accent color)
- Additional images for website implementation (to be added)
- Product catalog (for download functionality)
- Certifications and quality badges

**Note**: Image directories are pre-organized in `public/images/` and `public/documents/`. Place new assets in the appropriate subdirectory.

### To Be Implemented

**Phase 1: Core Pages & Navigation**
- Home page with hero section, primary "Request Quote" CTA, and trust signals
- About/Company page
- Contact page
- Update Navbar with all navigation links
- WhatsApp floating button (global)
- Footer with address, certifications, and links
- Loading screen with logo animation

**Phase 2: Product Catalog**
- Run database migrations for Category, Subcategory, Product, ProductVariant
- Admin CRUD for categories, subcategories, products, and variants
- Public product listing pages (category → subcategory → product detail)
- Advanced search by name, SKU, category, procedure
- Filter sidebar (category, material, usage)
- Product detail page with specs, images, and PDF datasheet

**Phase 3: Quote System**
- Quote cart (client-side, localStorage-persisted)
- "Add to Quote" on product cards and detail pages
- Quote submission form (Name, Email, Phone, Org, Country, Message)
- hCaptcha on quote form
- API route `/api/quotes` — stores QuoteRequest + QuoteItems in DB
- Email notification to admin on new quote
- Confirmation email to user (Nodemailer)
- Admin quote pipeline dashboard (status: NEW → CONTACTED → NEGOTIATION → CLOSED)
- Lead/quote export to CSV

**Phase 4: Instrument Finder & Surgical Sets**
- Admin manages procedure → instrument mappings
- Instrument Finder UI: procedure selector → instrument list → "Add All to Quote"
- Admin creates/edits Surgical Sets (predefined kits)
- Surgical Sets public page with "Add Set to Quote" button

**Phase 5: Lead Generation & Catalog Download**
- Set up Supabase project and complete Prisma migrations
- Contact form with hCaptcha and rate limiting
- Gated catalog download: email gate → Subscriber record → download link
- Lead dashboard or export functionality (admin)

**Phase 6: Trust Signals & Content**
- Certifications showcase section (ISO, CE, etc.)
- Testimonials section (admin-managed)
- Global Reach display (countries/regions served)
- Promotions/Banner system (admin-managed, with expiry)
- Blog system (admin creates posts; public index + article pages; SEO metadata)
- Press releases (admin CRUD; public display page)

**Phase 7: Accessibility, i18n & Analytics**
- Keyboard navigation, ARIA labels, semantic HTML
- Screen reader testing and WCAG 2.1 AA audit
- i18n setup (next-intl); language switcher in Navbar
- Google Analytics 4 integration
- Cookie consent banner (GDPR)

**Phase 8: Admin Dashboard & CRM**
- Protected `/admin` route with middleware (NextAuth session)
- hCaptcha on admin login; rate limiting on login attempts
- Admin stats dashboard (`/api/admin/stats`)
- CRM integration: push new quotes/leads to EspoCRM/SuiteCRM via API
- Lead assignment to sales team members
- Newsletter compose and send (Nodemailer bulk)
- Audit log viewer

**Phase 9: Polish & Performance**
- SEO: dynamic metadata, sitemap, robots.txt
- Performance audit (Core Web Vitals < 2 s)
- CDN headers, Next.js Image optimization, lazy loading
- Security headers (CSP, X-Frame-Options, etc.) in `next.config.mjs`
- GDPR: privacy policy page, data deletion flow

## Architecture Considerations

### hCaptcha Implementation

**Installation**:
```bash
bun add @hcaptcha/react-hcaptcha
```

**Environment Variables**: See "Environment Setup" section above for hCaptcha keys.

**Client-Side Usage** (Contact Form Example):
```jsx
"use client"
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { useState } from 'react'

export default function ContactForm() {
  const [captchaToken, setCaptchaToken] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaToken) {
      alert('Please complete the captcha')
      return
    }

    // Submit form with captchaToken
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // ...form data
        captchaToken
      })
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <HCaptcha
        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
        onVerify={(token) => setCaptchaToken(token)}
      />
      <button type="submit">Submit</button>
    </form>
  )
}
```

**Server-Side Verification** (API Route):
```javascript
// app/api/contact/route.js
export async function POST(request) {
  const { captchaToken, ...formData } = await request.json()

  // Verify hCaptcha token
  const verifyResponse = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.HCAPTCHA_SECRET_KEY}&response=${captchaToken}`
  })

  const verifyData = await verifyResponse.json()

  if (!verifyData.success) {
    return Response.json({ error: 'Captcha verification failed' }, { status: 400 })
  }

  // Process form submission...
}
```

### Database Schema

See the "Database Setup (Supabase + Prisma)" section above for the complete Prisma schema. Models:
- **Lead**: Contact form submissions and catalog download captures
- **Category / Subcategory**: Two-level product hierarchy
- **Product / ProductVariant**: Full product catalog with specs and media
- **SurgicalSet / SurgicalSetItem**: Predefined instrument kits
- **QuoteRequest / QuoteItem**: Quote cart submissions with pipeline status
- **Catalog**: Catalog PDF records (supports gated download flag)
- **Subscriber**: Newsletter subscribers
- **Testimonial**: Customer testimonials (admin-managed)
- **BlogPost**: Blog articles with tags and publish status
- **PromotionBanner**: Site-wide promotional banners with expiry
- **PressRelease**: Press releases with images
- **User**: Admin users for authentication

### API Routes Structure (Planned)
```
# Public
/api/contact              - POST: Submit contact form (rate limited, CAPTCHA)
/api/quotes               - POST: Submit quote request (rate limited, CAPTCHA)
/api/catalog/download     - POST: Gated download — capture email, return file URL
/api/newsletter/subscribe - POST: Subscribe email to newsletter
/api/products             - GET: List products (with search/filter query params)
/api/products/[slug]      - GET: Single product detail
/api/categories           - GET: List categories + subcategories
/api/instrument-finder    - GET: ?procedure=X → list of instruments
/api/surgical-sets        - GET: List all surgical sets
/api/surgical-sets/[slug] - GET: Single set with items
/api/press-releases       - GET: Published press releases
/api/blog                 - GET: Published blog posts
/api/blog/[slug]          - GET: Single blog post

# Admin (authenticated)
/api/admin/stats          - GET: Dashboard stats
/api/admin/quotes         - GET: All quotes (filterable by status)
/api/admin/quotes/[id]    - PUT: Update status / assign
/api/admin/leads          - GET: All leads; ?export=csv for CSV download
/api/admin/products       - GET, POST
/api/admin/products/[id]  - PUT, DELETE (soft)
/api/admin/categories     - GET, POST, PUT, DELETE
/api/admin/surgical-sets  - GET, POST, PUT, DELETE
/api/admin/testimonials   - GET, POST, PUT, DELETE
/api/admin/banners        - GET, POST, PUT, DELETE
/api/admin/blog           - GET, POST, PUT, DELETE
/api/admin/press-releases - GET, POST, PUT, DELETE
/api/admin/newsletter/send - POST: Send newsletter to all active subscribers
/api/admin/audit-logs     - GET: Audit log viewer

# Auth
/api/auth/login           - POST: Admin login (rate limited, CAPTCHA)
/api/auth/logout          - POST: Admin logout
/api/auth/session         - GET: Check session status
```

**Security Middleware** (apply to all API routes):
- Input validation and sanitization
- Rate limiting (stricter on auth and form submission routes)
- CORS configuration
- Authentication checks (where required)
- CSRF protection

### Component Architecture (Planned)
```
components/
├── layout/
│   ├── Navbar.js (exists, needs update)
│   ├── Footer.js
│   ├── LoadingScreen.js
│   └── CookieConsentBanner.js
├── forms/
│   ├── ContactForm.js
│   ├── QuoteSubmitForm.js
│   ├── CatalogDownloadGate.js   # Email gate before catalog PDF
│   ├── NewsletterSignup.js
│   └── PressReleaseForm.js
├── ui/
│   ├── Button.js
│   ├── Input.js
│   ├── Card.js
│   ├── Badge.js                 # For certifications / tags
│   └── PromotionBanner.js
├── products/
│   ├── ProductCard.js
│   ├── ProductGrid.js
│   ├── ProductDetail.js
│   ├── ProductSearch.js
│   ├── FilterSidebar.js
│   └── VariantSelector.js
├── quote/
│   ├── QuoteCart.js             # Floating cart drawer
│   ├── QuoteCartItem.js
│   └── AddToQuoteButton.js
├── features/
│   ├── InstrumentFinder.js      # Procedure → instruments tool
│   ├── SurgicalSetCard.js
│   ├── CatalogViewer.js
│   ├── SearchBar.js
│   ├── LanguageSwitcher.js
│   ├── CertificationsBadge.js
│   ├── TestimonialsSection.js
│   ├── GlobalReachMap.js
│   └── WhatsAppButton.js        # Floating WhatsApp CTA
└── blog/
    ├── BlogCard.js
    └── BlogContent.js
```

## Development Notes

### Design & Styling
- **Brand Color**: Always use `#0168b3` as the primary brand color throughout the application
- Configure Tailwind with custom brand colors before building components
- Test color contrast ratios to maintain WCAG compliance with brand colors

### Forms & Validation
- Use React Hook Form for form handling with Zod for validation
- Use `zod` schemas for both client and server-side validation
- Sanitize inputs with libraries like `DOMPurify` or `validator.js`

### Database & ORM
- **Using**: Prisma with PostgreSQL (Supabase)
- Always use Prisma Client methods (automatically parameterized)
- Run `bunx prisma generate` after schema changes
- Run `bunx prisma migrate dev` for development migrations
- Use `bunx prisma studio` to view/edit data with GUI
- Never directly modify the database - use migrations

### Authentication & Security
- NextAuth.js recommended for Next.js App Router
- Use `bcrypt` (14+ rounds) or `argon2` for password hashing
- Implement `next-rate-limit` or `express-rate-limit` for API protection
- **CAPTCHA**: Use hCaptcha (https://docs.hcaptcha.com/)
  - Install: `npm install @hcaptcha/react-hcaptcha` or `bun add @hcaptcha/react-hcaptcha`
  - Get site key and secret key from hCaptcha dashboard
  - Add to environment variables: `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` and `HCAPTCHA_SECRET_KEY`
- Add security headers with `next.config.mjs`:
  ```javascript
  headers: [
    {
      key: 'X-Frame-Options',
      value: 'DENY'
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'Referrer-Policy',
      value: 'origin-when-cross-origin'
    }
  ]
  ```

### File Uploads
- For file uploads (catalog PDFs, press release images), consider Vercel Blob or AWS S3
- Validate file types and sizes on both client and server
- Scan uploaded files for malware if possible

### Internationalization
- For i18n, consider next-intl or next-i18next

### Error Handling
- Implement proper error boundaries for production-ready error handling
- Never expose sensitive error details to clients
- Log errors securely for debugging

### Quote Cart State
- Persist quote cart in `localStorage` (client-side)
- Cart syncs across tabs via `storage` event listener
- Cart cleared after successful quote submission
- Show item count badge on cart icon in Navbar

### Email (Nodemailer)
- Use Nodemailer with SMTP for transactional emails
- Templates for: new quote alert (admin), quote confirmation (user), newsletter
- Keep HTML templates in `src/lib/email/templates/`
- Always include plain-text fallback alongside HTML

### CRM Sync
- Push new QuoteRequest to CRM immediately after DB save
- CRM sync failure must NOT block the API response — fire-and-forget with error logging
- Map: QuoteRequest → CRM Lead/Opportunity; Lead → CRM Contact

### Analytics Events
- Track with GA4 custom events: `add_to_quote`, `quote_submitted`, `catalog_downloaded`, `instrument_finder_used`
- Use `gtag()` via Next.js Script strategy `afterInteractive`

---

## Future Requirements

| ID     | Feature             | Description                                                  |
| ------ | ------------------- | ------------------------------------------------------------ |
| FUT-01 | Customer Accounts   | Registered customer login, order history, saved quotes       |
| FUT-02 | Online Payments     | Move from quote-only to direct online ordering with payment  |
| FUT-03 | Inventory Tracking  | Real-time stock levels per product/variant                   |
| FUT-04 | Multi-language      | Full EN / AR (Arabic RTL) localization                       |
| FUT-05 | Order Tracking      | Customers track shipment status post-order                   |
| FUT-06 | 2FA for Admin       | TOTP-based two-factor authentication for admin accounts      |
| FUT-07 | Refresh Tokens      | JWT refresh token rotation for longer-lived admin sessions   |
| FUT-08 | Mobile App          | React Native or PWA for sales team CRM access on mobile      |

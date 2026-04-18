# Image Assets Directory

This directory contains all image assets for the Surgical Essence website.

## Directory Structure

- **`logo/`** - Company logos and brand marks
  - Current: `SurgicalEssenceLogo.png`
  - Add variations: light version, icon-only, SVG format

- **`hero/`** - Hero section images
  - Homepage hero background
  - Large banner images

- **`products/`** - Surgical instrument product images
  - Individual product photos
  - Product category images
  - Catalog thumbnails

- **`certifications/`** - Certification badges and documents
  - Quality standard badges
  - ISO certifications
  - Compliance logos

- **`team/`** - Team and company photos
  - Leadership photos
  - Factory/facility images
  - Team photos

## Image Guidelines

1. **Format**: Prefer WebP or SVG when possible, fallback to PNG/JPG
2. **Naming**: Use lowercase with hyphens (e.g., `surgical-scissors-01.jpg`)
3. **Size**: Optimize images before adding (use online tools or `next/image` will handle it)
4. **Alt Text**: Always provide descriptive alt text when using images in components

## Usage in Code

```jsx
import Image from 'next/image'

<Image
  src="/images/logo/SurgicalEssenceLogo.png"
  alt="Surgical Essence Logo"
  width={200}
  height={60}
/>
```

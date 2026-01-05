# Open Journal

A minimal, elegant blog theme for Astro.

## Features

- Clean, typography-focused design
- Responsive layout
- Blog pagination
- RSS feed generation
- Sitemap generation
- SCSS styling with CSS custom properties
- Social media links
- Contact form support (via Formspree)
- SEO-friendly markup

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
/
├── public/
│   ├── images/
│   └── js/
├── src/
│   ├── components/
│   ├── content/blog/
│   ├── data/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   └── utils/
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Configuration

Edit `src/data/settings.ts` to customize:

- Site title and tagline
- Social media links
- Menu items
- Contact form settings

Edit `src/consts.ts` to customize:

- Site URL
- Posts per page
- Author name

## Content

Blog posts are written in Markdown and stored in `src/content/blog/`.

### Front Matter

```yaml
---
title: Post Title
date: 2024-01-01
categories: [category1, category2]
tags: [tag1, tag2]
featured_image: /images/blog/image.jpg
excerpt: A brief description of the post
---
```

## License

See LICENSE.md for details.

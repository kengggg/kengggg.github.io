# Jekyll to Astro Migration Plan

## Overview

This document outlines the complete migration plan from Jekyll 4.4.1 to Astro for **patipat.blog**. The goal is to preserve all existing functionality, design, and content while gaining Astro's benefits (faster builds, better DX, and modern tooling).

---

## Current Site Summary

| Aspect | Current State |
|--------|---------------|
| **Framework** | Jekyll 4.4.1 |
| **Theme** | Journal (JekyllThemes.io) - heavily customized |
| **Blog Posts** | 17 published, 2 drafts |
| **Pages** | 1 (About) |
| **Layouts** | 4 (default, page, post, project) |
| **Components** | 5 (header, footer, socials, contact-form, demo-post) |
| **SCSS Files** | 13 files with responsive design |
| **JavaScript** | Vanilla JS (833 lines) |
| **Features** | Pagination (6/page), RSS, Sitemap, Social meta, Syntax highlighting, AJAX loading |

---

## Migration Strategy

### Phase 1: Project Setup & Configuration
### Phase 2: Asset Migration (CSS/SCSS, JS, Images)
### Phase 3: Layout & Component Migration
### Phase 4: Content Migration (Posts, Pages)
### Phase 5: Feature Implementation (Pagination, RSS, Sitemap)
### Phase 6: Testing & Deployment

---

## Phase 1: Project Setup & Configuration

### 1.1 Initialize Astro Project

Create new Astro project in a separate directory or convert in-place:

```bash
# Option A: Fresh start (recommended for clean migration)
npm create astro@latest patipat-astro -- --template minimal

# Option B: In-place conversion
npm init astro
```

### 1.2 Install Required Dependencies

```bash
# Core dependencies
npm install @astrojs/rss @astrojs/sitemap astro-icon

# For SCSS support
npm install -D sass

# For syntax highlighting (already included in Astro)
# Shiki is default, or use Prism if preferred

# Optional: For image optimization
npm install @astrojs/image sharp
```

### 1.3 Astro Configuration

**Create `astro.config.mjs`:**

```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://patipat.blog',
  integrations: [
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light', // or match current Rouge theme
    },
    remarkPlugins: [],
    rehypePlugins: [],
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Import mixins globally if needed
        }
      }
    }
  }
});
```

### 1.4 Directory Structure Mapping

| Jekyll | Astro |
|--------|-------|
| `_config.yml` | `astro.config.mjs` + `src/consts.ts` |
| `_data/settings.yml` | `src/data/settings.ts` (or JSON) |
| `_layouts/` | `src/layouts/` |
| `_includes/` | `src/components/` |
| `_posts/` | `src/content/blog/` |
| `_pages/` | `src/pages/` (or `src/content/pages/`) |
| `_drafts/` | `src/content/blog/` with `draft: true` |
| `_sass/` | `src/styles/` |
| `css/` | `src/styles/` |
| `js/` | `src/scripts/` or `public/js/` |
| `images/` | `public/images/` |

### 1.5 Configuration Migration

**Create `src/consts.ts`:**

```typescript
// Site configuration (from _config.yml)
export const SITE_TITLE = 'patipat.org';
export const SITE_URL = 'https://patipat.blog';
export const SITE_DESCRIPTION = 'Personal blog of Patipat "Keng" Susumpow';
export const POSTS_PER_PAGE = 6;

// Permalink patterns
export const POST_PERMALINK = '/blog/:slug';
```

**Create `src/data/settings.ts`:**

```typescript
// Migrated from _data/settings.yml
export const settings = {
  basic: {
    site_title: 'patipat.org',
    site_tagline: '',
    favicon_image: '/images/favicon.ico',
  },
  header: {
    logo_image: '',
    logo_width: 150,
    overlay_opacity: 0.8,
  },
  menu: [
    { title: 'Home', url: '/' },
    { title: 'About', url: '/about' },
  ],
  grid: {
    spacing: 20,
  },
  social: {
    twitter_url: 'https://twitter.com/kengggg',
    github_url: 'https://github.com/kengggg',
  },
  colors: {
    accent: '#A2DED0',
    text_dark: '#2A2F36',
    text_medium: '#6C7A89',
    text_light: '#ABB7B7',
    background: '#ffffff',
    background_alt: '#F5F7FA',
    border: '#dddddd',
    error: '#D64541',
    overlay: '#161B21',
  },
  fonts: {
    title_family: '"IBM Plex Sans Thai Looped", "Merriweather", sans-serif',
    body_family: '"Thonburi", "IBM Plex Sans Thai Looped", "Muli", sans-serif',
    embed_url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@400;600&family=Merriweather:wght@400;700&family=Muli:wght@400;600&display=swap',
  },
  advanced: {
    ajax_loading: true,
    analytics_code: '',
    custom_styles: '',
    header_js: '',
    footer_js: '',
  },
};
```

---

## Phase 2: Asset Migration

### 2.1 SCSS Migration

**Directory Structure:**
```
src/styles/
├── global.scss          # Main entry (from css/style.scss)
├── _reset.scss          # CSS reset
├── _mixins.scss         # Responsive mixins
├── _plugins.scss        # Plugin styles
├── _basic.scss          # Base typography
├── components/
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _content.scss
│   ├── _blog.scss
│   ├── _gallery.scss
│   ├── _portfolio.scss
│   ├── _socials.scss
│   ├── _contact-form.scss
│   └── _syntax.scss
└── _variables.scss      # New: CSS custom properties from settings
```

**Key Changes:**

1. **Convert SCSS variables to CSS Custom Properties** for dynamic theming:
   ```scss
   // _variables.scss
   :root {
     --color-accent: #{$accent};
     --color-text-dark: #{$text_dark};
     // ... etc
   }
   ```

2. **Update imports** to use `@use` instead of deprecated `@import`:
   ```scss
   @use 'sass:color';
   @use 'variables' as vars;
   ```

3. **No changes needed** for Sass 2.0/3.0 syntax - already updated.

### 2.2 JavaScript Migration

**Option A: Keep as-is (Recommended for exact parity)**
- Copy `js/journal.js` to `public/js/journal.js`
- Include via script tag in layout

**Option B: Modernize with Astro**
- Convert to ES modules
- Use Astro's built-in client-side hydration
- Split into smaller modules

**Migration Steps:**
```
src/scripts/
├── journal.js           # Main script (can be split)
├── utils/
│   ├── debounce.js
│   └── throttle.js
└── components/
    ├── mobile-menu.js
    ├── ajax-loading.js
    └── page-loader.js
```

### 2.3 Image Migration

Copy directly with same structure:
```bash
cp -r images/ public/images/
```

**Optional Optimization:**
- Use `@astrojs/image` for automatic optimization
- Convert to WebP/AVIF formats
- Implement lazy loading

---

## Phase 3: Layout & Component Migration

### 3.1 Layout Conversion

**Jekyll → Astro Layout Mapping:**

| Jekyll Layout | Astro Layout |
|---------------|--------------|
| `_layouts/default.html` | `src/layouts/BaseLayout.astro` |
| `_layouts/page.html` | `src/layouts/PageLayout.astro` |
| `_layouts/post.html` | `src/layouts/PostLayout.astro` |
| `_layouts/project.html` | `src/layouts/ProjectLayout.astro` |

**BaseLayout.astro (from default.html):**

```astro
---
// src/layouts/BaseLayout.astro
import { settings } from '../data/settings';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.scss';

interface Props {
  title: string;
  description?: string;
  featuredImage?: string;
  type?: 'website' | 'article';
}

const { title, description, featuredImage, type = 'website' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content={description}>
  <link rel="canonical" href={canonicalURL}>

  <!-- Favicon -->
  <link rel="icon" href={settings.basic.favicon_image}>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href={settings.fonts.embed_url} rel="stylesheet">

  <!-- Open Graph / Twitter -->
  <meta property="og:type" content={type}>
  <meta property="og:url" content={canonicalURL}>
  <meta property="og:title" content={title}>
  <meta property="og:description" content={description}>
  {featuredImage && <meta property="og:image" content={featuredImage}>}

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content={title}>
  <meta name="twitter:description" content={description}>
  {featuredImage && <meta name="twitter:image" content={featuredImage}>}
</head>
<body>
  <!-- SVG Sprite (inline) -->
  <svg style="display:none">
    <!-- Include all icon symbols here -->
  </svg>

  <!-- Page Loader -->
  <div class="page-loader">
    <div class="loader">
      <div class="loader__circlespin"></div>
    </div>
  </div>

  <div class="page" data-url={canonicalURL}>
    <Header />
    <main class="page__content">
      <slot />
    </main>
    <Footer />
  </div>

  <script src="/js/journal.js"></script>
</body>
</html>
```

**PostLayout.astro (from post.html):**

```astro
---
// src/layouts/PostLayout.astro
import BaseLayout from './BaseLayout.astro';
import { formatDate } from '../utils/date';

interface Props {
  frontmatter: {
    title: string;
    date: Date;
    excerpt?: string;
    featured_image?: string;
    categories?: string[];
    tags?: string[];
  };
}

const { frontmatter } = Astro.props;
---

<BaseLayout
  title={frontmatter.title}
  description={frontmatter.excerpt}
  featuredImage={frontmatter.featured_image}
  type="article"
>
  <article class="single">
    <header class="section-hero" style={frontmatter.featured_image ? `background-image: url(${frontmatter.featured_image})` : ''}>
      <div class="section-hero__overlay"></div>
      <div class="section-hero__content">
        <h1 class="post-title">{frontmatter.title}</h1>
        <time class="post-date">{formatDate(frontmatter.date)}</time>
      </div>
    </header>
    <div class="post-content">
      <slot />
    </div>
  </article>
</BaseLayout>
```

### 3.2 Component Conversion

**Jekyll → Astro Component Mapping:**

| Jekyll Include | Astro Component |
|----------------|-----------------|
| `_includes/header.html` | `src/components/Header.astro` |
| `_includes/footer.html` | `src/components/Footer.astro` |
| `_includes/socials.html` | `src/components/SocialLinks.astro` |
| `_includes/contact-form.html` | `src/components/ContactForm.astro` |

**Header.astro Example:**

```astro
---
// src/components/Header.astro
import { settings } from '../data/settings';
import SocialLinks from './SocialLinks.astro';

interface Props {
  featuredImage?: string;
}

const { featuredImage } = Astro.props;
---

<header class="header" style={featuredImage ? `background-image: url(${featuredImage})` : ''}>
  <div class="header__overlay"></div>

  <div class="header__content">
    {settings.header.logo_image ? (
      <a href="/" class="header__logo">
        <img src={settings.header.logo_image} alt={settings.basic.site_title} width={settings.header.logo_width}>
      </a>
    ) : (
      <a href="/" class="header__title">{settings.basic.site_title}</a>
    )}

    {settings.basic.site_tagline && (
      <p class="header__tagline">{settings.basic.site_tagline}</p>
    )}

    <nav class="menu">
      <button class="menu__toggle" aria-label="Toggle menu">
        <svg class="icon icon--menu"><use href="#icon-menu"></use></svg>
        <svg class="icon icon--close"><use href="#icon-close"></use></svg>
      </button>

      <ul class="menu__items">
        {settings.menu.map((item) => (
          <li class="menu__item">
            <a href={item.url} class="menu__link">{item.title}</a>
          </li>
        ))}
      </ul>
    </nav>

    <SocialLinks />
  </div>
</header>
```

**SocialLinks.astro Example:**

```astro
---
// src/components/SocialLinks.astro
import { settings } from '../data/settings';

// Map setting keys to icon names
const socialIcons: Record<string, string> = {
  twitter_url: 'twitter',
  github_url: 'github',
  facebook_url: 'facebook',
  linkedin_url: 'linkedin',
  instagram_url: 'instagram',
  youtube_url: 'youtube',
  // ... add all 20+ supported networks
};

const socialLinks = Object.entries(settings.social)
  .filter(([_, url]) => url)
  .map(([key, url]) => ({
    url,
    icon: socialIcons[key] || key.replace('_url', ''),
  }));
---

{socialLinks.length > 0 && (
  <ul class="socials">
    {socialLinks.map(({ url, icon }) => (
      <li class="socials__item">
        <a href={url} class="socials__link" target="_blank" rel="noopener noreferrer">
          <svg class="icon">
            <use href={`#icon-${icon}`}></use>
          </svg>
        </a>
      </li>
    ))}
  </ul>
)}
```

**ContactForm.astro Example:**

```astro
---
// src/components/ContactForm.astro
interface Props {
  formAction?: string;
  confirmationUrl?: string;
  emailSubject?: string;
  sendButtonText?: string;
}

const {
  formAction = 'https://formspree.io/your-email',
  confirmationUrl = '/thank-you',
  emailSubject = 'New contact form submission',
  sendButtonText = 'Send Message',
} = Astro.props;
---

<form action={formAction} method="POST" class="contact-form">
  <input type="hidden" name="_subject" value={emailSubject}>
  <input type="hidden" name="_next" value={confirmationUrl}>

  <!-- Honeypot spam protection -->
  <input type="text" name="_gotcha" style="display:none">

  <div class="contact-form__field">
    <label for="email">Email *</label>
    <input type="email" id="email" name="email" required>
  </div>

  <div class="contact-form__field">
    <label for="name">Name *</label>
    <input type="text" id="name" name="name" required>
  </div>

  <div class="contact-form__field">
    <label for="message">Message *</label>
    <textarea id="message" name="message" rows="5" required></textarea>
  </div>

  <button type="submit" class="contact-form__submit">
    {sendButtonText}
  </button>
</form>
```

---

## Phase 4: Content Migration

### 4.1 Content Collections Setup

**Create `src/content/config.ts`:**

```typescript
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    featured_image: z.string().optional(),
    excerpt: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    featured_image: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  pages: pagesCollection,
};
```

### 4.2 Blog Post Migration

**File Structure:**
```
src/content/blog/
├── 2019-03-04-permanence.md
├── 2019-03-10-alita-battle-angel.md
├── 2019-03-26-the-space-barons.md
├── ... (all 17 posts)
└── drafts/                    # Optional: organize drafts
    ├── demo-post.md
    └── democracy-is-a-flower-pot.md
```

**Front Matter Changes:**

Jekyll format:
```yaml
---
layout: post
title: 'Article Title'
date: 2019-03-04
categories: [works]
tags: [tag1, tag2]
featured_image: /images/blog/image.jpg
excerpt: 'Brief description'
---
```

Astro format (minimal changes):
```yaml
---
title: 'Article Title'
date: 2019-03-04
categories: ['works']
tags: ['tag1', 'tag2']
featured_image: '/images/blog/image.jpg'
excerpt: 'Brief description'
---
```

**Key Differences:**
- Remove `layout:` (handled by routing)
- Date format stays the same (YAML dates)
- Arrays need proper YAML array syntax

**Migration Script (Node.js):**

```javascript
// scripts/migrate-posts.js
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const POSTS_DIR = './_posts';
const OUTPUT_DIR = './src/content/blog';

async function migratePosts() {
  const files = await fs.readdir(POSTS_DIR);

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const content = await fs.readFile(path.join(POSTS_DIR, file), 'utf-8');
    const { data, content: body } = matter(content);

    // Transform front matter
    const newFrontmatter = {
      title: data.title,
      date: data.date,
      categories: data.categories || [],
      tags: data.tags || [],
      featured_image: data.featured_image || null,
      excerpt: data.excerpt || null,
      draft: false,
    };

    // Remove layout from front matter
    delete newFrontmatter.layout;

    // Write new file
    const newContent = matter.stringify(body, newFrontmatter);
    await fs.writeFile(path.join(OUTPUT_DIR, file), newContent);

    console.log(`Migrated: ${file}`);
  }
}

migratePosts();
```

### 4.3 Page Migration

**About Page (`src/pages/about.astro`):**

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import { getEntry } from 'astro:content';

const aboutPage = await getEntry('pages', 'about');
const { Content } = await aboutPage.render();
---

<PageLayout frontmatter={aboutPage.data}>
  <Content />
</PageLayout>
```

Or as pure Astro page:
```astro
---
// src/pages/about.astro
import PageLayout from '../layouts/PageLayout.astro';
---

<PageLayout
  title="About"
  featuredImage="/images/generic/main-cover.jpg"
>
  <!-- Content from _pages/about.md -->
  <p>Content here...</p>
</PageLayout>
```

---

## Phase 5: Feature Implementation

### 5.1 Blog Pagination

**Create `src/pages/blog/[...page].astro`:**

```astro
---
import type { GetStaticPaths, Page } from 'astro';
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import BlogPostCard from '../../components/BlogPostCard.astro';
import { POSTS_PER_PAGE } from '../../consts';

export const getStaticPaths: GetStaticPaths = async ({ paginate }) => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const sortedPosts = posts.sort((a, b) =>
    new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return paginate(sortedPosts, { pageSize: POSTS_PER_PAGE });
};

interface Props {
  page: Page;
}

const { page } = Astro.props;
---

<BaseLayout title="Blog">
  <section class="blog">
    <div class="blog__posts">
      {page.data.map((post) => (
        <BlogPostCard post={post} />
      ))}
    </div>

    <nav class="pagination">
      {page.url.prev && (
        <a href={page.url.prev} class="pagination__prev">
          <svg class="icon"><use href="#icon-arrow-left"></use></svg>
          Newer Posts
        </a>
      )}
      {page.url.next && (
        <a href={page.url.next} class="pagination__next">
          Older Posts
          <svg class="icon"><use href="#icon-arrow-right"></use></svg>
        </a>
      )}
    </nav>
  </section>
</BaseLayout>
```

### 5.2 Individual Blog Posts

**Create `src/pages/blog/[slug].astro`:**

```astro
---
import { getCollection, type CollectionEntry } from 'astro:content';
import PostLayout from '../../layouts/PostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

interface Props {
  post: CollectionEntry<'blog'>;
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<PostLayout frontmatter={post.data}>
  <Content />
</PostLayout>
```

### 5.3 RSS Feed

**Create `src/pages/feed.xml.js`:**

```javascript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from '../consts';

export async function GET(context) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.excerpt,
        link: `/blog/${post.slug}/`,
      })),
  });
}
```

### 5.4 Sitemap

Already configured via `@astrojs/sitemap` in Phase 1.

### 5.5 404 Page

**Create `src/pages/404.astro`:**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Page Not Found">
  <section class="section section--hero">
    <div class="container">
      <h1>404</h1>
      <p>Page not found</p>
      <a href="/" class="button">Go Home</a>
    </div>
  </section>
</BaseLayout>
```

### 5.6 Syntax Highlighting

Astro uses Shiki by default. To match Rouge theme:

```javascript
// astro.config.mjs
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: 'github-light', // or create custom theme to match Rouge
      wrap: true,
    },
  },
});
```

### 5.7 AJAX Page Loading (Optional)

The existing `journal.js` handles AJAX loading. For Astro:

**Option A: Keep existing implementation**
- Works with `public/js/journal.js`
- No changes needed

**Option B: Use View Transitions (Astro 3.0+)**
```astro
---
// In BaseLayout.astro
import { ViewTransitions } from 'astro:transitions';
---

<head>
  <ViewTransitions />
</head>
```

---

## Phase 6: Testing & Deployment

### 6.1 Testing Checklist

**Functionality Tests:**
- [ ] All 17 blog posts render correctly
- [ ] About page renders correctly
- [ ] Pagination works (6 posts per page)
- [ ] RSS feed generates at /feed.xml
- [ ] Sitemap generates at /sitemap.xml
- [ ] 404 page displays correctly
- [ ] Contact form submits to Formspree
- [ ] Mobile menu toggles
- [ ] Social links work
- [ ] Code syntax highlighting works

**Visual Tests:**
- [ ] Header displays correctly (logo, menu, social icons)
- [ ] Footer displays correctly
- [ ] Typography matches (Thai + English fonts)
- [ ] Colors match (accent #A2DED0, etc.)
- [ ] Featured images display on posts/pages
- [ ] Responsive design at all breakpoints
- [ ] Page loader animation works
- [ ] SVG icons render correctly

**SEO/Meta Tests:**
- [ ] Title tags correct
- [ ] Meta descriptions present
- [ ] Open Graph tags correct
- [ ] Twitter Card tags correct
- [ ] Canonical URLs correct

### 6.2 Deployment Configuration

**GitHub Pages (with GitHub Actions):**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

**Custom Domain (CNAME):**
- Copy `CNAME` file to `public/CNAME`

### 6.3 Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Migration File Checklist

### Files to Create (New)

```
src/
├── consts.ts
├── data/
│   └── settings.ts
├── layouts/
│   ├── BaseLayout.astro
│   ├── PageLayout.astro
│   ├── PostLayout.astro
│   └── ProjectLayout.astro
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── SocialLinks.astro
│   ├── ContactForm.astro
│   ├── BlogPostCard.astro
│   └── SVGSprite.astro
├── pages/
│   ├── index.astro
│   ├── about.astro
│   ├── 404.astro
│   ├── feed.xml.js
│   └── blog/
│       ├── [...page].astro
│       └── [slug].astro
├── content/
│   ├── config.ts
│   └── blog/
│       └── (17 migrated posts)
├── styles/
│   ├── global.scss
│   ├── _variables.scss
│   ├── _reset.scss
│   ├── _mixins.scss
│   ├── _plugins.scss
│   ├── _basic.scss
│   └── components/
│       └── (9 component SCSS files)
├── scripts/
│   └── (optional JS modules)
└── utils/
    └── date.ts

public/
├── images/
│   └── (52 image files)
├── js/
│   └── journal.js
├── CNAME
└── favicon.ico

astro.config.mjs
package.json
tsconfig.json
.github/workflows/deploy.yml
```

### Files to Remove (After Migration)

```
_config.yml
Gemfile
Gemfile.lock
_data/
_layouts/
_includes/
_posts/
_pages/
_drafts/
_sass/
css/
js/
index.html
404.html
.github/workflows/jekyll.yml
```

---

## Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content rendering differences | Medium | Test each post individually; adjust Markdown parser settings |
| SCSS compilation issues | Low | Already using Sass 2.0 syntax; test thoroughly |
| SEO ranking changes | Medium | Keep same URL structure; add redirects if needed |
| Missing Jekyll Liquid features | Medium | Identify all Liquid usage; convert to Astro equivalents |
| AJAX loading breaks | Low | Test with existing JS; use View Transitions as alternative |
| Thai font rendering | Low | Same Google Fonts; verify load order |

---

## Estimated Effort

| Phase | Tasks | Complexity |
|-------|-------|------------|
| Phase 1: Setup | 5 tasks | Low |
| Phase 2: Assets | 3 tasks | Low-Medium |
| Phase 3: Layouts | 8 components | Medium |
| Phase 4: Content | 17 posts + 1 page | Low |
| Phase 5: Features | 7 features | Medium |
| Phase 6: Testing | Full regression | Medium |

---

## Success Criteria

1. **Visual Parity**: Site looks identical to Jekyll version
2. **Content Parity**: All 17 posts and 1 page accessible
3. **Feature Parity**: Pagination, RSS, sitemap, social meta all working
4. **Performance**: Build time under 30 seconds; Lighthouse score 90+
5. **SEO**: No broken links; same URL structure maintained

---

## Next Steps

1. **Review this plan** and confirm approach
2. **Begin Phase 1** - Initialize Astro project
3. **Proceed sequentially** through phases
4. **Test thoroughly** at each phase
5. **Deploy to staging** before production

---

*Plan created: 2026-01-04*
*Target: Preserve all existing functionality while migrating to Astro*

# patipat.org

Keng Susumpow’s personal blog, built as a static Astro 7 site with Markdown content.

## Local development

Use Node.js 24 LTS (`.node-version`) and npm. Node.js 26 is also supported.

```sh
npm ci
npm run dev
```

`npm run build` runs Astro’s type checks and builds `dist/`. Use `npm run preview` to inspect that exact output locally. The site uses standard browser navigation; articles and navigation remain usable with JavaScript disabled. JavaScript only enhances the mobile menu.

## Publishing a post

Create a Markdown file in `src/content/blog/`. The filename may include a date for sorting files; the required `slug` determines the permanent public URL.

```yaml
---
title: My post
slug: my-post
lang: en
date: 2026-10-06
categories: [blog]
tags: [astro]
featured_image: ../../assets/images/blog/my-post.webp
excerpt: A short description of the article.
draft: true
---
```

The URL is `/blog/my-post/`. Slugs must be unique, lowercase words separated by hyphens, without a date prefix. Numeric-only slugs are reserved for pagination. Preserve a published slug when renaming its source file. Date-prefixed article routes are intentionally absent, with no redirects.

Set `lang` to `th` or `en` for the article’s main language. The interface labels remain English. Dates are formatted as calendar dates in UTC, so the build machine’s timezone cannot shift them by a day.

`draft: true` excludes the post from generated article pages, listings, RSS, and the sitemap. To publish, change it to `false` or remove the field. Dates control ordering; a future date does not schedule publication. Files in the top-level `drafts/` directory are outside the content collection.

## Images and embedded content

Store image source files in `src/assets/images/`. Reference them from Markdown using relative paths and descriptive alt text:

```md
![Description of the image](../../assets/images/blog/my-post.webp)
```

Astro generates responsive images with dimensions and native lazy loading. Listing pages load the first card eagerly. For remote images, use an HTML `<img>` with accurate `width`, `height`, `alt`, and `loading="lazy"`; this avoids network-dependent builds. Give every embedded video a descriptive `title`.

Images, video embeds, and tables receive their wrappers during the build. Image paragraphs containing text are preserved. Article Markdown headings start at level two in the generated document because the layout already provides the article title.

Astro 7 uses the explicit `unified()` Markdown processor so the rehype formatting remains active. `compressHTML: true` preserves spaces between inline elements. The collection uses the current `render(post)` and entry `id` APIs, without legacy collection flags.

Previously published `/images/blog/...` and `/images/generic/...` URLs are retained by copying the source image tree into the build output. The pages themselves use Astro’s optimized assets. This keeps one source copy of each image in the repository.

## Configuration

- `src/data/settings.ts`: site identity, URL, author, pagination, font URL, and navigation/social links. Astro config, layouts, and RSS share these values.
- `src/styles/_variables.scss`: colors, typography, spacing, and breakpoints via `_mixins.scss`.
- `src/content.config.ts`: Content Layer glob loader, post schema, and image validation. Entry IDs come from the explicit frontmatter slugs.
- `scripts/content-checks.mjs`: stable-slug validation and compatibility image copies.
- `scripts/rehype-content.mjs`: build-time Markdown presentation.

## Verification

Install browser binaries once, then run the complete suite:

```sh
npx playwright install chromium firefox webkit
npm test
```

The suite includes timezone and slug checks, type checking, a production build, generated-link/metadata/image checks, an isolated build proving that drafts stay unpublished, and Chromium/Firefox/WebKit tests for navigation, history, keyboard access, no-JavaScript reading, responsive images, pagination, and accessibility. Tests create temporary draft fixtures outside the working tree.

Useful focused commands:

```sh
npm run check
npm run test:unit
npm run build && npm run test:build
npm run test:publishing
npm run test:e2e
```

On macOS 27, Playwright Firefox can fail before opening a page because of an [upstream app-data permission issue](https://github.com/microsoft/playwright/issues/42768). To check the other engines locally, use `npm run test:e2e -- --project=chromium --project=webkit`. The Linux CI job still runs all three engines.

The GitHub Actions workflow runs these checks on pull requests and pushes to `main`, rejects high/critical dependency advisories, and retains browser evidence on failure.

## GitHub Pages deployment

After all checks pass on `main`, the workflow uploads the verified `dist/` output and deploys it to [GitHub Pages](https://kengggg.github.io/). Pull requests only run checks. You can also run **Site checks** manually from the Actions tab with `main` selected to verify and redeploy the current version. Deployments in progress are allowed to finish when a newer commit arrives.

The repository's **Settings → Pages → Build and deployment → Source** must be **GitHub Actions**. Astro generates the complete site, including `404.html`; publishing the source branch through the legacy Jekyll build does not work. Only the deployment job receives Pages write and identity-token permissions.

The canonical site URL remains `https://patipat.org` in `src/data/settings.ts`. DNS and custom-domain hosting are configured separately from this GitHub Pages deployment.

## License

See [LICENSE](LICENSE). Third-party image rights remain with their respective owners.

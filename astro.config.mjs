import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { settings } from './src/data/settings.ts';
import { contentChecks } from './scripts/content-checks.mjs';
import rehypeContent from './scripts/rehype-content.mjs';

export default defineConfig({
  site: settings.url,
  // Preserve spaces between inline elements when using Astro 7's Rust compiler.
  compressHTML: true,
  integrations: [
    sitemap(),
    contentChecks(),
  ],
  image: { layout: 'constrained', responsiveStyles: false },
  markdown: {
    processor: unified({ rehypePlugins: [rehypeContent] }),
    shikiConfig: {
      theme: 'github-dark-high-contrast',
      wrap: true,
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        }
      }
    }
  }
});

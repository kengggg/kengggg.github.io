import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://patipat.org',
  integrations: [
    sitemap(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'monokai',
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

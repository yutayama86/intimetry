import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const SITE = process.env.PUBLIC_SITE_URL || 'https://intimetry.com';

export default defineConfig({
  site: SITE,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/contact/thanks/'),
      serialize(item) {
        if (item.url === `${SITE}/`) {
          item.changefreq = 'weekly';
          item.priority = 1.0;
        } else if (item.url.includes('/check/')) {
          item.changefreq = 'monthly';
          item.priority = 0.95;
        } else if (item.url.includes('/articles/')) {
          item.changefreq = 'weekly';
          item.priority = 0.75;
        } else {
          item.changefreq = 'yearly';
          item.priority = 0.4;
        }
        return item;
      },
    }),
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
});

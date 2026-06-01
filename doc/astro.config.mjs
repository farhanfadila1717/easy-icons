// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://farhanfadila1717.github.io',
  base: '/easy_icons',
  vite: {
    plugins: [tailwindcss()]
  }
});
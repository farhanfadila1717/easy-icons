// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://farhan.is-a.dev',
  base: '/easy_icons',
  vite: {
    plugins: [tailwindcss()]
  }
});
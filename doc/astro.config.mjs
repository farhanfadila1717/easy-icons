// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://farhanfadila1717.github.io',
  base: '/easy-icons',
  vite: {
    plugins: [tailwindcss()]
  }
});
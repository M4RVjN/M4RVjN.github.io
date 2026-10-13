// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://m4rvjn.github.io',
  // 輸出 about.html 而非 about/index.html，保留舊網址
  build: { format: 'file' },
  vite: { plugins: [tailwindcss()] },
});

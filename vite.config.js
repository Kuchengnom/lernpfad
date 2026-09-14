import { defineConfig } from 'vite';

// Four entries. index.html is the parent-facing landing page, because that is the
// URL people actually share; lernen.html is the application itself, and the
// manifest's start_url points there so an installed icon skips the landing page.
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        index: 'index.html',
        lernen: 'lernen.html',
        impressum: 'impressum.html',
        datenschutz: 'datenschutz.html',
      },
    },
  },
});

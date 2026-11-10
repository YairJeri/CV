// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://yairjeri.github.io',
  base: '/CV',
  integrations: [preact(), icon()],

  vite: {
    plugins: [tailwindcss()]
  }
});

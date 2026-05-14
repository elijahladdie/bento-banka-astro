// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";

import react from '@astrojs/react';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react()],
  server: {
    allowedHosts: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },

  adapter: node({
    mode: 'standalone',
  }),
});

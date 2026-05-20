// @ts-check
import { defineConfig, memoryCache } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: "server",
  server: {
    allowedHosts: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },

  adapter: node({
    mode: 'standalone',
  }),
  experimental: {
    cache: {
      provider: memoryCache({
        max: 500,
      }),
    },
  }
});

// @ts-check
import { defineConfig, memoryCache } from 'astro/config';

import tailwindcss from "@tailwindcss/vite";

import node from '@astrojs/node';
import { API_BASE_URL } from './src/utils/constants';


// https://astro.build/config
export default defineConfig({
  output: "server",
  server: {
    allowedHosts: true,
  },
  vite: {
    optimizeDeps: {
      exclude: ["@paddle/paddle-js"],
    },
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/api/paddle': {
          target: API_BASE_URL,
          changeOrigin: true,
        },
      },
    },
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

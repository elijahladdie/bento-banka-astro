// @ts-check
import { defineConfig, memoryCache } from 'astro/config';
import { loadEnv } from 'vite';

import tailwindcss from "@tailwindcss/vite";

import node from '@astrojs/node';

const { API_BASE_URL, PUBLIC_API_URL } = loadEnv(
  process.env.NODE_ENV || 'development',
  process.cwd(),
  '',
);

const backendTarget = API_BASE_URL || PUBLIC_API_URL || 'https://staging.api.hikrl.ink';

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
          target: backendTarget,
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

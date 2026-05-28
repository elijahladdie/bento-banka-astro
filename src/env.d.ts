/// <reference types="astro/client" />

import type { AppLocals } from "./types";

interface ImportMetaEnv {
  readonly API_BASE_URL?: string;
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_PADDLE_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  namespace App {
    interface Locals extends AppLocals {}
  }
}

export {};
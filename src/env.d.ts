/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_PADDLE_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
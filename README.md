# Banka Astro App

This project now uses a dedicated server route for pricing data and a shared backend URL configuration so the request flow is easier to maintain.

## Pricing implementation history

### First implementation

The first version fetched pricing directly from the upstream API using a plain string URL inside the server route.

That meant:

- the backend URL was read from `PUBLIC_API_URL`
- requests were assembled with string interpolation
- the pricing endpoint owned both the fetch logic and the cache boundary
- the same upstream base was used everywhere without a dedicated server-only alias

This worked, but it mixed request construction, caching, and environment handling in one place.

### Second implementation

The second version keeps the pricing endpoint, but changes how the upstream request is built and configured.

That means:

- the backend base URL is read from `API_BASE_URL` first,
- the upstream request is created with `new URL(...)` instead of string concatenation
- Astro config now loads env values through `loadEnv`
- Vite dev proxying points `/api/paddle` at the backend target
- the pricing route stays focused on cache behavior and response shaping

This is the cleaner version because the request target is explicit, the config is reusable, and the same backend setting can be used in both local development and server rendering.

## How the pricing flow works now

1. The UI requests `/api/pricing?interval=month` or `/api/pricing?interval=year`.
2. `src/pages/api/pricing.ts` checks the interval, loads the backend base URL, and builds an upstream URL like `/api/paddle/products?interval=month`.
3. `astro.config.mjs` provides the backend target for local dev through the Vite proxy.
4. Astro cache rules keep the pricing response warm for repeated requests in the same running process.

## Cache behavior

Astro caching behaves differently in development and production:

- In `yarn dev`, Astro exposes the cache API, but caching is effectively disabled. Requests are served fresh each time so you can see changes immediately while developing.
- In `yarn build` and `yarn preview`, the configured cache provider is active. Cached responses are reused until they expire, so repeated requests for the same route can be much faster.
- The app uses `memoryCache()` in `astro.config.mjs`, which is an in-process cache. It works while the server process is running, but it resets when the process restarts.

Why this matters for `/api/pricing`:

- The endpoint sets cache rules with `maxAge` and `swr`.
- The first request for an interval such as `month` or `year` still hits the upstream API.
- Subsequent requests in the same preview or production process reuse the cached response until the cache expires.
- In development, you will still see the upstream request on each hit because Astro does not serve cached responses there.

## How to verify

1. Run `yarn build`.
2. Run `yarn preview`.
3. Open `/api/pricing?interval=month` twice.
4. The first request should populate the cache, and the second request should be noticeably faster in the same running process.

## Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `yarn install`         | Installs dependencies                            |
| `yarn dev`             | Starts local dev server at `localhost:4321`      |
| `yarn build`           | Build your production site to `./dist/`          |
| `yarn preview`         | Preview your build locally, before deploying     |
| `yarn astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `yarn astro -- --help` | Get help using the Astro CLI                     |

## Learn More

Feel free to check [Astro documentation](https://docs.astro.build) or jump into [Astro Discord](https://astro.build/chat).

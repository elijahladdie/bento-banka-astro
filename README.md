# Banka Astro App

This project uses Astro route caching for server-rendered responses, including the pricing API proxy.

## Cache behavior

Astro caching behaves differently in development and production:

- In `yarn dev`, Astro exposes the cache API, but caching is effectively disabled. Requests are served fresh each time so you can see changes immediately while developing.
- In `yarn build` and `yarn preview`, the configured cache provider is active. Cached responses are reused until they expire, so repeated requests for the same route can be much faster.
- The app uses `memoryCache()` in `astro.config.mjs`, which is an in-process cache. It works while the server process is running, but it resets when the process restarts.

Why this matters for `/api/pricing`:

- The endpoint sets cache rules with `maxAge` and `swr`.
- The first request for an interval such as `month` or `year` still hits the upstream API.
- Subsequent requests in the same preview/production process reuse the cached response until the cache expires.
- In development, you will still see the upstream request on each hit because Astro does not serve cached responses there.

Why a new Astro API route was needed:

- Astro route caching works at the route response level, not as a general cache wrapper around any arbitrary `fetch` call inside a component.
- The existing pricing fetch lives inside a server-rendered component, so the safest way to make Astro cache the result is to move the upstream request behind a local endpoint and apply `cache.set()` there.
- That local endpoint also gives each interval its own cache key through the query string, which keeps `month` and `year` responses separate.
- Reusing the upstream fetch directly in the component would still leave the request path tied to the component render, which is why the cache boundary had to move into an Astro route.

## How to verify

1. Run `yarn build`.
2. Run `yarn preview`.
3. Open `/api/pricing?interval=month` twice.
4. The first request should populate the cache, and the second request should be noticeably faster in the same running process.

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `yarn install`             | Installs dependencies                            |
| `yarn dev`             | Starts local dev server at `localhost:4321`      |
| `yarn build`           | Build your production site to `./dist/`          |
| `yarn preview`         | Preview your build locally, before deploying     |
| `yarn astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `yarn astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

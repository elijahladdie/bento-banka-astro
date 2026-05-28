import type {
  AstroApiContext,
  PricingCache,
  PricingApiResponse,
  PricingInterval,
} from "../../types";

let cacheStore: PricingCache = {
  month: null,
  year: null,
  loadedAt: null,
};

const CACHE_TTL = 1000 * 60 * 10;

function getApiBaseUrl() {
  return import.meta.env.API_BASE_URL ?? import.meta.env.PUBLIC_API_URL;
}

function buildProductsUrl(interval: PricingInterval) {
  const base = getApiBaseUrl();

  if (!base) {
    throw new Error("Missing API base URL");
  }

  const url = new URL("/api/paddle/products", base);
  url.searchParams.set("interval", interval);
  return url;
}

async function loadPricing() {
  const [monthUrl, yearUrl] = ["month", "year"].map((interval) =>
    buildProductsUrl(interval as PricingInterval),
  );

  const [monthRes, yearRes] = await Promise.all([
    fetch(monthUrl, {
      headers: { Accept: "application/json" },
    }),
    fetch(yearUrl, {
      headers: { Accept: "application/json" },
    }),
  ]);

  if (!monthRes.ok || !yearRes.ok) {
    throw new Error("Failed to fetch pricing");
  }

  const [month, year] = await Promise.all([
    monthRes.json(),
    yearRes.json(),
  ]);

  cacheStore = {
    month,
    year,
    loadedAt: Date.now(),
  };
}

function isValidCache() {
  return (
    cacheStore.month &&
    cacheStore.year &&
    cacheStore.loadedAt &&
    Date.now() - cacheStore.loadedAt < CACHE_TTL
  );
}

export async function GET({ url, cache }: AstroApiContext) {
  const interval = url.searchParams.get("interval") === "year"
    ? "year"
    : "month";
  cache.set({
    maxAge: 60 * 10,
    swr: 60 * 60,
    tags: ["pricing"],
  });

  // lazy load once
  if (!isValidCache()) {
    await loadPricing();
  }
  const selected = cacheStore[interval];

  return new Response(JSON.stringify(selected), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=600",
    },
  });
}
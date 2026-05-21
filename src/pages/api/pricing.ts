import type { APIContext } from "astro";

type PricingCache = {
  month: any | null;
  year: any | null;
  loadedAt: number | null;
};

let cacheStore: PricingCache = {
  month: null,
  year: null,
  loadedAt: null,
};

const CACHE_TTL = 1000 * 60 * 10;

async function loadPricing() {
  const base = import.meta.env.PUBLIC_API_URL;

  const [monthRes, yearRes] = await Promise.all([
    fetch(`${base}/api/paddle/products?interval=month`, {
      headers: { Accept: "application/json" },
    }),
    fetch(`${base}/api/paddle/products?interval=year`, {
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

export async function GET({ url, cache }: APIContext) {
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
import type { AstroApiContext } from "../../types";

function getApiBaseUrl() {
  return import.meta.env.API_BASE_URL ?? import.meta.env.PUBLIC_API_URL;
}

function buildProductsUrl(interval: "month" | "year") {
  const base = getApiBaseUrl();

  if (!base) {
    throw new Error("Missing API base URL");
  }

  const url = new URL("/api/paddle/products", base);
  url.searchParams.set("interval", interval);
  return url;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let cachedResponse:
  | {
      data: {
        month: unknown;
        year: unknown;
      };
      expiresAt: number;
    }
  | null = null;

export async function GET({}: AstroApiContext) {
  // Return cached data if still valid
  if (
    cachedResponse &&
    cachedResponse.expiresAt > Date.now()
  ) {
    return Response.json(cachedResponse.data, {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  }

  const [monthRes, yearRes] = await Promise.all([
    fetch(buildProductsUrl("month"), {
      headers: {
        Accept: "application/json",
      },
    }),
    fetch(buildProductsUrl("year"), {
      headers: {
        Accept: "application/json",
      },
    }),
  ]);

  if (!monthRes.ok || !yearRes.ok) {
    throw new Error("Failed to fetch pricing data");
  }

  const [month, year] = await Promise.all([
    monthRes.json(),
    yearRes.json(),
  ]);

  const data = {
    month,
    year,
  };

  cachedResponse = {
    data,
    expiresAt: Date.now() + CACHE_TTL,
  };

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
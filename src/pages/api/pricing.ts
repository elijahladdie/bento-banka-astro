import type { APIContext } from "astro";

export async function GET({ cache, url }: APIContext) {
  const interval = url.searchParams.get("interval") === "year" ? "year" : "month";

  cache.set({
    maxAge: 60 * 10,
    swr: 60 * 30,
    tags: ["pricing", `pricing-${interval}`],
  });

  const upstreamResponse = await fetch(
    `${import.meta.env.PUBLIC_API_URL}/api/paddle/products?interval=${interval}`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!upstreamResponse.ok) {
    return Response.json(
      {
        message: `Pricing request failed with status ${upstreamResponse.status}`,
      },
      { status: upstreamResponse.status },
    );
  }

  const payload = await upstreamResponse.json();

  return Response.json(payload);
}
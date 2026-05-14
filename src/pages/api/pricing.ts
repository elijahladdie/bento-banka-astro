export async function GET({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const interval = url.searchParams.get("interval") ?? "month";

    const upstream = await fetch(
      `https://staging.api.hikrl.ink/api/paddle/products?interval=${encodeURIComponent(
        interval
      )}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const payload = await upstream.json();

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: "Upstream error", status: upstream.status, payload }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

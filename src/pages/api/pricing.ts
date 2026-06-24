import { AstroApiContext } from '../../types';
import { CACHE_TTL, API_BASE_URL } from '../../utils/constants';

function buildProductsUrl(interval: 'month' | 'year') {
  const base = API_BASE_URL;

  if (!base) {
    throw new Error('Missing API base URL');
  }

  const url = new URL('/api/paddle/products', base);
  url.searchParams.set('interval', interval);
  return url;
}

let cachedResponse: {
  data: {
    month: unknown;
    year: unknown;
  };
  expiresAt: number;
} | null = null;

export async function GET(_context: AstroApiContext) {
  // Return cached data if still valid
  if (cachedResponse && cachedResponse.expiresAt > Date.now()) {
    return Response.json(cachedResponse.data, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  }

  const [monthRes, yearRes] = await Promise.all([
    fetch(buildProductsUrl('month'), {
      headers: {
        Accept: 'application/json',
      },
    }),
    fetch(buildProductsUrl('year'), {
      headers: {
        Accept: 'application/json',
      },
    }),
  ]);
  if (!monthRes.ok || !yearRes.ok) {
    throw new Error('Failed to fetch pricing data');
  }

  const [month, year] = await Promise.all([monthRes.json(), yearRes.json()]);

  const data = {
    month: month,
    year: year,
  };

  cachedResponse = {
    data,
    expiresAt: Date.now() + CACHE_TTL,
  };

  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=300',
    },
  });
}

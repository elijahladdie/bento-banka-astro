import { loadEnv } from 'vite';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const { API_BASE_URL } = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
export { API_BASE_URL, CACHE_TTL };

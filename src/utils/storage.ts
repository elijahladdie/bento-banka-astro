type StorageScope = "local" | "session";

type CookieOptions = {
  path?: string;
  maxAge?: number;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
};

const hasWindow = typeof window !== "undefined";

function getWebStorage(scope: StorageScope) {
  if (!hasWindow) return null;

  try {
    return scope === "session" ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function readStorage(scope: StorageScope, key: string) {
  const storage = getWebStorage(scope);

  if (!storage) return null;

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(scope: StorageScope, key: string, value: string) {
  const storage = getWebStorage(scope);

  if (!storage) return;

  try {
    storage.setItem(key, value);
  } catch {
    // Ignore storage quota / privacy mode failures.
  }
}

export function removeStorage(scope: StorageScope, key: string) {
  const storage = getWebStorage(scope);

  if (!storage) return;

  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

export function readCookie(name: string) {
  if (!hasWindow && typeof document === "undefined") return null;

  const source = typeof document !== "undefined" ? document.cookie : "";
  const match = source.match(new RegExp(`(?:^|; )${name}=([^;]*)`));

  return match ? decodeURIComponent(match[1]) : null;
}

export function writeCookie(name: string, value: string, options: CookieOptions = {}) {
  if (typeof document === "undefined") return;

  const parts = [`${name}=${encodeURIComponent(value)}`, `path=${options.path ?? "/"}`];

  if (typeof options.maxAge === "number") {
    parts.push(`max-age=${Math.floor(options.maxAge)}`);
  }

  if (options.sameSite) {
    parts.push(`samesite=${options.sameSite}`);
  }

  if (options.secure) {
    parts.push("secure");
  }

  document.cookie = parts.join("; ");
}

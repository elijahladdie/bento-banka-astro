import { readCookie, readStorage, writeCookie, writeStorage } from "./storage.js";

const preferenceMeta = {
  theme: { storage: "local", cookie: true, cookieMaxAge: 60 * 60 * 24 * 365 },
  locale: { storage: "local", cookie: true, cookieMaxAge: 60 * 60 * 24 * 365 },
  pricingInterval: { storage: "session", cookie: true },
};

export function loadPreference(name, fallback = null) {
  const meta = preferenceMeta[name] ?? { storage: "local", cookie: false };
  const stored = readStorage(meta.storage, name);

  if (stored !== null && stored !== "") return stored;

  if (meta.cookie) {
    const cookieValue = readCookie(name);
    if (cookieValue !== null && cookieValue !== "") return cookieValue;
  }

  return fallback;
}

export function savePreference(name, value, overrides = {}) {
  const meta = {
    ...(preferenceMeta[name] ?? { storage: "local", cookie: false }),
    ...overrides,
  };

  writeStorage(meta.storage, name, value);

  if (meta.cookie) {
    writeCookie(name, value, {
      maxAge: meta.cookieMaxAge,
      sameSite: "lax",
    });
  }
}

export function clearPreference(name, overrides = {}) {
  const meta = {
    ...(preferenceMeta[name] ?? { storage: "local", cookie: false }),
    ...overrides,
  };

  writeStorage(meta.storage, name, "");

  if (meta.cookie) {
    writeCookie(name, "", { maxAge: 0, sameSite: "lax" });
  }
}

export const preferenceKeys = Object.freeze({
  theme: "theme",
  locale: "locale",
  pricingInterval: "pricingInterval",
});

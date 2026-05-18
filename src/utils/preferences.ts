import { readCookie, readStorage, writeCookie, writeStorage } from "./storage.ts";

type PreferenceName = "theme" | "locale" | "pricingInterval" | string;
type PreferenceStorage = "local" | "session";

type PreferenceMeta = {
  storage: PreferenceStorage;
  cookie: boolean;
  cookieMaxAge?: number;
};

const preferenceMeta: Record<string, PreferenceMeta> = {
  theme: { storage: "local", cookie: true, cookieMaxAge: 60 * 60 * 24 * 365 },
  locale: { storage: "local", cookie: true, cookieMaxAge: 60 * 60 * 24 * 365 },
  pricingInterval: { storage: "session", cookie: true },
};

export function loadPreference(name: PreferenceName, fallback: string | null = null) {
  const meta = preferenceMeta[name] ?? { storage: "local", cookie: false };
  const stored = readStorage(meta.storage, name);

  if (stored !== null && stored !== "") return stored;

  if (meta.cookie) {
    const cookieValue = readCookie(name);
    if (cookieValue !== null && cookieValue !== "") return cookieValue;
  }

  return fallback;
}

export function savePreference(name: PreferenceName, value: string, overrides: Partial<PreferenceMeta> = {}) {
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

export function clearPreference(name: PreferenceName, overrides: Partial<PreferenceMeta> = {}) {
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

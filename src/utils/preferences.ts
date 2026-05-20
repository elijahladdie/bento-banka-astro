import { readCookie, readStorage, writeCookie, writeStorage } from "./storage.ts";

/**
 * -----------------------------
 * Preference Types
 * -----------------------------
 */

export type ThemePreference = "system" | "dark" | "light";
export type PreferenceName = "theme" | "locale" | "pricingInterval";

type PreferenceStorage = "local" | "session";

type PreferenceMeta = {
  storage: PreferenceStorage;
  cookie: boolean;
  cookieMaxAge?: number;
};

/**
 * -----------------------------
 * Preference Configuration
 * -----------------------------
 */

const preferenceMeta: Record<PreferenceName, PreferenceMeta> = {
  theme: {
    storage: "local",
    cookie: true,
    cookieMaxAge: 60 * 60 * 24 * 365,
  },
  locale: {
    storage: "local",
    cookie: true,
    cookieMaxAge: 60 * 60 * 24 * 365,
  },
  pricingInterval: {
    storage: "session",
    cookie: true,
  },
};

/**
 * -----------------------------
 * Theme Resolution (NEW)
 * -----------------------------
 * Resolves "system" into actual runtime theme
 */
export function resolveTheme(theme: ThemePreference): "dark" | "light" {
  if (theme !== "system") return theme;

  if (typeof window === "undefined") {
    // SSR-safe fallback
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * -----------------------------
 * Load Preference
 * -----------------------------
 */

export function loadPreference(
  name: PreferenceName,
  fallback: string | null = null
) {
  const meta = preferenceMeta[name] ?? { storage: "local", cookie: false };

  const stored = readStorage(meta.storage, name);
  if (stored) return stored;

  if (meta.cookie) {
    const cookieValue = readCookie(name);
    if (cookieValue) return cookieValue;
  }

  return fallback;
}

/**
 * -----------------------------
 * Save Preference
 * -----------------------------
 */

export function savePreference(
  name: PreferenceName,
  value: string,
  overrides: Partial<PreferenceMeta> = {}
) {
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

/**
 * -----------------------------
 * Clear Preference
 * -----------------------------
 */

export function clearPreference(
  name: PreferenceName,
  overrides: Partial<PreferenceMeta> = {}
) {
  const meta = {
    ...(preferenceMeta[name] ?? { storage: "local", cookie: false }),
    ...overrides,
  };

  writeStorage(meta.storage, name, "");

  if (meta.cookie) {
    writeCookie(name, "", { maxAge: 0, sameSite: "lax" });
  }
}

/**
 * -----------------------------
 * Keys (unchanged but safer typed)
 * -----------------------------
 */

export const preferenceKeys = Object.freeze({
  theme: "theme",
  locale: "locale",
  pricingInterval: "pricingInterval",
});
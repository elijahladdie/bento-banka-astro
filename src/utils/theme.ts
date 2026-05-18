import { loadPreference, savePreference, preferenceKeys } from "./preferences.ts";

export const themePreferenceKey = preferenceKeys.theme;

export type ThemePreference = "system" | "dark" | "light";

export function resolveThemePreference(themePreference: ThemePreference) {
  if (themePreference === "dark" || themePreference === "light") {
    return themePreference;
  }

  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getThemePreference() {
  return loadPreference(themePreferenceKey, "system") as ThemePreference;
}

export function saveThemePreference(themePreference: ThemePreference) {
  savePreference(themePreferenceKey, themePreference, {
    storage: "local",
    cookie: true,
    cookieMaxAge: 60 * 60 * 24 * 365,
  });
}

export function applyThemePreference(themePreference: ThemePreference) {
  if (typeof document === "undefined") return;

  const resolved = resolveThemePreference(themePreference);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function bootstrapThemePreference() {
  const preference = getThemePreference();
  applyThemePreference(preference);
  return preference;
}

import { loadPreference, savePreference, preferenceKeys } from "./preferences.ts";
import type { ThemePreference } from "../types";

export const themePreferenceKey = preferenceKeys.theme;

export function resolveThemePreference(themePreference: ThemePreference) {
  if (themePreference !== "system") return themePreference;

  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getThemePreference() {
  return loadPreference(themePreferenceKey, "system") as ThemePreference;
}

export function saveThemePreference(themePreference: ThemePreference) {
  savePreference(themePreferenceKey, themePreference);
}

export function applyThemePreference(themePreference: ThemePreference) {
  if (typeof document === "undefined") return;

  const resolved = resolveThemePreference(themePreference);

  document.documentElement.dataset.theme = themePreference;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function bootstrapThemePreference() {
  const preference = getThemePreference();
  applyThemePreference(preference);
  return preference;
}
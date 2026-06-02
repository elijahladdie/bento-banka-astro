import { loadPreference, savePreference } from './preferences.ts';
import { PreferenceName, type ThemePreference } from '../types';

export const themePreferenceKey = PreferenceName.THEME;

export function resolveThemePreference(themePreference: ThemePreference) {
  if (themePreference !== 'system') return themePreference;

  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getThemePreference() {
  return loadPreference(PreferenceName.THEME, 'system') as ThemePreference;
}

export function saveThemePreference(themePreference: ThemePreference) {
  savePreference(PreferenceName.THEME, themePreference);
}

export function applyThemePreference(themePreference: ThemePreference) {
  if (typeof document === 'undefined') return;

  const resolved = resolveThemePreference(themePreference);

  document.documentElement.dataset.theme = themePreference;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function bootstrapThemePreference() {
  const preference = getThemePreference();
  applyThemePreference(preference);
  return preference;
}

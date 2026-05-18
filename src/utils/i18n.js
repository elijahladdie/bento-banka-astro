import { translations } from "../i18n/translations.ts";
import { loadPreference, savePreference, preferenceKeys } from "./preferences.js";

const subscribers = new Set();

function getDict(locale) {
  return translations[locale] ?? translations.en;
}

export function getLocale() {
  if (typeof document === "undefined") {
    return "en";
  }

  return loadPreference(preferenceKeys.locale, document.documentElement.lang || "en") || "en";
}

export function subscribeLocale(fn) {
  subscribers.add(fn);

  return () => subscribers.delete(fn);
}

function resolvePath(dict, path) {
  return path.split(".").reduce((value, segment) => value?.[segment], dict);
}

export function translate(locale, path, fallback = path) {
  const dict = getDict(locale);
  const value = resolvePath(dict, path);

  return value === undefined || value === null ? fallback : String(value);
}

function applyElementTranslation(element, value) {
  const attributes = (element.getAttribute("data-i18n-attr") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (element.tagName === "TITLE") {
    document.title = value;
    return;
  }

  if (attributes.length > 0) {
    attributes.forEach((attribute) => {
      element.setAttribute(attribute, value);
    });
    return;
  }

  element.textContent = value;
}

export function updateTranslations(locale) {
  if (typeof document === "undefined") return;

  const dict = getDict(locale);
  const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const scrollY = window.scrollY;

  document.documentElement.lang = locale;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");

    if (!key) return;

    const value = resolvePath(dict, key);

    if (value !== undefined && value !== null) {
      applyElementTranslation(element, String(value));
    }
  });

  if (active && typeof active.focus === "function") {
    active.focus({ preventScroll: true });
  }

  window.scrollTo(0, scrollY);
}

export function saveLocale(locale) {
  savePreference(preferenceKeys.locale, locale, {
    storage: "local",
    cookie: true,
    cookieMaxAge: 60 * 60 * 24 * 365,
  });
}

export function setLocale(locale) {
  if (!translations[locale]) return;

  saveLocale(locale);
  updateTranslations(locale);
  subscribers.forEach((subscriber) => subscriber(locale));
}

export function bootstrapLocale() {
  if (typeof document === "undefined") return getLocale();

  const locale = loadPreference(preferenceKeys.locale, document.documentElement.lang || "en") || "en";

  if (translations[locale]) {
    updateTranslations(locale);
  }

  return locale;
}

export default {
  getLocale,
  translate,
  setLocale,
  subscribeLocale,
  updateTranslations,
  bootstrapLocale,
};

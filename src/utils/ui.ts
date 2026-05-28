import en from "../../messages/en.json";
import fr from "../../messages/fr.json";
import kin from "../../messages/kin.json";
import type { LocaleCode } from "../types";

export const translations: Record<string, any> = {
  en,
  fr,
  kin,
};

export function getByPath(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export function createTranslator(locale: LocaleCode) {
  return function t(path: string, fallback?: string) {
    return (
      getByPath(translations[locale], path) ??
      getByPath(translations.en, path) ??
      fallback ??
      path
    );
  };
}
export function useTranslator(locale: "en" | "fr" | "kin") {
  return (path: string, fallback?: string) => {
    return (
      getByPath(translations[locale], path) ??
      getByPath(translations.en, path) ??
      fallback ??
      path
    );
  };
}
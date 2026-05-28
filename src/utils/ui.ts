import en from "../../messages/en.json";
import fr from "../../messages/fr.json";
import kin from "../../messages/kin.json";
import type {
  LocaleCode,
  TranslationDictionary,
} from "../types";

export const translations: Record<LocaleCode, TranslationDictionary> = {
  en,
  fr,
  kin,
};

export function getByPath(
  obj: TranslationDictionary | undefined,
  path: string,
) {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") {
      return undefined;
    }

    return key in acc ? (acc as Record<string, unknown>)[key] : undefined;
  }, obj);
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
export function useTranslator(locale: LocaleCode) {
  return (path: string, fallback?: string) => {
    return (
      getByPath(translations[locale], path) ??
      getByPath(translations.en, path) ??
      fallback ??
      path
    );
  };
}
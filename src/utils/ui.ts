import en from "../../messages/en.json";
import fr from "../../messages/fr.json";
import kin from "../../messages/kin.json";

export const dictionaries = {
  en,
  fr,
  kin,
};

export type LocaleCode = keyof typeof dictionaries;

export function getByPath(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export function createTranslator(locale: LocaleCode) {
  return function t(path: string, fallback?: string) {
    return (
      getByPath(dictionaries[locale], path) ??
      getByPath(dictionaries.en, path) ??
      fallback ??
      path
    );
  };
}
export function useTranslator(locale: "en" | "fr" | "kin") {
  return (path: string, fallback?: string) => {
    return (
      getByPath(dictionaries[locale], path) ??
      getByPath(dictionaries.en, path) ??
      fallback ??
      path
    );
  };
}
import { defineMiddleware } from "astro:middleware";
import type { AppLocals, LocaleCode } from "./types";

export const onRequest = defineMiddleware(async (ctx, next) => {
  const cookieLocale = ctx.cookies.get("locale")?.value;
  const locale: LocaleCode = cookieLocale === "fr" || cookieLocale === "kin"
    ? cookieLocale
    : "en";

  (ctx.locals as AppLocals).locale = locale;
  return next();
});
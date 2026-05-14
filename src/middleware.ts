import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (ctx, next) => {
  const locale = ctx.cookies.get("locale")?.value ||
    "en";
  ctx.locals.locale = locale;
  return next();
});
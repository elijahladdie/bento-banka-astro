import { defineMiddleware } from 'astro:middleware';
import { AppLocals, LocaleCode } from './types';

export const onRequest = defineMiddleware(async (ctx, next) => {
  const cookieLocale = ctx.cookies.get('locale')?.value;
  const locale: LocaleCode =
    cookieLocale === LocaleCode.FR || cookieLocale === LocaleCode.KIN
      ? cookieLocale
      : LocaleCode.EN;

  (ctx.locals as AppLocals).locale = locale;
  return next();
});

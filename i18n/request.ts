import { getRequestConfig } from 'next-intl/server';


// Can be imported from a shared config
export const locales = ['es', 'en'];

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = await locale;
  const validLocale = (resolvedLocale && locales.includes(resolvedLocale)) ? resolvedLocale : 'es';

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});

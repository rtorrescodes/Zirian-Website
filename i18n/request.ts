import { getRequestConfig } from 'next-intl/server';


// Can be imported from a shared config
export const locales = ['es', 'en'];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  // If not, fallback to 'es' instead of calling notFound() to avoid root layout errors
  const validLocale = locales.includes(locale as any) ? locale : 'es';

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});

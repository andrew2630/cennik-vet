export const locales = ['pl', 'en'] as const;
export const defaultLocale = 'pl';

export type Locale = (typeof locales)[number];

'use client';

import { NextIntlClientProvider } from 'next-intl';
import pl from '@/public/locales/pl.json';
import en from '@/public/locales/en.json';
import { getSettings } from '@/utils/settingsStorage';
import Theme from '@/components/Theme';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const lang = getSettings().language;
  return (
    <NextIntlClientProvider messages={lang === 'pl' ? pl : en} locale={lang} timeZone='Europe/Warsaw'>
      <Theme>{children}</Theme>
    </NextIntlClientProvider>
  );
}

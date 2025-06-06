'use client';

import { NextIntlClientProvider } from 'next-intl';
import pl from '@/messages/pl.json';
import en from '@/messages/en.json';
import { getSettings } from '@/utils/settingsStorage';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const lang = getSettings().language;
  return (
    <NextIntlClientProvider messages={lang === 'pl' ? pl : en} locale={lang}>
      {children}
    </NextIntlClientProvider>
  );
}

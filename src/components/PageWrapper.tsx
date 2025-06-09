'use client';

import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import pl from '@/public/locales/pl.json';
import en from '@/public/locales/en.json';
import { getSettings } from '@/utils/settingsStorage';
import Theme from '@/components/Theme';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<'pl' | 'en'>('pl');

  useEffect(() => {
    setLang(getSettings().language);
  }, []);

  const messages = lang === 'pl' ? pl : en;

  return (
    <NextIntlClientProvider messages={messages} locale={lang} timeZone='Europe/Warsaw'>
      <Theme>{children}</Theme>
    </NextIntlClientProvider>
  );
}

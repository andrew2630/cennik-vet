'use client';

import { getSettings } from '@/utils/settingsStorage';
import { useEffect } from 'react';
import type { ThemeSettings } from '@/types';
import PageWrapper from './PageWrapper';

export default function Theme({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const settings = getSettings();
    applyTheme(settings.theme);
  }, []);

  const applyTheme = (theme: ThemeSettings['theme']): void => {
    const root: HTMLElement = document.documentElement;
    const isDark: boolean = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (theme === 'system' && isDark)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  return <PageWrapper>{children}</PageWrapper>;
}

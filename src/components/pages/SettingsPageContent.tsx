'use client';

import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '@/utils/settingsStorage';
import { exportAllDataToJSON } from '@/utils/exportStorage';
import ImportButton from '@/components/ImportButton';
import { applyTheme, getStoredTheme, Theme } from '@/utils/theme';
import { Settings as SettingsType, Currency, TravelUnit } from '@/types';
import { getProducts } from '@/utils/productStorage';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const itemTypeT = useTranslations('itemType');

  const [settings, setSettings] = useState<SettingsType>({
    currency: 'zł',
    theme: 'system',
    language: 'pl',
    distanceUnit: 'km',
  });

  useEffect(() => {
    const saved = getSettings();
    const theme = getStoredTheme();
    const updated = { ...saved, theme };
    setSettings(updated);
    applyTheme(updated.theme);
  }, []);

  const handleChange = <K extends keyof SettingsType>(field: K, value: SettingsType[K]) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    saveSettings(updated);

    if (field === 'theme') {
      applyTheme(value as Theme);
    }

    if (field === 'distanceUnit') {
      const products = getProducts();
      const travelName = itemTypeT('travel').toLowerCase();
      const idx = products.findIndex(p => p.name.toLowerCase() === travelName);
      if (idx !== -1) {
        products[idx] = { ...products[idx], unit: value as TravelUnit };
        localStorage.setItem('vet_products', JSON.stringify(products));
      }
    }
  };

  return (
    <div className='max-w-2xl mx-auto'>
      <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl p-4'>
        <CardContent className='p-2 space-y-6'>
          <div className='flex items-center justify-between mb-6'>
            <h1 className='text-3xl font-bold flex items-center gap-3'>
              <SettingsIcon className='w-7 h-7 text-indigo-600 dark:text-indigo-300' />
              {t('title')}
            </h1>
          </div>

          <div className='p-2 space-y-6'>
            <div className='space-y-1'>
              <Label>{t('theme')}</Label>
              <Select value={settings.theme} onValueChange={val => handleChange('theme', val as Theme)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('theme')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='system'>{t('themeSystem')}</SelectItem>
                  <SelectItem value='light'>{t('themeLight')}</SelectItem>
                  <SelectItem value='dark'>{t('themeDark')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <Label>{t('language')}</Label>
              <Select value={settings.language} onValueChange={val => handleChange('language', val as 'pl' | 'en')}>
                <SelectTrigger>
                  <SelectValue placeholder={t('language')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='pl'>{t('languagePl')}</SelectItem>
                  <SelectItem value='en'>{t('languageEn')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <Label>{t('currency')}</Label>
              <Select value={settings.currency} onValueChange={val => handleChange('currency', val as Currency)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('currency')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='zł'>{t('currencyPln')}</SelectItem>
                  <SelectItem value='€'>{t('currencyEur')}</SelectItem>
                  <SelectItem value='$'>{t('currencyUsd')}</SelectItem>
                  <SelectItem value='£'>{t('currencyGbp')}</SelectItem>
                  <SelectItem value='¥'>{t('currencyJpy')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <Label>{t('distance')}</Label>
              <Select
                value={settings.distanceUnit}
                onValueChange={val => handleChange('distanceUnit', val as TravelUnit)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('distance')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='km'>{t('distanceKm')}</SelectItem>
                  <SelectItem value='mi'>{t('distanceMi')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex gap-3 flex-wrap pt-4'>
              <ImportButton onFinish={() => window.location.reload()} />
              <Button
                onClick={() => exportAllDataToJSON()}
                variant='default'
                className='bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700'
              >
                <Download className='w-4 h-4 mr-2' />
                {t('export')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

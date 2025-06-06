'use client';

import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '@/utils/settingsStorage';
import { exportAllDataToJSON } from '@/utils/exportStorage';
import ImportButton from '@/components/ImportButton';
import { applyTheme, getStoredTheme, Theme } from '@/utils/theme';
import { Settings as SettingsType, Currency } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Download } from 'lucide-react';
import ThemeProvider from '@/components/Theme';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType>({
    currency: 'zł',
    theme: 'system',
    language: 'pl',
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
  };

  return (
    <ThemeProvider>
      <div className='max-w-2xl mx-auto'>
        <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl p-4'>
          <CardContent className='p-2 space-y-6'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-3xl font-bold flex items-center gap-3'>
                <SettingsIcon className='w-7 h-7 text-indigo-600 dark:text-indigo-300' />
                Ustawienia aplikacji
              </h1>
            </div>

            <div className='p-2 space-y-6'>
              <div className='space-y-1'>
                <Label>Motyw</Label>
                <Select value={settings.theme} onValueChange={val => handleChange('theme', val as Theme)}>
                  <SelectTrigger>
                    <SelectValue placeholder='Wybierz motyw' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='system'>Systemowy</SelectItem>
                    <SelectItem value='light'>Jasny</SelectItem>
                    <SelectItem value='dark'>Ciemny</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1'>
                <Label>Język</Label>
                <Select value={settings.language} onValueChange={val => handleChange('language', val as 'pl' | 'en')}>
                  <SelectTrigger>
                    <SelectValue placeholder='Wybierz język' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pl'>Polski</SelectItem>
                    <SelectItem value='en'>English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1'>
                <Label>Waluta</Label>
                <Select value={settings.currency} onValueChange={val => handleChange('currency', val as Currency)}>
                  <SelectTrigger>
                    <SelectValue placeholder='Wybierz walutę' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='zł'>Polski Złoty</SelectItem>
                    <SelectItem value='€'>Euro</SelectItem>
                    <SelectItem value='$'>Dolar Amerykański</SelectItem>
                    <SelectItem value='£'>Funt Szterling</SelectItem>
                    <SelectItem value='¥'>Jen Japoński</SelectItem>
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
                  Eksportuj dane
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
}

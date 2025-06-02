'use client';

import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '@/utils/settingsStorage';
import { exportAllDataToJSON } from '@/utils/exportStorage';
import ImportButton from '@/components/ImportButton';
import { applyTheme, getStoredTheme, Theme } from '@/utils/theme';
import { Settings as SettingsType } from '@/types';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Download } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType>({
    currency: 'zł',
    theme: 'system',
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
    <div className='max-w-2xl mx-auto p-6'>
      <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/20 dark:to-slate-900/20 shadow-2xl'>
        <CardContent className='p-6 space-y-6'>
          <div className='flex items-center gap-3 mb-4'>
            <SettingsIcon className='w-7 h-7 text-indigo-600 dark:text-indigo-300' />
            <h1 className='text-2xl font-bold tracking-tight'>Ustawienia aplikacji</h1>
          </div>

          <div className='space-y-4'>
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
  );
}

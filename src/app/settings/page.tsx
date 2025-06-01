'use client';

import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '@/utils/settingsStorage';
import { exportAllDataToJSON } from '@/utils/exportStorage';
import ImportButton from '@/components/ImportButton';
import { applyTheme, getStoredTheme, Theme } from '@/utils/theme';
import { Settings } from '@/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    pricePerKm: 2,
    nightSurcharge: 30,
    weekendSurcharge: 20,
    currency: 'zł',
    theme: 'system',
  });

  useEffect(() => {
    const saved = getSettings();
    const theme = getStoredTheme();
    setSettings({ ...saved, theme });
    applyTheme(theme);
  }, []);

  const handleChange = <K extends keyof Settings>(field: K, value: Settings[K]) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    saveSettings(updated);

    if (field === 'theme') {
      applyTheme(value as Theme);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 rounded shadow text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Ustawienia</h1>
      <div className="space-y-4">
        <div>
          <label className="block font-medium">Cena za 1 km:</label>
          <input
            type="number"
            step="0.1"
            value={settings.pricePerKm}
            onChange={(e) => handleChange('pricePerKm', parseFloat(e.target.value))}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block font-medium">Dopłata nocna (%):</label>
          <input
            type="number"
            value={settings.nightSurcharge}
            onChange={(e) => handleChange('nightSurcharge', parseInt(e.target.value))}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block font-medium">Dopłata weekendowa (%):</label>
          <input
            type="number"
            value={settings.weekendSurcharge}
            onChange={(e) => handleChange('weekendSurcharge', parseInt(e.target.value))}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800"
          />
        </div>

        <div>
          <label className="block font-medium">Waluta:</label>
          <select
            value={settings.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800"
          >
            <option value="zł">zł</option>
            <option value="€">€</option>
            <option value="$">$</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Motyw:</label>
          <select
            value={settings.theme}
            onChange={(e) => handleChange('theme', e.target.value as Theme)}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800"
          >
            <option value="system">Systemowy</option>
            <option value="light">Jasny</option>
            <option value="dark">Ciemny</option>
          </select>
        </div>

        <ImportButton />
        <button
          onClick={exportAllDataToJSON}
          className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700"
        >
          Eksportuj dane (JSON)
        </button>
      </div>
    </div>
  );
}

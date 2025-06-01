import { Settings } from '@/types';

const STORAGE_KEY = 'vet_settings';

const defaultSettings: Settings = {
  pricePerKm: 2.0,
  nightSurcharge: 30,
  weekendSurcharge: 20,
  currency: 'zł',
  theme: 'system',
};

export function getSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
}

export function saveSettings(data: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetSettings() {
  localStorage.removeItem(STORAGE_KEY);
}

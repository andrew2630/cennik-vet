import { Settings } from '@/types'
import { storageKey } from './userStorage'

const BASE_KEY = 'vet_settings'
const STORAGE_KEY = () => storageKey(BASE_KEY)

const defaultSettings: Settings = {
  currency: 'zł',
  theme: 'system',
  language: 'pl',
  distanceUnit: 'km',
};

export function getSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  const stored = localStorage.getItem(STORAGE_KEY())
  return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
}

export function saveSettings(data: Settings) {
  localStorage.setItem(STORAGE_KEY(), JSON.stringify(data))
}

export function resetSettings() {
  localStorage.removeItem(STORAGE_KEY())
}

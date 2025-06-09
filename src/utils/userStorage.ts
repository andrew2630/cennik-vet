export const CURRENT_USER_KEY = 'vet_current_user'

export function getCurrentUserId(): string {
  if (typeof window === 'undefined') return 'local'
  return localStorage.getItem(CURRENT_USER_KEY) || 'local'
}

export function setCurrentUserId(id: string | null): void {
  if (typeof window === 'undefined') return
  if (id) localStorage.setItem(CURRENT_USER_KEY, id)
  else localStorage.setItem(CURRENT_USER_KEY, 'local')
}

export function storageKey(base: string): string {
  return `${base}_${getCurrentUserId()}`
}

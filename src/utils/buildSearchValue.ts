import type { Item } from '@/types'

export function buildSearchValue(
  item: Item,
  displayKey: string,
  filterKeys?: string[],
) {
  const keys = [displayKey, ...(filterKeys ?? [])]
  return keys
    .map(k => {
      const value = (item as Record<string, unknown>)[k]
      return value !== undefined && value !== null ? String(value) : ''
    })
    .join(' ')
    .trim()
}

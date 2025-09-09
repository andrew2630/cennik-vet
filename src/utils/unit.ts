import en from '../public/locales/en.json'
import pl from '../public/locales/pl.json'
import { Unit } from '@/types'

export const predefinedUnits: Unit[] = [
  'pcs',
  'ml',
  'g',
  'kg',
  'pack',
  'dose',
  'tablet',
  'dropper',
  'ampoule',
  'sachet',
  'blister',
  'tube',
  'tubosyringe',
  'can',
  'km',
]

const unitMap: Record<string, Unit> = {}

const allUnitKeys = new Set(
  Object.keys(en.unit as Record<string, string>).concat(
    Object.keys(pl.unit as Record<string, string>),
  ),
)

predefinedUnits.forEach(u => {
  unitMap[u] = u
  const enName = (en.unit as Record<string, string>)[u]
  const plName = (pl.unit as Record<string, string>)[u]
  if (enName) unitMap[enName.toLowerCase()] = u
  if (plName) unitMap[plName.toLowerCase()] = u
})

export function mapUnit(value?: string): Unit | undefined {
  if (!value) return undefined
  return unitMap[value.toLowerCase().trim()]
}

export function translateUnit(value: string, t: (key: string) => string): string {
  const canonical = mapUnit(value)
  if (canonical) return t(canonical)
  const key = value.toLowerCase().trim()
  if (allUnitKeys.has(key)) return t(key)
  return value
}

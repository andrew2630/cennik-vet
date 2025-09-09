import { mapUnit, translateUnit } from '../src/utils/unit'
import pl from '../src/public/locales/pl.json'
import en from '../src/public/locales/en.json'

describe('unit mapping', () => {
  const plT = (k: string) => (pl.unit as Record<string, string>)[k]
  const enT = (k: string) => (en.unit as Record<string, string>)[k]

  it('maps polish and english names to canonical units', () => {
    expect(mapUnit('pcs')).toBe('pcs')
    expect(mapUnit('szt')).toBe('pcs')
    expect(mapUnit('bottle')).toBeUndefined()
    expect(mapUnit('unknown')).toBeUndefined()
  })

  it('translates known units and falls back for custom ones', () => {
    expect(translateUnit('pcs', plT)).toBe('szt')
    expect(translateUnit('szt', plT)).toBe('szt')
    expect(translateUnit('bottle', plT)).toBe('butelka')
    expect(translateUnit('bottle', enT)).toBe('bottle')
    expect(translateUnit('custom', enT)).toBe('custom')
  })
})

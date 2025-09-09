import pl from '../src/public/locales/pl.json'
import en from '../src/public/locales/en.json'

describe('locale messages', () => {
  it('provides translation for unit.bottle', () => {
    expect(pl.unit.bottle).toBe('butelka')
    expect(en.unit.bottle).toBe('bottle')
  })
})

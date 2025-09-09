import { normalizeProduct } from '../src/utils/normalizeProduct'
import { Product } from '../src/types'

describe('normalizeProduct', () => {
  it('fills missing type and unit', () => {
    const product = { id: '1', name: 'A', pricePerUnit: 1, unit: '' } as Product
    expect(normalizeProduct(product)).toEqual({
      ...product,
      type: 'product',
      unit: 'pcs',
    })
  })

  it('trims provided unit', () => {
    const product = {
      id: '2',
      name: 'B',
      pricePerUnit: 1,
      unit: ' ml ',
      type: 'service',
    } as Product
    expect(normalizeProduct(product).unit).toBe('ml')
  })
})


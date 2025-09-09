import type { Product } from '@/types'

export function normalizeProduct(p: Product): Product {
  return {
    ...p,
    type: p.type ?? 'product',
    unit: p.unit?.trim() || 'pcs',
  }
}


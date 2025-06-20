import { Product } from '@/types'
import { queueOperation } from './syncSupabase'
import { notifyDataUpdated } from './dataUpdateEvent'
import { storageKey } from './userStorage'

const BASE_KEY = 'vet_products'
const STORAGE_KEY = () => storageKey(BASE_KEY)

export function getProducts(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY()) || '[]') as Product[]
  } catch {
    return [];
  }
}

export function saveProduct(product: Product) {
  const productToSave = { ...product, updatedAt: new Date().toISOString() };
  const all = getProducts();
  const index = all.findIndex(p => p.id === productToSave.id);
  const updated =
    index !== -1
      ? [...all.slice(0, index), productToSave, ...all.slice(index + 1)]
      : [...all, productToSave];
  localStorage.setItem(STORAGE_KEY(), JSON.stringify(updated))
  notifyDataUpdated();
  queueOperation({ type: 'upsert', table: 'products', data: productToSave });
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEY(), JSON.stringify(products))
  notifyDataUpdated();
  queueOperation({ type: 'delete', table: 'products', id });
}

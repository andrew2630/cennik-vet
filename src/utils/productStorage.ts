import { Product } from '@/types';
import { queueOperation } from './syncSupabase';

const STORAGE_KEY = 'vet_products';

export function getProducts(): Product[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Product[];
  } catch {
    return [];
  }
}

export function saveProduct(product: Product) {
  const all = getProducts();
  const index = all.findIndex(p => p.id === product.id);
  const updated = index !== -1 ? [...all.slice(0, index), product, ...all.slice(index + 1)] : [...all, product];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  queueOperation({ type: 'upsert', table: 'products', data: product });
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  queueOperation({ type: 'delete', table: 'products', id });
}

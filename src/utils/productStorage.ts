import { Product } from '@/types';
import { v4 as uuid } from 'uuid';

const STORAGE_KEY = 'vet_products';

export function getProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveProduct(product: Omit<Product, 'id'>) {
  const products = getProducts();
  const newProduct: Product = { id: uuid(), ...product };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...products, newProduct]));
  return newProduct;
}

export function updateProduct(updatedProduct: Product) {
  const products = getProducts();
  const index = products.findIndex(p => p.id === updatedProduct.id);
  if (index !== -1) {
    products[index] = updatedProduct;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
}

export function deleteProduct(id: string) {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  }
  return false;
}

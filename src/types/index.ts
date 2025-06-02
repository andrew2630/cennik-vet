export type Unit =
  | 'szt'
  | 'ml'
  | 'g'
  | 'kg'
  | 'opakowanie'
  | 'dawka'
  | 'tabletka'
  | 'pipeta'
  | 'ampułka'
  | 'saszetka'
  | 'blister'
  | 'tuba'
  | 'tubostrz.'
  | 'puszka'
  | 'km'
  | string;

export type ItemType = 'produkt' | 'usługa';

export interface Product {
  id: string;
  type: ItemType;
  name: string;
  unit: Unit;
  pricePerUnit: number;
}

export interface Client {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export type TransactionStatus = 'draft' | 'finalised';

export interface TransactionItem {
  productId: string;
  quantity: number;
}

export interface Transaction {
  id: string;
  clientId: string;
  date: string;
  items: TransactionItem[];
  discount?: number;
  additionalFee?: number;
  totalPrice: number;
  status: TransactionStatus;
}

export interface ThemeSettings {
  theme: 'light' | 'dark' | 'system';
}

export interface Settings {
  currency: string;
  theme: ThemeSettings['theme'];
}

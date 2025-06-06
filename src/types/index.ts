export type Unit =
  | 'pcs'
  | 'ml'
  | 'g'
  | 'kg'
  | 'pack'
  | 'dose'
  | 'tablet'
  | 'dropper'
  | 'ampoule'
  | 'sachet'
  | 'blister'
  | 'tube'
  | 'tubosyringe'
  | 'can'
  | 'km'
  | string;

export type ItemType = 'product' | 'service';

export type Item = {
  id: string;
  [key: string]: unknown;
  type?: ItemType;
};

export type Currency = 'zł' | '€' | '$' | '£' | '¥';


export interface Product extends Item {
  id: string;
  type: ItemType;
  name: string;
  unit: Unit;
  pricePerUnit: number;
}

export interface Client extends Item {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export type TransactionStatus = 'draft' | 'finalised';

export interface TransactionItem {
  productId: string;
  quantity: number;
  priceAtTransaction?: number;
}

export interface Transaction extends Item {
  id: string;
  clientId: string;
  date: string;
  items: TransactionItem[];
  discount?: number;
  additionalFee?: number;
  totalPrice: number;
  status: TransactionStatus;
  description?: string;
}

export interface ThemeSettings {
  theme: 'light' | 'dark' | 'system';
}
export interface Settings {
  currency: Currency;
  theme: ThemeSettings['theme'];
  language: 'pl' | 'en';
}

export interface ExportLabels {
  header: string;
  clientLabel: string;
  addressLabel: string;
  phoneLabel: string;
  notFound: string;
  travel: string;
  items: string;
  products: string;
  services: string;
  quantity: string;
  unit: string;
  priceUnit: string;
  value: string;
  subtotal: string;
  discount: string;
  fee: string;
  total: string;
  description: string;
}

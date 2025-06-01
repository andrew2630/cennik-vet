export type Unit = 'szt' | 'ml' | 'g' | 'dawka' | string;

export interface Product {
  id: string;
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

export interface TransactionItem {
  productId: string;
  quantity: number;
}

export interface Transaction {
  id: string;
  clientId: string;
  date: string;
  items: TransactionItem[];
  distanceKm: number;
  isNight: boolean;
  isWeekend: boolean;
  manualAdjustment?: number; // dodatnia lub ujemna kwota
  totalPrice: number;
}

export interface Settings {
  pricePerKm: number;
  weekendSurcharge: number; // procent
  nightSurcharge: number;   // procent
  currency: string;
  theme: 'system' | 'dark' | 'light';
}

export type PageProps<T extends Record<string, string> = Record<string, string>> = {
  params: T;
  searchParams?: Record<string, string | string[] | undefined>;
};

export type LayoutProps<T extends Record<string, string> = Record<string, string>> = {
  children: React.ReactNode;
  params: T;
};

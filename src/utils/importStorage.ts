'use client';

import { toast } from 'sonner';
import { queueOperation } from './syncSupabase';
import type { Product, Client, Transaction } from '@/types';

export function importAllDataFromJSON(
  file: File,
  onFinish: () => void,
  translations: {
    success: string;
    error: string;
    errorLog: string;
  }
) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result as string);

      if (parsed.products) {
        localStorage.setItem('vet_products', JSON.stringify(parsed.products));
        (parsed.products as Product[]).forEach(p =>
          queueOperation({ type: 'upsert', table: 'products', data: p })
        );
      }
      if (parsed.clients) {
        localStorage.setItem('vet_clients', JSON.stringify(parsed.clients));
        (parsed.clients as Client[]).forEach(c =>
          queueOperation({ type: 'upsert', table: 'clients', data: c })
        );
      }
      if (parsed.transactions) {
        localStorage.setItem('vet_transactions', JSON.stringify(parsed.transactions));
        (parsed.transactions as Transaction[]).forEach(t =>
          queueOperation({ type: 'upsert', table: 'transactions', data: t })
        );
      }
      if (parsed.settings) {
        localStorage.setItem('vet_settings', JSON.stringify(parsed.settings));
      }

      toast.success(translations.success);
      onFinish();
    } catch (error) {
      console.error(translations.errorLog, error);
      toast.error(translations.error);
    }
  };

  reader.readAsText(file);
}

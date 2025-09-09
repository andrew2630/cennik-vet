'use client';

import { toast } from 'sonner';
import { queueOperation, syncQueue } from './syncSupabase'
import { supabase } from './supabaseClient'
import { notifyDataUpdated } from './dataUpdateEvent'
import { storageKey } from './userStorage'
import type { Product, Client, Transaction } from '@/types'
import { normalizeProduct } from './productStorage'

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
        const productsWithDates = (parsed.products as Product[]).map(p =>
          normalizeProduct({
            ...p,
            updatedAt: p.updatedAt || new Date().toISOString(),
          }),
        )
        localStorage.setItem(storageKey('vet_products'), JSON.stringify(productsWithDates))
        notifyDataUpdated()
        productsWithDates.forEach(p =>
          queueOperation({ type: 'upsert', table: 'products', data: p })
        )
      }
      if (parsed.clients) {
        const clientsWithDates = (parsed.clients as Client[]).map(c => ({
          ...c,
          updatedAt: c.updatedAt || new Date().toISOString(),
        }))
        localStorage.setItem(storageKey('vet_clients'), JSON.stringify(clientsWithDates))
        notifyDataUpdated()
        clientsWithDates.forEach(c =>
          queueOperation({ type: 'upsert', table: 'clients', data: c })
        )
      }
      if (parsed.transactions) {
        const transactionsWithDates = (parsed.transactions as Transaction[]).map(t => ({
          ...t,
          paymentMethod: t.paymentMethod ?? 'cash',
          updatedAt: t.updatedAt || new Date().toISOString(),
        }))
        localStorage.setItem(storageKey('vet_transactions'), JSON.stringify(transactionsWithDates))
        notifyDataUpdated()
        transactionsWithDates.forEach(t =>
          queueOperation({ type: 'upsert', table: 'transactions', data: t })
        )
      }
      if (parsed.settings) {
        localStorage.setItem(storageKey('vet_settings'), JSON.stringify(parsed.settings))
      }
      if (parsed.exportedAt) {
        localStorage.setItem(storageKey('vet_last_import'), parsed.exportedAt)
      }

      supabase.auth.getUser().then(res => {
        if (res.data.user) syncQueue(res.data.user.id);
      });

      toast.success(translations.success);
      onFinish();
    } catch (error) {
      console.error(translations.errorLog, error);
      toast.error(translations.error);
    }
  };

  reader.readAsText(file);
}

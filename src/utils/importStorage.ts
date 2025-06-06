'use client';

import { toast } from 'sonner';

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
      }
      if (parsed.clients) {
        localStorage.setItem('vet_clients', JSON.stringify(parsed.clients));
      }
      if (parsed.transactions) {
        localStorage.setItem('vet_transactions', JSON.stringify(parsed.transactions));
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

import { PaymentMethod } from '@/types';

export const PAYMENT_METHOD_STYLES: Record<PaymentMethod, { text: string; bg: string }> = {
  cash: {
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
  },
  transfer: {
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  },
};

export default PAYMENT_METHOD_STYLES;

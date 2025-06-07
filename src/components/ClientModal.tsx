'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ClientForm from '@/components/ClientForm';
import { useEffect } from 'react';
import { getClients } from '@/utils/clientStorage';
import { useTranslations } from 'next-intl';

export default function ClientModal({
  open,
  onClose,
  onClientCreated,
}: {
  open: boolean;
  onClose: () => void;
  onClientCreated: (newClientId: string) => void;
}) {
  const t = useTranslations('clientModal');

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg w-full max-w-lg p-6 relative z-50"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4">{t('title')}</h2>
            <ClientForm
              onAdd={() => {
                const all = getClients();
                const latest = all[all.length - 1];
                onClientCreated(latest.id);
                onClose();
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

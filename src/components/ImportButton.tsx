'use client';

import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { importAllDataFromJSON } from '@/utils/importStorage';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function ImportButton({ onFinish }: { onFinish: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('import');

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importAllDataFromJSON(file, onFinish, {
        success: t('success'),
        error: t('error'),
        errorLog: t('errorLog'),
      });
      // Reset input to allow re-upload of the same file
      e.target.value = '';
    }
  };

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        <Upload className="w-4 h-4" />
        {t('buttonLabel')} {/* localized label */}
      </Button>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function InstallPrompt() {
  const t = useTranslations('installPrompt');
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  const isMobile = () => {
    if (typeof navigator === 'undefined') return false;
    interface NavigatorUAData {
      mobile: boolean;
    }
    const nav = navigator as Navigator & { userAgentData?: NavigatorUAData };
    if (nav.userAgentData) {
      return nav.userAgentData.mobile;
    }
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|BlackBerry/i.test(navigator.userAgent);
  };

  useEffect(() => {
    if (!isMobile()) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true) {
        setVisible(false);
      }
    };
    checkInstalled();
    window.addEventListener('appinstalled', checkInstalled);
    return () => window.removeEventListener('appinstalled', checkInstalled);
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-60 bg-white dark:bg-gray-900 shadow-lg rounded-md p-4 flex items-center gap-4'>
      <div className='space-y-1'>
      <span className='text-sm'>{t('text')}</span>
      <Button size='sm' onClick={handleInstall}>
        {t('install')}
      </Button>
      </div>
      <button
        onClick={() => setVisible(false)}
        aria-label={t('dismiss')}
        className='text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      >
        <X className='w-4 h-4' />
      </button>
    </div>
  );
}

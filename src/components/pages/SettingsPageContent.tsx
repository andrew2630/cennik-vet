'use client';

import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '@/utils/settingsStorage';
import { exportAllDataToJSON } from '@/utils/exportStorage';
import ImportButton from '@/components/ImportButton';
import { applyTheme, getStoredTheme, Theme } from '@/utils/theme';
import { Settings as SettingsType, Currency, TravelUnit } from '@/types';
import { getProducts } from '@/utils/productStorage';
import { notifyDataUpdated } from '@/utils/dataUpdateEvent';
import { storageKey } from '@/utils/userStorage'
import { useSupabaseAuth } from '@/utils/useSupabaseAuth';
import { syncQueue, downloadUserData } from '@/utils/syncSupabase';
import { includeOfflineData } from '@/utils/includeOfflineData'
import { supabase } from '@/utils/supabaseClient';
import { localizeSupabaseMessage } from '@/utils/supabaseMessages';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Download,
  LogIn,
  UserPlus,
  LogOut,
  UserX,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const itemTypeT = useTranslations('itemType');
  const authT = useTranslations('auth');
  const commonT = useTranslations('productList');

  const [settings, setSettings] = useState<SettingsType>({
    currency: 'zł',
    theme: 'system',
    language: 'pl',
    distanceUnit: 'km',
  });

  const { user, signIn, signUp, signOut, deleteAccount } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasOfflineData, setHasOfflineData] = useState(false)

  useEffect(() => {
    const saved = getSettings();
    const theme = getStoredTheme();
    const updated = { ...saved, theme };
    setSettings(updated);
    applyTheme(updated.theme);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hasData = ['vet_products_local', 'vet_clients_local', 'vet_transactions_local'].some(key =>
      !!localStorage.getItem(key),
    )
    setHasOfflineData(hasData)
  }, [user])

  const handleChange = <K extends keyof SettingsType>(field: K, value: SettingsType[K]) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    saveSettings(updated);

    if (field === 'theme') {
      applyTheme(value as Theme);
    }

    if (field === 'distanceUnit') {
      const products = getProducts();
      const travelName = itemTypeT('travel').toLowerCase();
      const idx = products.findIndex(p => p.name.toLowerCase() === travelName);
      if (idx !== -1) {
        products[idx] = { ...products[idx], unit: value as TravelUnit }
        localStorage.setItem(storageKey('vet_products'), JSON.stringify(products))
        notifyDataUpdated();
      }
    }
  };

  const handleLogin = async () => {
    const { error } = await signIn(email.trim(), password);
    if (!error) {
      toast.success(authT('loginSuccess'));
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await syncQueue(data.user.id);
        await downloadUserData(data.user.id);
      }
    } else {
      toast.error(localizeSupabaseMessage(error.message, authT, 'loginError'));
    }
  };

  const handleRegister = async () => {
    const { error } = await signUp(email.trim(), password);
    if (!error) {
      toast.success(authT('checkEmail'));
    } else {
      toast.error(localizeSupabaseMessage(error.message, authT, 'registerError'));
    }
  };

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount();
    if (!error) {
      toast.success(authT('deleteAccountSuccess'));
    } else {
      toast.error(localizeSupabaseMessage(error.message, authT, 'deleteAccountError'));
    }
  };

  const handleIncludeOffline = async () => {
    const { data } = await supabase.auth.getUser()
    const uid = data.user?.id
    if (!uid) return
    await includeOfflineData(uid)
    toast.success(t('includeOfflineSuccess'))
    setHasOfflineData(false)
  }

  return (
    <div className='max-w-2xl mx-auto'>
      <Card className='rounded-3xl border border-gray-200 dark:border-white/10 bg-gradient-to-tr from-indigo-200/30 via-sky-100/20 to-white/30 dark:from-indigo-500/30 dark:via-sky-500/10 dark:to-slate-900/20 shadow-2xl p-4'>
        <CardContent className='p-2 space-y-6'>
          <div className='flex items-center justify-between mb-6'>
            <h1 className='text-3xl font-bold flex items-center gap-3'>
              <SettingsIcon className='w-7 h-7 text-indigo-600 dark:text-indigo-300' />
              {t('title')}
            </h1>
          </div>

          {!user ? (
            <div className='bg-white/30 dark:bg-white/5 rounded-xl p-6 shadow-md space-y-4 border border-gray-200 dark:border-white/10 transition-all hover:shadow-xl'>
              <h2 className='text-xl font-semibold text-center'>{t('loginTitle')}</h2>
              <div className='flex flex-col md:flex-row gap-4'>
                <Input type='email' placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} />
                <Input
                  type='password'
                  placeholder={t('password')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div className='flex gap-4 justify-center pt-2'>
                <Button onClick={handleLogin} className='gap-2'>
                  <LogIn className='w-4 h-4' /> {t('login')}
                </Button>
                <Button onClick={handleRegister} variant='outline' className='gap-2'>
                  <UserPlus className='w-4 h-4' /> {t('register')}
                </Button>
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-2 md:flex-row md:items-center justify-between bg-green-100/30 dark:bg-green-800/10 p-4 rounded-xl'>
              <span>{t('loggedIn')}</span>
              <div className='flex gap-2'>
                <Button variant='destructive' size='sm' onClick={signOut} className='gap-2'>
                  <LogOut className='w-4 h-4' /> {t('logout')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm' className='gap-2'>
                      <MoreHorizontal className='w-4 h-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      variant='destructive'
                      onSelect={() => setShowDeleteDialog(true)}
                      className='gap-2'
                    >
                      <UserX className='w-4 h-4' /> {t('deleteAccount')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <Label>{t('theme')}</Label>
              <Select value={settings.theme} onValueChange={val => handleChange('theme', val as Theme)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('theme')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='system'>{t('themeSystem')}</SelectItem>
                  <SelectItem value='light'>{t('themeLight')}</SelectItem>
                  <SelectItem value='dark'>{t('themeDark')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{t('language')}</Label>
              <Select value={settings.language} onValueChange={val => handleChange('language', val as 'pl' | 'en')}>
                <SelectTrigger>
                  <SelectValue placeholder={t('language')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='pl'>{t('languagePl')}</SelectItem>
                  <SelectItem value='en'>{t('languageEn')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{t('currency')}</Label>
              <Select value={settings.currency} onValueChange={val => handleChange('currency', val as Currency)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('currency')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='zł'>{t('currencyPln')}</SelectItem>
                  <SelectItem value='€'>{t('currencyEur')}</SelectItem>
                  <SelectItem value='$'>{t('currencyUsd')}</SelectItem>
                  <SelectItem value='£'>{t('currencyGbp')}</SelectItem>
                  <SelectItem value='¥'>{t('currencyJpy')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{t('distance')}</Label>
              <Select
                value={settings.distanceUnit}
                onValueChange={val => handleChange('distanceUnit', val as TravelUnit)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('distance')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='km'>{t('distanceKm')}</SelectItem>
                  <SelectItem value='mi'>{t('distanceMi')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex gap-3 flex-wrap pt-4'>
            <ImportButton onFinish={() => window.location.reload()} />
            {user && hasOfflineData && (
              <Button
                onClick={handleIncludeOffline}
                className='gap-2 bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700'
              >
                {t('includeOffline')}
              </Button>
            )}
            <Button
              onClick={() => exportAllDataToJSON()}
              variant='default'
              className='bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700'
            >
              <Download className='w-4 h-4 mr-2' />
              {t('export')}
            </Button>
          </div>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className='sm:max-w-md'>
              <DialogTitle>{commonT('confirmDeleteTitle')}</DialogTitle>
              <DialogDescription>{t('deleteAccountConfirm')}</DialogDescription>
              <DialogFooter className='mt-4 flex gap-2'>
                <Button type='button' variant='outline' onClick={() => setShowDeleteDialog(false)}>
                  {commonT('cancel')}
                </Button>
                <Button
                  type='button'
                  variant='destructive'
                  onClick={async () => {
                    await handleDeleteAccount();
                    setShowDeleteDialog(false);
                  }}
                >
                  {commonT('delete')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

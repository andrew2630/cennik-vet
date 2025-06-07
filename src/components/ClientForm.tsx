'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getClients, saveClient } from '@/utils/clientStorage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

export default function ClientForm({ onAdd }: { onAdd: () => void }) {
  const t = useTranslations('clientForm');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const clientId = searchParams.get('id');

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (clientId) {
      const client = getClients().find(p => p.id === clientId);
      if (client) {
        setName(client.name || '');
        setAddress(client.address || '');
        setPhone(client.phone || '');
      }
    }
  }, [clientId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    saveClient({
      id: clientId || crypto.randomUUID(),
      name: name || '',
      address: address || '',
      phone: phone || '',
    });

    onAdd();
    if (pathname.startsWith('/clients')) {
      router.push('/clients');
    }
  };

  return (
    <Suspense>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Label htmlFor='name' className='py-2'>
            {t('name')}
          </Label>
          <Input
            id='name'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('namePlaceholder')}
            required
          />
        </div>

        <div>
          <Label htmlFor='address' className='py-2'>
            {t('address')}
          </Label>
          <Input
            id='address'
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder={t('addressPlaceholder')}
          />
        </div>

        <div>
          <Label htmlFor='phone' className='py-2'>
            {t('phone')}
          </Label>
          <Input
            id='phone'
            type='tel'
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder={t('phonePlaceholder')}
          />
        </div>

        <div className='w-full md:w-auto'>
          <Button type='submit' className='w-full md:w-auto'>
            {t('save')}
          </Button>
        </div>
      </form>
    </Suspense>
  );
}

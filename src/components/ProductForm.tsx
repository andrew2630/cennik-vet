'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getProducts, saveProduct } from '@/utils/productStorage';
import { Unit, ItemType } from '@/types';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';

export default function ProductForm({ onAdd }: { onAdd: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const product = useMemo(() => {
    if (!productId) return null;
    return getProducts().find(p => p.id === productId) || null;
  }, [productId]);

  const t = useTranslations('ProductForm');
  const unitT = useTranslations('unit');

  const [name, setName] = useState('');
  const [unit, setUnit] = useState<Unit>('pcs');
  const [customUnit, setCustomUnit] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<ItemType>('product');
  const [isCustomUnit, setIsCustomUnit] = useState(false);

  const predefinedUnits: Unit[] = [
    'pcs', 'ml', 'g', 'kg', 'pack', 'dose', 'tablet', 'dropper',
    'ampoule', 'sachet', 'blister', 'tube', 'tubosyringe', 'can', 'km'
  ];

  useEffect(() => {
    if (!product) return;
    setName(product.name);
    if (predefinedUnits.includes(product.unit)) {
      setUnit(product.unit);
      setIsCustomUnit(false);
      setCustomUnit('');
    } else {
      setCustomUnit(product.unit);
      setIsCustomUnit(true);
    }
    setPrice(product.pricePerUnit.toString());
    setType(product.type);
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (!name || !price || isNaN(parsedPrice) || (isCustomUnit && !customUnit)) return;

    const finalUnit = isCustomUnit ? customUnit : unit;

    saveProduct({
      id: productId || crypto.randomUUID(),
      name,
      unit: finalUnit || 'pcs',
      pricePerUnit: Math.round(parsedPrice * 100) / 100,
      type: type || 'product',
    });

    onAdd();
    router.push('/products');
  };

  return (
    <Suspense>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 md:flex-row md:items-end md:gap-6 mb-6 flex-wrap'>
        <div className='flex flex-col w-full md:w-1/4'>
          <Label className='mb-1'>{t('name')}</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder={t('exampleName')} />
        </div>

        <div className='flex flex-col w-full md:w-1/5'>
          <Label className='mb-1'>{t('type')}</Label>
          <Select value={type} onValueChange={val => setType(val as ItemType)}>
            <SelectTrigger>
              <SelectValue placeholder={t('chooseType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='product'>{t('product')}</SelectItem>
              <SelectItem value='service'>{t('service')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col w-full md:w-1/5'>
          <Label className='mb-1'>{t('unit')}</Label>
          {!isCustomUnit ? (
            <Select
              value={unit}
              onValueChange={val => {
                if (val === '__custom') {
                  setIsCustomUnit(true);
                  setCustomUnit('');
                } else {
                  setUnit(val as Unit);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('chooseUnit')} />
              </SelectTrigger>
              <SelectContent>
                {predefinedUnits.map(u => (
                  <SelectItem key={u} value={u}>
                    {unitT(u)}
                  </SelectItem>
                ))}
                <SelectItem value='__custom'>{t('customUnit')}</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={customUnit}
              onChange={e => setCustomUnit(e.target.value)}
              placeholder={t('enterUnit')}
              onBlur={() => {
                if (!customUnit) {
                  setIsCustomUnit(false);
                  setUnit('pcs');
                }
              }}
            />
          )}
        </div>

        <div className='flex flex-col w-full md:w-1/5'>
          <Label className='mb-1'>{t('price')}</Label>
          <Input
            type='text'
            inputMode='decimal'
            pattern='[0-9]*[.,]?[0-9]*'
            value={price}
            onChange={e => {
              const value = e.target.value.replace(',', '.');
              setPrice(value);
            }}
            onBlur={() => {
              const parsed = parseFloat(price.replace(',', '.'));
              if (!isNaN(parsed)) {
                setPrice((Math.round(parsed * 100) / 100).toString());
              } else {
                setPrice('');
              }
            }}
            placeholder={t('examplePrice')}
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

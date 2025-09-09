'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getProducts, saveProduct } from '@/utils/productStorage';
import { Unit, ItemType } from '@/types';
import { predefinedUnits, mapUnit, translateUnit } from '@/utils/unit';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useTranslations } from 'next-intl';

export default function ProductForm({ onAdd }: { onAdd: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const t = useTranslations('ProductForm');
  const unitT = useTranslations('unit');

  const [name, setName] = useState('');
  const [unit, setUnit] = useState<Unit>('pcs');
  const [customUnit, setCustomUnit] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<ItemType>('product');
  const [isCustomUnit, setIsCustomUnit] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const prod = getProducts().find(p => p.id === productId);
    if (!prod) return;

    setName(prod.name);
    setPrice(prod.pricePerUnit.toString());
    setType(prod.type || 'product');

    const mapped = mapUnit(prod.unit);
    if (mapped) {
      setUnit(mapped);
      setIsCustomUnit(false);
      setCustomUnit('');
    } else if (prod.unit) {
      setIsCustomUnit(true);
      setCustomUnit(prod.unit);
    } else {
      setUnit('pcs');
      setIsCustomUnit(false);
      setCustomUnit('');
    }
  }, [productId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (!name || !price || isNaN(parsedPrice) || (isCustomUnit && !customUnit)) return;

    const finalUnit = isCustomUnit ? customUnit : unit;

    saveProduct({
      id: productId || crypto.randomUUID(),
      name,
      unit: finalUnit,
      pricePerUnit: Math.round(parsedPrice * 100) / 100,
      type: type || 'product',
    });

    onAdd();
    router.push('/products');
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4 md:flex-row md:items-end md:gap-6 mb-6 flex-wrap'>
      <div className='flex flex-col w-full md:w-1/4'>
        <Label className='mb-1'>{t('name')}</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder={t('exampleName')} />
      </div>

      <div className='flex flex-col w-full md:w-1/5'>
        <Label className='mb-1'>{t('type')}</Label>
        <Select value={type} onValueChange={val => setType((val as ItemType) || type)}>
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
                setUnit(val || unit as Unit);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('chooseUnit')}>
                {translateUnit(unit, unitT)}
              </SelectValue>
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
          onChange={e => setPrice(e.target.value.replace(',', '.'))}
          onBlur={() => {
            const parsed = parseFloat(price);
            if (!isNaN(parsed)) {
              setPrice((Math.round(parsed * 100) / 100).toString());
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
  );
}
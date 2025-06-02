'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getProducts, saveProduct } from '@/utils/productStorage';
import { Unit, Product, ItemType } from '@/types';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const predefinedUnits: Unit[] = [
  'szt',
  'ml',
  'g',
  'kg',
  'opakowanie',
  'dawka',
  'tabletka',
  'pipeta',
  'ampułka',
  'saszetka',
  'blister',
  'tuba',
  'tubostrz.',
  'puszka',
  'km',
];

export default function ProductForm({ onAdd }: { onAdd: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const [name, setName] = useState('');
  const [unit, setUnit] = useState<Unit>('szt');
  const [customUnit, setCustomUnit] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<ItemType>('produkt');
  const [isCustomUnit, setIsCustomUnit] = useState(false);

  useEffect(() => {
    if (productId) {
      const product = getProducts().find((p) => p.id === productId);
      if (product) {
        setName(product.name);
        setUnit(product.unit);
        setPrice(product.pricePerUnit.toString());
        setType(product.type);
      }
    }
  }, [productId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || (isCustomUnit && !customUnit)) return;

    const finalUnit = isCustomUnit ? customUnit : unit;

    saveProduct({
      id: productId || crypto.randomUUID(),
      name,
      unit: finalUnit,
      pricePerUnit: parseFloat(price),
      type,
    });

    onAdd();
    router.push('/products');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6 mb-6 flex-wrap"
    >
      <div className="flex flex-col w-full md:w-1/4">
        <Label className="mb-1">Nazwa</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="np. Szczepienie"
        />
      </div>

      <div className="flex flex-col w-full md:w-1/5">
        <Label className="mb-1">Typ</Label>
        <Select value={type} onValueChange={(val) => setType(val as ItemType)}>
          <SelectTrigger>
            <SelectValue placeholder="Wybierz typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="produkt">Produkt</SelectItem>
            <SelectItem value="usługa">Usługa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col w-full md:w-1/5">
        <Label className="mb-1">Jednostka</Label>
        {!isCustomUnit ? (
          <Select
            value={unit}
            onValueChange={(val) => {
              if (val === '__custom') {
                setIsCustomUnit(true);
                setCustomUnit('');
              } else {
                setUnit(val as Unit);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wybierz" />
            </SelectTrigger>
            <SelectContent>
              {predefinedUnits.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
              <SelectItem value="__custom">Inna...</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value)}
            placeholder="Wpisz jednostkę"
            onBlur={() => {
              if (!customUnit) {
                setIsCustomUnit(false);
                setUnit('szt');
              }
            }}
          />
        )}
      </div>

      <div className="flex flex-col w-full md:w-1/5">
        <Label className="mb-1">Cena</Label>
        <Input
          type="number"
          step="1.00"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="np. 49.99"
        />
      </div>

      <div className="w-full md:w-auto">
        <Button type="submit" className="w-full md:w-auto">
          Zapisz
        </Button>
      </div>
    </form>
  );
}

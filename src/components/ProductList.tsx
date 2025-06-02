'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash } from 'lucide-react';
import { getProducts, deleteProduct } from '@/utils/productStorage';
import { Product, ItemType, Unit } from '@/types';

export default function ProductList({ refresh }: { refresh: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | ItemType>('all');
  const [unitFilter, setUnitFilter] = useState<'all' | Unit>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<'price' | 'name'>('name');
  const [search, setSearch] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(getProducts());
  }, [refresh]);

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setProducts(getProducts());
    setConfirmId(null);
  };

  const units = Array.from(new Set(products.map(p => p.unit)));

  const filtered = products
    .filter(p => {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.unit.toLowerCase().includes(q);
    })
    .filter(p => typeFilter === 'all' || p.type === typeFilter)
    .filter(p => unitFilter === 'all' || p.unit === unitFilter)
    .sort((a, b) => {
      const keyA = sortField === 'name' ? a.name.toLowerCase() : a.pricePerUnit;
      const keyB = sortField === 'name' ? b.name.toLowerCase() : b.pricePerUnit;
      return sortOrder === 'asc' ? (keyA > keyB ? 1 : -1) : keyA < keyB ? 1 : -1;
    });

  return (
    <Card className='mt-6 bg-transparent'>
      <CardHeader className='flex flex-col gap-4'>
        <div className='flex flex-col md:flex-row md:items-center md:gap-4 w-full'>
          <div className='flex flex-col md:flex-row md:items-center md:gap-4 w-full'>
            <CardTitle className='py-2'>Cennik</CardTitle>
          </div>
          <div className='flex flex-col sm:flex-row gap-2 w-full md:w-auto'>
            <Input
              className='w-full min-w-[200px] sm:min-w-[300px]'
              placeholder='Szukaj produktu (nazwa, jednostka)...'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className='flex flex-wrap md:justify-end gap-2'>
          <Select value={typeFilter} onValueChange={(val: 'all' | ItemType) => setTypeFilter(val)}>
            <SelectTrigger className='w-[125px]'>
              <SelectValue placeholder='Typ' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Wszystko</SelectItem>
              <SelectItem value='produkt'>Produkty</SelectItem>
              <SelectItem value='usługa'>Usługi</SelectItem>
            </SelectContent>
          </Select>

          <Select value={unitFilter} onValueChange={(val: 'all' | Unit) => setUnitFilter(val)}>
            <SelectTrigger className='w-[125px]'>
              <SelectValue placeholder='Jednostka' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Wszystkie</SelectItem>
              {units.map(u => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortField} onValueChange={(val: 'name' | 'price') => setSortField(val)}>
            <SelectTrigger className='w-[125px]'>
              <SelectValue placeholder='Sortuj wg' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='name'>Nazwa</SelectItem>
              <SelectItem value='price'>Cena</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(val: 'asc' | 'desc') => setSortOrder(val)}>
            <SelectTrigger className='w-[125px]'>
              <SelectValue placeholder='Kolejność' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>Rosnąco</SelectItem>
              <SelectItem value='desc'>Malejąco</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {filtered.length === 0 ? (
          <p className='text-muted-foreground'>Brak danych do wyświetlenia.</p>
        ) : (
          filtered.map(p => (
            <Card key={p.id} className='p-4 border rounded-xl shadow-sm opacity-90'>
              {/* Linia 1: Nazwa */}
              <div className='text-base font-semibold text-primary mb-1'>{p.name}</div>

              {/* Linia 2: Szczegóły i akcje */}
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground'>
                <div className='flex flex-wrap gap-4'>
                  <div>
                    <span className='font-medium text-foreground'>Typ:</span> {p.type}
                  </div>
                  <div>
                    <span className='font-medium text-foreground'>Jednostka:</span> {p.unit}
                  </div>
                  <div>
                    <span className='font-medium text-foreground'>Cena:</span> {p.pricePerUnit.toFixed(2)} zł
                  </div>
                </div>

                <div className='flex gap-2 justify-end'>
                  <Link href={`/products/edit?id=${p.id}`}>
                    <Button size='sm' variant='outline'>
                      <Pencil className='w-4 h-4' />
                    </Button>
                  </Link>
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => {
                      setSelectedProduct(p);
                      setConfirmId(p.id);
                    }}
                  >
                    <Trash className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}

        {selectedProduct && (
          <Dialog
            open={!!confirmId}
            onOpenChange={open => {
              if (!open) {
                setConfirmId(null);
                setSelectedProduct(null);
              }
            }}
          >
            <DialogContent className='sm:max-w-md' forceMount>
              <DialogTitle>Potwierdź usunięcie</DialogTitle>
              <DialogDescription>
                Czy na pewno chcesz usunąć <strong>{selectedProduct.name}</strong>?
              </DialogDescription>
              <DialogFooter className='mt-4 flex gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setConfirmId(null);
                    setSelectedProduct(null);
                  }}
                >
                  Anuluj
                </Button>
                <Button
                  type='button'
                  variant='destructive'
                  onClick={() => {
                    handleDelete(selectedProduct.id);
                    setConfirmId(null);
                    setSelectedProduct(null);
                  }}
                >
                  Usuń
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

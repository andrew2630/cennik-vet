'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { getClients } from '@/utils/clientStorage';
import { getProducts } from '@/utils/productStorage';
import { saveTransaction, updateTransaction } from '@/utils/transactionStorage';
import { Client, Product, TransactionItem, Transaction, TransactionStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useDebouncedCallback } from 'use-debounce';
import { ComboboxGeneric } from '@/components/ComboboxGeneric';
import { Trash } from 'lucide-react';

export default function TransactionForm({
  editingTransaction,
  onSaved,
  onCancel,
}: {
  editingTransaction?: Transaction;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [additionalFee, setAdditionalFee] = useState(0);
  const [status, setStatus] = useState<TransactionStatus>('draft');
  const [id, setId] = useState(uuidv4());
  const router = useRouter();

  useEffect(() => {
    const loadedClients = getClients();
    const loadedProducts = getProducts();
    setClients(loadedClients);
    setProducts(loadedProducts);

    const isNew = !editingTransaction?.id;
    if (isNew) {
      const dojazd = loadedProducts.find(p => p.name.toLowerCase() === 'dojazd' && p.unit === 'km');
      if (dojazd) {
        setItems([{ productId: dojazd.id, quantity: 0 }]);
      }
    }
  }, []);

  useEffect(() => {
    if (editingTransaction) {
      setClientId(editingTransaction.clientId);
      setItems(editingTransaction.items);
      setDiscount(editingTransaction.discount || 0);
      setAdditionalFee(editingTransaction.additionalFee || 0);
      setStatus(editingTransaction.status);
      setId(editingTransaction.id);
    }
  }, [editingTransaction]);

  const debouncedSave = useDebouncedCallback(() => {
    if (status !== 'draft') return;
    const total = calculateTotal();
    const tx: Transaction = {
      id,
      clientId,
      items,
      discount,
      additionalFee,
      totalPrice: total,
      date: new Date().toISOString(),
      status,
    };
    updateTransaction(tx);
  }, 600);

  useEffect(() => {
    if (status === 'draft') debouncedSave();
  }, [clientId, items, discount, additionalFee]);

  const calculateTotal = () => {
    const subtotal = items.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      return acc + (product ? product.pricePerUnit * item.quantity : 0);
    }, 0);
    return Math.max(0, Math.round((subtotal - discount + additionalFee) * 100) / 100);
  };

  const handleItemChange = (index: number, field: keyof TransactionItem, value: any) => {
    const updated = [...items];
    const item = { ...updated[index] };
    if (field === 'quantity') {
      item.quantity = Number(value);
    } else if (field === 'productId') {
      item.productId = value as string;
    }
    updated[index] = item;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleFinalise = () => {
    const total = calculateTotal();
    const tx: Transaction = {
      id,
      clientId,
      items,
      discount,
      additionalFee,
      totalPrice: total,
      date: new Date().toISOString(),
      status: 'finalised',
    };
    updateTransaction(tx);
    onSaved?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotal();
    const tx: Transaction = {
      id,
      clientId,
      items,
      discount,
      additionalFee,
      totalPrice: total,
      date: editingTransaction?.date || new Date().toISOString(),
      status,
    };
    updateTransaction(tx);
    onSaved?.();
  };

  const clientDetails = clients.find(c => c.id === clientId);

  return (
    <form onSubmit={handleSubmit} className='space-y-4 max-w-xl mx-auto'>
      <h1 className='text-2xl font-bold'>Rozliczenie</h1>

      <div>
        <Label className='py-2'>Klient</Label>
        <ComboboxGeneric
          items={clients}
          selectedId={clientId}
          onSelect={setClientId}
          displayKey='name'
          filterKeys={['name', 'address', 'phone']}
          placeholder='Wyszukaj klienta...'
        />
        {clientDetails && (
          <div className='text-sm text-muted-foreground mt-2'>
            {clientDetails.name}, {clientDetails.address}, tel. {clientDetails.phone}
          </div>
        )}
      </div>

      <div>
        <Label className='py-2'>Pozycje</Label>
        <div className='space-y-4'>
          {items.map((item, index) => {
            const product = products.find(p => p.id === item.productId);
            const itemTotal = product ? product.pricePerUnit * item.quantity : 0;
            return (
              <div key={index} className='border p-4 rounded space-y-2'>
                <div className='flex justify-between items-center'>
                  <ComboboxGeneric
                    items={products}
                    selectedId={item.productId}
                    onSelect={val => handleItemChange(index, 'productId', val)}
                    displayKey='name'
                    filterKeys={['name']}
                    placeholder='Wyszukaj produkt...'
                  />
                  <Button type='button' variant='ghost' onClick={() => handleRemoveItem(index)} className='ml-2'>
                    <Trash className='w-4 h-4' />
                  </Button>
                </div>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-center'>
                    <Label className='py-2 mr-2'>Ilość:</Label>
                    <Input
                      type='number'
                      min='0'
                      step='0.1'
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      className='w-24'
                    />
                    <span className='ml-2 text-muted-foreground'>{product?.unit || ''}</span>
                  </div>
                  <div>
                    Cena: {product ? `${product.pricePerUnit} zł/${product.unit}` : '—'} | Suma: {itemTotal.toFixed(2)}{' '}
                    zł
                  </div>
                </div>
              </div>
            );
          })}
          <Button type='button' variant='outline' onClick={handleAddItem}>
            + Dodaj produkt
          </Button>
        </div>
      </div>

      <div>
        <Label className='py-2'>Rabat</Label>
        <div className='flex items-center gap-2'>
          <Input
            type='number'
            step='0.01'
            value={discount}
            onChange={e => setDiscount(parseFloat(e.target.value))}
            placeholder='np. 10'
          />
          <span>zł</span>
        </div>
      </div>

      <div>
        <Label className='py-2'>Opłata dodatkowa</Label>
        <div className='flex items-center gap-2'>
          <Input
            type='number'
            step='0.01'
            value={additionalFee}
            onChange={e => setAdditionalFee(parseFloat(e.target.value))}
            placeholder='np. 20'
          />
          <span>zł</span>
        </div>
      </div>

      <div className='text-xl font-semibold'>Suma: {calculateTotal()} zł</div>

      {status === 'draft' ? (
        <Button type='button' onClick={handleFinalise} className='bg-green-600 hover:bg-green-700 text-white'>
          Zrealizuj
        </Button>
      ) : (
        <div className='flex gap-2'>
          <Button type='submit'>Zapisz</Button>
          <Button type='button' variant='outline' onClick={onCancel}>
            Anuluj
          </Button>
        </div>
      )}
    </form>
  );
}

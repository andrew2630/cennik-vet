'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getClients } from '@/utils/clientStorage';
import { getProducts } from '@/utils/productStorage';
import { updateTransaction } from '@/utils/transactionStorage';
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
  readOnly = false,
}: {
  editingTransaction?: Transaction;
  onSaved?: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [additionalFee, setAdditionalFee] = useState(0);
  const [status, setStatus] = useState<TransactionStatus>('draft');
  const [id, setId] = useState(uuidv4());
  const [localDiscount, setLocalDiscount] = useState(discount.toString());
  const [localFee, setLocalFee] = useState(additionalFee.toString());
  const [localQuantities, setLocalQuantities] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  useEffect(() => {
    setLocalQuantities(items.map(i => i.quantity.toString()));
  }, [items]);

  useEffect(() => {
    setLocalDiscount(discount.toString());
    setLocalFee(additionalFee.toString());
  }, [discount, additionalFee]);

  useEffect(() => {
    const loadedClients = getClients();
    const loadedProducts = getProducts();
    setClients(loadedClients);
    setProducts(loadedProducts);

    const isNew = !editingTransaction?.id;
    if (isNew && !readOnly) {
      const travel = loadedProducts.find(p => p.name.toLowerCase() === 'dojazd' && p.unit === 'km');
      if (travel) {
        setItems([{ productId: travel.id, quantity: 0 }]);
      }
    }
  }, [editingTransaction?.id, readOnly]);

  useEffect(() => {
    if (editingTransaction) {
      setClientId(editingTransaction.clientId);
      setItems(editingTransaction.items);
      setDiscount(editingTransaction.discount || 0);
      setAdditionalFee(editingTransaction.additionalFee || 0);
      setStatus(editingTransaction.status);
      setId(editingTransaction.id);
      setDescription(editingTransaction.description || '');
    }
  }, [editingTransaction]);

  const shouldSkipSave = () => {
    const isNew = !editingTransaction?.id;
    const singleItem = items.length === 1 ? items[0] : null;
    const isOnlyEmptyTravel =
      singleItem &&
      (() => {
        const product = products.find(p => p.id === singleItem.productId);
        return product?.name?.toLowerCase() === 'dojazd' && product?.unit === 'km' && singleItem.quantity === 0;
      })();

    const isEmpty = !clientId && isOnlyEmptyTravel && discount === 0 && additionalFee === 0 && calculateTotal() === 0;

    return isNew && isEmpty;
  };

  const debouncedSave = useDebouncedCallback(() => {
    if (status !== 'draft') return;

    const total = calculateTotal();
    if (shouldSkipSave()) return;

    const tx: Transaction = {
      id,
      clientId,
      items,
      discount,
      additionalFee,
      totalPrice: total,
      date: new Date().toISOString(),
      status,
      description,
    };

    const resultId = updateTransaction(tx).id;
    if (!id) setId(resultId);
  }, 600);

  useEffect(() => {
    if (status === 'draft' && !readOnly) debouncedSave();
  }, [clientId, items, discount, additionalFee, debouncedSave, readOnly, status]);

  const calculateTotal = () => {
    const subtotal = items.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      return acc + (product ? product.pricePerUnit * item.quantity : 0);
    }, 0);
    return Math.max(0, Math.round((subtotal - discount + additionalFee) * 100) / 100);
  };

  const handleItemChange = (index: number, field: keyof TransactionItem, value: string | number) => {
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
      description,
    };
    updateTransaction(tx);
    onSaved?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateTotal();
    if (shouldSkipSave()) return;

    const tx: Transaction = {
      id,
      clientId,
      items,
      discount,
      additionalFee,
      totalPrice: total,
      date: editingTransaction?.date || new Date().toISOString(),
      status,
      description,
    };
    updateTransaction(tx);
    onSaved?.();
  };

  const clientDetails = clients.find(c => c.id === clientId);

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-6 max-w-2xl mx-auto bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-2xl shadow-xl px-6 py-8 border border-gray-200 dark:border-white/10'
    >
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
          className={`w-full ${readOnly ? 'pointer-events-none bg-transparent text-foreground opacity-100' : ''}`}
          disabled={readOnly}
        />
        {clientDetails && (
          <div className='text-sm text-muted-foreground mt-2'>
            {clientDetails.address}
            {clientDetails.phone ? `, tel. ${clientDetails.phone}` : ''}
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
              <div
                key={index}
                className='border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-white/80 dark:bg-white/5 backdrop-blur-sm shadow-sm space-y-3 transition hover:shadow-md'
              >
                <div className='flex gap-2 items-center'>
                  <div className='text-muted-foreground w-5 text-right'>{index + 1}.</div>
                  <div className='flex-1'>
                    {readOnly ? (
                      <div className='text-md text-foreground font-medium'>{product?.name ?? '–'}</div>
                    ) : (
                      <ComboboxGeneric
                        items={products}
                        selectedId={item.productId}
                        onSelect={val => !readOnly && handleItemChange(index, 'productId', val)}
                        displayKey='name'
                        filterKeys={['name']}
                        placeholder='Wyszukaj produkt...'
                        className={`w-full ${
                          readOnly ? 'pointer-events-none bg-transparent text-foreground opacity-100' : ''
                        }`}
                        disabled={readOnly}
                      />
                    )}
                  </div>
                  {!readOnly && (
                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() => handleRemoveItem(index)}
                      className='flex-shrink-0'
                    >
                      <Trash className='w-4 h-4' />
                    </Button>
                  )}
                </div>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-center'>
                    <Label className='py-2 mr-2'>Ilość:</Label>
                    {readOnly ? (
                      <div className='text-md'>{item.quantity}</div>
                    ) : (
                      <Input
                        type='text'
                        inputMode='decimal'
                        pattern='[0-9]*[.,]?[0-9]*'
                        value={localQuantities[index] ?? ''}
                        onChange={e => {
                          const input = e.target.value.replace(',', '.');
                          setLocalQuantities(prev => {
                            const copy = [...prev];
                            copy[index] = input;
                            return copy;
                          });
                        }}
                        onBlur={() => {
                          const parsed = parseFloat(localQuantities[index].replace(',', '.'));
                          handleItemChange(index, 'quantity', isNaN(parsed) ? 0 : parsed);
                        }}
                        className={`${readOnly ? 'bg-transparent text-foreground opacity-100 border-none' : ''} w-24`}
                        disabled={readOnly}
                      />
                    )}
                    <span className='ml-2 text-muted-foreground'>{product?.unit || ''}</span>
                  </div>
                  {product?.name.toLowerCase() === 'dojazd' && product?.unit === 'km' && !readOnly && (
                    <div className='text-sm text-red-600 dark:text-red-400 mt-1 font-semibold p-3'>
                      ⚠️ Podaj liczbę kilometrów tam i z powrotem (łącznie w dwie strony)
                    </div>
                  )}
                  <div className='py-2'>
                    Cena: {product ? `${product.pricePerUnit} zł/${product.unit}` : '—'} | Suma: {itemTotal.toFixed(2)}{' '}
                    zł
                  </div>
                </div>
              </div>
            );
          })}
          {!readOnly && (
            <Button
              type='button'
              variant='outline'
              onClick={handleAddItem}
              className='mt-2 hover:bg-gray-100 dark:hover:bg-white/10 transition'
            >
              + Dodaj produkt
            </Button>
          )}
        </div>
      </div>

      <div>
        <Label className='py-2'>Rabat</Label>
        <div className='flex items-center gap-2'>
          <Input
            type='text'
            inputMode='decimal'
            pattern='[0-9]*[.,]?[0-9]*'
            value={localDiscount}
            onChange={e => {
              const input = e.target.value.replace(',', '.');
              setLocalDiscount(input);
            }}
            onBlur={() => {
              const parsed = parseFloat(localDiscount);
              const rounded = isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
              setDiscount(rounded);
              setLocalDiscount(rounded.toString());
            }}
            placeholder='np. 10'
            className={`${readOnly ? 'bg-transparent text-foreground opacity-100 border-none' : ''}`}
            disabled={readOnly}
          />

          <span>zł</span>
        </div>
      </div>

      <div>
        <Label className='py-2'>Opłata dodatkowa</Label>
        <div className='flex items-center gap-2'>
          <Input
            type='text'
            inputMode='decimal'
            pattern='[0-9]*[.,]?[0-9]*'
            value={localFee}
            onChange={e => {
              const input = e.target.value.replace(',', '.');
              setLocalFee(input);
            }}
            onBlur={() => {
              const parsed = parseFloat(localFee);
              const rounded = isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
              setAdditionalFee(rounded);
              setLocalFee(rounded.toString());
            }}
            placeholder='np. 20'
            className={`${readOnly ? 'bg-transparent text-foreground opacity-100 border-none' : ''}`}
            disabled={readOnly}
          />

          <span>zł</span>
        </div>
      </div>

      <div className='text-xl font-semibold text-right text-green-700 dark:text-green-300'>
        Suma: {calculateTotal().toFixed(2)} zł
      </div>

      <div>
        <Label htmlFor='description' className='py-2'>
          Opis
        </Label>
        <textarea
          id='description'
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder='Tutaj możesz wpisać dodatkowe uwagi, komentarze lub inne informacje...'
          disabled={readOnly}
          className={`w-full min-h-[100px] resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-90 ${
            readOnly ? 'text-foreground opacity-100 border-none' : ''
          }`}
        />
      </div>

      {!readOnly && status === 'draft' ? (
        <Button
          type='button'
          onClick={handleFinalise}
          className='bg-gradient-to-r from-emerald-700 to-lime-600 text-white shadow-md hover:opacity-90 transition'
        >
          Zrealizuj
        </Button>
      ) : (
        !readOnly &&
        status !== 'draft' && (
          <div className='flex gap-2'>
            <Button type='submit'>Zapisz</Button>
            <Button type='button' variant='outline' onClick={onCancel}>
              Anuluj
            </Button>
          </div>
        )
      )}
    </form>
  );
}

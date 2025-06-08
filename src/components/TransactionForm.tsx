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
import { useTranslations } from 'next-intl';
import ClientModal from '@/components/ClientModal';
import { getSettings } from '@/utils/settingsStorage';

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
  const t = useTranslations('transactionForm');
  const itemTypeT = useTranslations('itemType');
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
  const [isClientModalOpen, setClientModalOpen] = useState(false);
  const { currency } = getSettings();

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
      const travel = loadedProducts.find(
        p => p.name.toLowerCase() === itemTypeT('travel').toLowerCase() && p.unit === 'km'
      );
      if (travel) {
        setItems([{ productId: travel.id, quantity: 0 }]);
      }
    }
  }, [editingTransaction?.id, readOnly, itemTypeT]);

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
        return (
          product?.name?.toLowerCase() === itemTypeT('travel').toLowerCase() &&
          product?.unit === 'km' &&
          singleItem.quantity === 0
        );
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
      const price = item.priceAtTransaction ?? product?.pricePerUnit ?? 0;
      return acc + price * item.quantity;
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
    const snapshotItems = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        priceAtTransaction: product?.pricePerUnit ?? 0,
      };
    });

    const tx: Transaction = {
      id,
      clientId,
      items: snapshotItems,
      discount,
      additionalFee,
      totalPrice: calculateTotal(),
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
    <>
      <form
        onSubmit={handleSubmit}
        className='space-y-6 max-w-2xl mx-auto bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-2xl shadow-xl px-6 py-8 border border-gray-200 dark:border-white/10'
      >
        <h1 className='text-2xl font-bold'>{t('title')}</h1>

        <div>
          <Label className='py-2'>{t('client')}</Label>
          <div className='flex items-start gap-2'>
            <div className='flex-1'>
              <ComboboxGeneric
                items={clients}
                selectedId={clientId}
                onSelect={val => setClientId(val)}
                displayKey='name'
                filterKeys={['name', 'address', 'phone']}
                placeholder={t('searchClient')}
                className={`w-full overflow-hidden text-ellipsis whitespace-nowrap ${
                  readOnly ? 'pointer-events-none bg-transparent text-foreground opacity-100' : ''
                }`}
                disabled={readOnly}
                addNewOption
                onAddNew={() => setClientModalOpen(true)}
              />
            </div>
            {!readOnly && (
              <Button
                type='button'
                variant='outline'
                onClick={() => setClientModalOpen(true)}
                className='text-sm whitespace-nowrap'
              >
                {t('newClient')}
              </Button>
            )}
          </div>

          {clientDetails && (
            <div
              className='text-sm text-muted-foreground mt-2 overflow-hidden text-ellipsis whitespace-nowrap'
              title={`${clientDetails.address}${clientDetails.phone ? `, ${t('phone')} ${clientDetails.phone}` : ''}`}
              style={{ direction: 'ltr', textAlign: 'left' }}
            >
              {clientDetails.address}
              {clientDetails.phone ? `, ${t('phone')} ${clientDetails.phone}` : ''}
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
                    <div className='flex-1 min-w-0'>
                      {readOnly ? (
                        <div
                          className='text-md text-foreground font-medium overflow-hidden text-ellipsis whitespace-nowrap'
                          title={product?.name}
                          style={{ direction: 'ltr', textAlign: 'left' }}
                        >
                          {product?.name ?? '–'}
                        </div>
                      ) : (
                        <ComboboxGeneric
                          items={products}
                          selectedId={item.productId}
                          onSelect={val => !readOnly && handleItemChange(index, 'productId', val)}
                          displayKey='name'
                          filterKeys={['name']}
                          placeholder={t('searchProduct')}
                          className={`w-full overflow-hidden text-ellipsis whitespace-nowrap ${
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
                    <div className='flex items-center pr-3'>
                      <Label className='py-2 mr-2'>{t('quantity')}</Label>
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
                          className={`${readOnly ? 'bg-transparent text-foreground opacity-100 border-none' : ''} w-24 shrink-0`}
                          disabled={readOnly}
                        />
                      )}
                      <span className='ml-2 text-muted-foreground whitespace-nowrap'>{product?.unit || ''}</span>
                      {(products.find(p => p.id === item.productId)?.type || 'product') === 'service' && (
                        <span className='ml-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded'>
                          {itemTypeT('service')}
                        </span>
                      )}
                      {(products.find(p => p.id === item.productId)?.type || 'product') === 'product' && (
                        <span className='ml-2 text-xs font-semibold text-lime-600 dark:text-lime-400 bg-lime-100 dark:bg-lime-900 px-2 py-0.5 rounded'>
                          {itemTypeT('product')}
                        </span>
                      )}
                    </div>
                    {product?.name.toLowerCase() === itemTypeT('travel').toLowerCase() &&
                      product?.unit === 'km' &&
                      !readOnly && (
                        <div className='text-sm text-red-600 dark:text-red-400 mt-1 font-semibold'>
                          {t('travelNote')}
                        </div>
                      )}
                    <div className='flex flex-row sm:flex-row gap-6 text-sm sm:text-base pt-3'>
                      <div className='text-gray-700 dark:text-gray-200 text-sm'>
                        <span className='font-semibold'>{t('price')}</span>{' '}
                        {item.priceAtTransaction != null
                          ? `${item.priceAtTransaction.toFixed(2)} ${currency}/${product?.unit ?? ''}`
                          : product
                          ? `${product.pricePerUnit.toFixed(2)} ${currency}/${product.unit}`
                          : '—'}
                      </div>
                      <div className='text-gray-700 dark:text-gray-200'>
                        <span className='font-semibold'>{t('total')}</span>{' '}
                        <span className='text-green-700 dark:text-green-400 font-bold'>
                          {itemTotal.toFixed(2)} {currency}
                        </span>
                      </div>
                    </div>
                  </div>
                  {item.priceAtTransaction != null && product && item.priceAtTransaction !== product.pricePerUnit && (
                    <div className='text-sm text-yellow-600 dark:text-yellow-400'>
                      {t('priceChanged', { price: product.pricePerUnit.toFixed(2), currency })}
                    </div>
                  )}
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
                {t('addProduct')}
              </Button>
            )}
          </div>
        </div>

        <div>
          <Label className='py-2'>{t('discount')}</Label>
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

            <span>{currency}</span>
          </div>
        </div>

        <div>
          <Label className='py-2'>{t('additionalFee')}</Label>
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

            <span>{currency}</span>
          </div>
        </div>

        <div className='text-xl font-semibold text-right text-green-700 dark:text-green-300'>
          {t('totalAmount', { amount: calculateTotal().toFixed(2), currency })}
        </div>

        <div>
          <Label htmlFor='description' className='py-2'>
            {t('note')}
          </Label>
          <textarea
            id='description'
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t('notePlaceholder')}
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
            {t('finalise')}
          </Button>
        ) : (
          !readOnly &&
          status !== 'draft' && (
            <div className='flex gap-2'>
              <Button type='submit'>{t('save')}</Button>
              <Button type='button' variant='outline' onClick={onCancel}>
                {t('cancel')}
              </Button>
            </div>
          )
        )}
      </form>
      <ClientModal
        open={isClientModalOpen}
        onClose={() => setClientModalOpen(false)}
        onClientCreated={id => {
          const updatedClients = getClients();
          setClients(updatedClients);
          setClientId(id);
        }}
      />
    </>
  );
}

import * as React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@uidotdev/usehooks';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogTitle } from '@/components/ui/dialog';
import { Item } from '@/types';
import { useTranslations } from 'next-intl';

interface ComboboxGenericProps {
  items: Item[];
  selectedId: string;
  onSelect: (id: string) => void;
  placeholder?: string;
  displayKey: string;
  filterKeys?: string[];
  className?: string;
  disabled?: boolean;
  addNewOption?: boolean;
  onAddNew?: () => void;
}

export function ComboboxGeneric({
  items,
  selectedId,
  onSelect,
  placeholder = 'Select...',
  displayKey,
  filterKeys = [],
  className = '',
  disabled = false,
  onAddNew
}: ComboboxGenericProps) {
  const t = useTranslations('combobox');
  const itemTypeT = useTranslations('itemType');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [open, setOpen] = React.useState(false);
  const selectedItem = items.find(i => i.id === selectedId);
  placeholder = t('select');

  const renderBadge = (type: string | undefined) => {
    if (type === 'product')
      return (
        <span className='ml-2 px-2 py-0.5 text-xs font-medium bg-lime-100 text-lime-800 dark:bg-lime-800 dark:text-lime-100 rounded'>
          {itemTypeT('product')}
        </span>
      );
    if (type === 'service')
      return (
        <span className='ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 rounded'>
          {itemTypeT('service')}
        </span>
      );
    return null;
  };

  const List = ({ close }: { close: () => void }) => (
    <Command>
      <CommandInput placeholder={t('search')} disabled={disabled} />
      <CommandList>
        <CommandEmpty>{t('noResults')}</CommandEmpty>
        <CommandGroup>
          {items.map(item => {
            const searchValue =
              filterKeys.length > 0
                ? filterKeys
                    .map(key => String((item as Record<string, unknown>)[key] ?? ''))
                    .join(' ')
                : String(item[displayKey]);
            return (
              <CommandItem
                key={item.id}
                value={searchValue}
              onSelect={() => {
                if (!disabled) {
                  onSelect(item.id);
                  close();
                }
              }}
              title={String(item[displayKey])}
              className='truncate flex items-center justify-between'
            >
              <span className='truncate'>{String(item[displayKey])}</span>
              {renderBadge(item.type)}
            </CommandItem>
            );
          })}
          {onAddNew && (
            <CommandItem
              key='__add_new'
              onSelect={() => {
                onAddNew();
                close();
              }}
              className='text-indigo-600 dark:text-indigo-400 font-semibold'
            >
              {t('addNew')}
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  const buttonText = selectedItem ? String(selectedItem[displayKey]) : placeholder;

  const buttonContent = (
    <span className='truncate overflow-hidden whitespace-nowrap text-left w-full' title={buttonText}>
      {buttonText}
    </span>
  );

  const buttonClass = `w-full justify-start min-w-0 ${className}`.trim();

  if (isDesktop) {
    return (
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' className={buttonClass} disabled={disabled}>
            {buttonContent}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0' align='start'>
          <List close={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open && !disabled} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant='outline' className={buttonClass} disabled={disabled}>
          {buttonContent}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <VisuallyHidden>
          <DialogTitle>{t('selectTitle')}</DialogTitle>
        </VisuallyHidden>
        <div className='mt-4 border-t'>
          <List close={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

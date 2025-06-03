'use client';

import * as React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@uidotdev/usehooks';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogTitle } from '@/components/ui/dialog';
import { Item } from '@/types';

interface ComboboxGenericProps {
  items: Item[];
  selectedId: string;
  onSelect: (id: string) => void;
  placeholder?: string;
  displayKey: string;
  filterKeys?: string[];
  className?: string;
  disabled?: boolean;
}

export function ComboboxGeneric({
  items,
  selectedId,
  onSelect,
  placeholder = 'Wybierz...',
  displayKey,
  className,
  disabled = false,
}: ComboboxGenericProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [open, setOpen] = React.useState(false);
  const selectedItem = items.find(i => i.id === selectedId);

  const List = ({ close }: { close: () => void }) => (
    <Command>
      <CommandInput placeholder='Szukaj...' disabled={disabled} />
      <CommandList>
        <CommandEmpty>Brak wyników.</CommandEmpty>
        <CommandGroup>
          {items.map(item => (
            <CommandItem
              key={item.id}
              value={String(item[displayKey])} // ważne: to jest używane do filtrowania
              onSelect={() => {
                if (!disabled) {
                  onSelect(item.id);
                  close();
                }
              }}
            >
              {String(item[displayKey])}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  const buttonText = selectedItem ? selectedItem[displayKey] : placeholder;

  if (isDesktop) {
    return (
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' className={className || 'w-full justify-start'} disabled={disabled}>
            {String(buttonText)}
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
        <Button variant='outline' className={className || 'w-full justify-start'} disabled={disabled}>
          {String(buttonText)}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <VisuallyHidden>
          <DialogTitle>Wybierz opcję</DialogTitle>
        </VisuallyHidden>
        <div className='mt-4 border-t'>
          <List close={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

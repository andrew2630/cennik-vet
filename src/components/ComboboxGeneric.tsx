'use client'

import * as React from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useMediaQuery } from "@uidotdev/usehooks";

type Item = { [key: string]: any }

interface ComboboxGenericProps {
  items: Item[]
  selectedId: string
  onSelect: (id: string) => void
  placeholder?: string
  displayKey: string
  filterKeys?: string[]
  className?: string
}

export function ComboboxGeneric({
  items,
  selectedId,
  onSelect,
  placeholder = 'Wybierz...',
  displayKey,
  filterKeys = [displayKey],
  className,
}: ComboboxGenericProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [open, setOpen] = React.useState(false)
  const selectedItem = items.find(i => i.id === selectedId)

  const filteredItems = (query: string) =>
    items.filter(item =>
      filterKeys.some(key =>
        String(item[key] || '')
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    )

  const List = ({ close }: { close: () => void }) => (
    <Command
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Szukaj..."
        onValueChange={(input) => {
          // filtering will be done inline
        }}
      />
      <CommandList>
        <CommandEmpty>Brak wyników.</CommandEmpty>
        <CommandGroup>
          {filteredItems('').map(item => (
            <CommandItem
              key={item.id}
              value={item.id}
              onSelect={() => {
                onSelect(item.id)
                close()
              }}
            >
              {item[displayKey]}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )

  const buttonText = selectedItem ? selectedItem[displayKey] : placeholder

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={className || 'w-full justify-start'}>
            {buttonText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <List close={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className={className || 'w-full justify-start'}>
          {buttonText}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <List close={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

import { cn } from '../src/lib/utils'
import { buildSearchValue } from '../src/components/ComboboxGeneric'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'text-sm')).toBe('px-2 text-sm')
  })

  it('deduplicates conflicting classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('buildSearchValue', () => {
  const item = { id: '1', name: 'John', address: 'Main', phone: '123' }
  it('includes display key by default', () => {
    expect(buildSearchValue(item, 'name')).toBe('John')
  })

  it('includes additional filter keys', () => {
    expect(buildSearchValue(item, 'name', ['address', 'phone'])).toBe(
      'John Main 123'
    )
  })
})

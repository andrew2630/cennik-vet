import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getSearchValue } from '../ComboboxGeneric';
import type { Item } from '@/types';

describe('getSearchValue', () => {
  it('includes displayKey value', () => {
    const item: Item = { id: '1', name: 'Apple' };
    const result = getSearchValue(item, 'name', ['category']);
    assert.ok(result.toLowerCase().includes('apple'));
  });

  it('includes filterKeys values', () => {
    const item: Item = { id: '1', name: 'Apple', category: 'Fruit' };
    const result = getSearchValue(item, 'name', ['category']);
    assert.ok(result.toLowerCase().includes('fruit'));
  });
});

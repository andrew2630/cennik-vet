import { queueOperation, syncQueue } from './syncSupabase'
import { notifyDataUpdated } from './dataUpdateEvent'
import { storageKey } from './userStorage'
import type { Product, Client, Transaction } from '@/types'

interface Operation {
  type: 'upsert' | 'delete'
  table: 'products' | 'clients' | 'transactions'
  data?: Product | Client | Transaction
  id?: string
}

function mergeById<T extends { id: string; updatedAt?: string }>(
  base: T[],
  extra: T[],
): T[] {
  const map = new Map(base.map(i => [i.id, i]))
  for (const item of extra) {
    const existing = map.get(item.id)
    if (!existing) {
      map.set(item.id, item)
      continue
    }
    const baseTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0
    const extraTime = item.updatedAt ? new Date(item.updatedAt).getTime() : 0
    if (extraTime > baseTime) map.set(item.id, item)
  }
  return Array.from(map.values())
}

export async function includeOfflineData(userId: string) {
  if (typeof window === 'undefined') return

  const localProducts = JSON.parse(localStorage.getItem('vet_products_local') || '[]') as Product[]
  const localClients = JSON.parse(localStorage.getItem('vet_clients_local') || '[]') as Client[]
  const localTransactions = JSON.parse(localStorage.getItem('vet_transactions_local') || '[]') as Transaction[]

  const userProducts = JSON.parse(localStorage.getItem(storageKey('vet_products')) || '[]') as Product[]
  const userClients = JSON.parse(localStorage.getItem(storageKey('vet_clients')) || '[]') as Client[]
  const userTransactions = JSON.parse(localStorage.getItem(storageKey('vet_transactions')) || '[]') as Transaction[]

  const mergedProducts = mergeById(userProducts, localProducts)
  const mergedClients = mergeById(userClients, localClients)
  const mergedTransactions = mergeById(userTransactions, localTransactions)

  localStorage.setItem(storageKey('vet_products'), JSON.stringify(mergedProducts))
  localStorage.setItem(storageKey('vet_clients'), JSON.stringify(mergedClients))
  localStorage.setItem(storageKey('vet_transactions'), JSON.stringify(mergedTransactions))

  const localQueue = JSON.parse(localStorage.getItem('vet_supabase_queue_local') || '[]') as Operation[]
  localQueue.forEach(op => queueOperation(op))

  localStorage.removeItem('vet_products_local')
  localStorage.removeItem('vet_clients_local')
  localStorage.removeItem('vet_transactions_local')
  localStorage.removeItem('vet_supabase_queue_local')

  notifyDataUpdated()
  await syncQueue(userId)
}

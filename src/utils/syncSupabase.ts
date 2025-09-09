'use client'

import { supabase } from './supabaseClient'
import { notifyDataUpdated } from './dataUpdateEvent'
import { Client, Product, Transaction } from '@/types'
import { storageKey } from './userStorage'
import { normalizeProduct } from './normalizeProduct'

function snakeCaseKeys<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/([A-Z])/g, '_$1').toLowerCase(),
      value,
    ]),
  )
}

function nullifyEmptyStrings(obj: unknown): unknown {
  if (obj === '') return null
  if (Array.isArray(obj)) return obj.map(item => nullifyEmptyStrings(item))
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, nullifyEmptyStrings(v)]),
    )
  }
  return obj
}

function camelCaseKeys<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      value,
    ]),
  )
}

interface Operation {
  type: 'upsert' | 'delete'
  table: 'products' | 'clients' | 'transactions'
  data?: Product | Client | Transaction
  id?: string
}

const QUEUE_KEY_BASE = 'vet_supabase_queue'
const QUEUE_KEY = () => storageKey(QUEUE_KEY_BASE)

function getQueue(): Operation[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY()) || '[]') as Operation[]
  } catch {
    return []
  }
}

function saveQueue(queue: Operation[]) {
  localStorage.setItem(QUEUE_KEY(), JSON.stringify(queue))
}

export async function queueOperation(op: Operation) {
  if (typeof window === 'undefined') return

  const queue = getQueue()
  const opId = op.data ? (op.data as { id: string }).id : op.id

  const updatedQueue = queue.filter(q => {
    const qId = q.data ? (q.data as { id: string }).id : q.id
    return !(q.table === op.table && qId === opId)
  })

  updatedQueue.push(op)
  saveQueue(updatedQueue)

  try {
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id
    if (userId) await syncQueue(userId)
  } catch (e) {
    console.error('Supabase auto-sync error', e)
  }
}

let isSyncing = false

export async function syncQueue(userId: string) {
  if (typeof navigator === 'undefined' || !navigator.onLine || isSyncing) return

  isSyncing = true

  try {
    const queue = getQueue()
    const priority: Record<Operation['table'], number> = {
      products: 0,
      clients: 1,
      transactions: 2,
    }
    queue.sort((a, b) => priority[a.table] - priority[b.table])
    saveQueue(queue)
    while (queue.length > 0) {
      const op = queue[0]
      try {
        const { error } =
          op.type === 'upsert' && op.data
            ? await supabase
                .from(op.table)
                .upsert(
                  nullifyEmptyStrings(
                    snakeCaseKeys({ ...op.data, user_id: userId }),
                  ) as Record<string, unknown>,
                )
            : op.type === 'delete' && op.id
              ? await supabase.from(op.table).delete().eq('id', op.id)
              : { error: null }

        if (error) {
          console.error('Supabase sync error', error)
          break
        }

        queue.shift()
        saveQueue(queue)
      } catch (e) {
        console.error('Supabase sync error', e)
        break
      }
    }
  } finally {
    isSyncing = false
  }
}

function mergeById<T extends { id: string; updatedAt?: string }>(
  local: T[],
  remote: T[],
): T[] {
  const map = new Map(local.map(i => [i.id, i]))
  for (const item of remote) {
    const existing = map.get(item.id)
    if (!existing) {
      map.set(item.id, item)
      continue
    }

    const localTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0
    const remoteTime = item.updatedAt ? new Date(item.updatedAt).getTime() : 0
    if (remoteTime > localTime) {
      map.set(item.id, item)
    }
  }
  return Array.from(map.values())
}

export async function downloadUserData(userId: string) {
  if (typeof navigator === 'undefined' || !navigator.onLine) return

  try {
    const [productsRes, clientsRes, transactionsRes] = await Promise.all([
      supabase.from('products').select('*').eq('user_id', userId),
      supabase.from('clients').select('*').eq('user_id', userId),
      supabase.from('transactions').select('*').eq('user_id', userId),
    ])

    if (productsRes.error || clientsRes.error || transactionsRes.error) {
      console.error(
        'Supabase download error',
        productsRes.error || clientsRes.error || transactionsRes.error,
      )
      return
    }

    const products = (productsRes.data || []).map(r => {
      const { updated_at, ...rest } = r as Record<string, unknown>
      return normalizeProduct({
        ...(camelCaseKeys(rest) as Product),
        updatedAt: updated_at as string,
      })
    })
    const clients = (clientsRes.data || []).map(r => {
      const { updated_at, ...rest } = r as Record<string, unknown>
      return { ...(camelCaseKeys(rest) as Client), updatedAt: updated_at as string }
    })
    const transactions = (transactionsRes.data || []).map(r => {
      const { updated_at, ...rest } = r as Record<string, unknown>
      const tx = { ...(camelCaseKeys(rest) as Transaction), updatedAt: updated_at as string }
      return { ...tx, paymentMethod: (tx as any).paymentMethod ?? 'cash' }
    })

    const mergedProducts = mergeById(
      JSON.parse(localStorage.getItem(storageKey('vet_products')) || '[]'),
      products,
    ).map(normalizeProduct)
    const mergedClients = mergeById(
      JSON.parse(localStorage.getItem(storageKey('vet_clients')) || '[]'),
      clients,
    )
    const mergedTransactions = mergeById(
      JSON.parse(localStorage.getItem(storageKey('vet_transactions')) || '[]'),
      transactions,
    ).map(t => ({ ...t, paymentMethod: t.paymentMethod ?? 'cash' }))

    localStorage.setItem(storageKey('vet_products'), JSON.stringify(mergedProducts))
    localStorage.setItem(storageKey('vet_clients'), JSON.stringify(mergedClients))
    localStorage.setItem(storageKey('vet_transactions'), JSON.stringify(mergedTransactions))
    notifyDataUpdated()
  } catch (e) {
    console.error('Supabase download error', e)
  }
}

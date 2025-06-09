'use client'

import { supabase } from './supabaseClient'
import { Client, Product, Transaction } from '@/types'

function snakeCaseKeys<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/([A-Z])/g, '_$1').toLowerCase(),
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

const QUEUE_KEY = 'vet_supabase_queue'

function getQueue(): Operation[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as Operation[]
  } catch {
    return []
  }
}

function saveQueue(queue: Operation[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export async function queueOperation(op: Operation) {
  if (typeof window === 'undefined') return

  const queue = getQueue()
  queue.push(op)
  saveQueue(queue)

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
    while (queue.length > 0) {
      const op = queue[0]
      try {
        const { error } =
          op.type === 'upsert' && op.data
            ? await supabase
                .from(op.table)
                .upsert(snakeCaseKeys({ ...op.data, user_id: userId }))
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

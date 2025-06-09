import { supabase } from './supabaseClient'
import { Client, Product, Transaction } from '@/types'

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

export async function syncQueue(userId: string) {
  if (!navigator.onLine) return

  const queue = getQueue()
  for (const op of queue) {
    try {
      if (op.type === 'upsert' && op.data) {
        await supabase.from(op.table).upsert({ ...op.data, user_id: userId })
      } else if (op.type === 'delete' && op.id) {
        await supabase.from(op.table).delete().eq('id', op.id)
      }
    } catch (e) {
      console.error('Supabase sync error', e)
      return
    }
  }
  saveQueue([])
}

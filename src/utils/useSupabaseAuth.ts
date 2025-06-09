'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { syncQueue } from './syncSupabase'
import type { User } from '@supabase/supabase-js'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(res => setUser(res.data.user ?? null))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) return
    const handleOnline = () => syncQueue(user.id)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [user])

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email: email.trim(), password })

  const signUp = (email: string, password: string) =>
    supabase.auth.signUp({ email: email.trim(), password })

  const signOut = () => supabase.auth.signOut()

  return { user, signIn, signUp, signOut }
}

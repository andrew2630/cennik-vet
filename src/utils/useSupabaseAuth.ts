'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { syncQueue, downloadUserData } from './syncSupabase'
import { setCurrentUserId } from './userStorage'
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
    if (typeof window === 'undefined') return
    setCurrentUserId(user?.id ?? null)
  }, [user])

  useEffect(() => {
    if (!user) return
    const handleSync = () => {
      syncQueue(user.id)
        .then(() => downloadUserData(user.id))
        .catch(console.error)
    }
    window.addEventListener('online', handleSync)
    handleSync()
    const interval = setInterval(handleSync, 5 * 60 * 1000)
    return () => {
      window.removeEventListener('online', handleSync)
      clearInterval(interval)
    }
  }, [user])

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email: email.trim(), password })

  const signUp = (email: string, password: string) =>
    supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ''}/`,
      },
    })

  const signOut = () => supabase.auth.signOut()

  const deleteAccount = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) return { error: new Error('notLoggedIn') }
    const { error } = await supabase.auth.admin.deleteUser(data.user.id)
    if (!error) setUser(null)
    return { error }
  }

  return { user, signIn, signUp, signOut, deleteAccount }
}

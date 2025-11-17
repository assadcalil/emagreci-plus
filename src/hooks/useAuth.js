import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      } catch (err) {
        console.error('Auth init error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event)
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_OUT') {
          setError(null)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Sign up with email and password
  const signUp = useCallback(async (email, password, metadata = {}) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (signUpError) throw signUpError

      return { success: true, data }
    } catch (err) {
      console.error('Sign up error:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Sign in with email and password
  const signIn = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      return { success: true, data }
    } catch (err) {
      console.error('Sign in error:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError

      setUser(null)
      setSession(null)
      return { success: true }
    } catch (err) {
      console.error('Sign out error:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Reset password
  const resetPassword = useCallback(async (email) => {
    setLoading(true)
    setError(null)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) throw resetError

      return { success: true }
    } catch (err) {
      console.error('Reset password error:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Update password
  const updatePassword = useCallback(async (newPassword) => {
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      return { success: true }
    } catch (err) {
      console.error('Update password error:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Update user metadata
  const updateUserMetadata = useCallback(async (metadata) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: metadata
      })

      if (updateError) throw updateError

      return { success: true, data }
    } catch (err) {
      console.error('Update metadata error:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateUserMetadata,
    isAuthenticated: !!user
  }
}

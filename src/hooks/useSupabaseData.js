import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabase'

// Profile Hook
export function useSupabaseProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
        setProfile(data)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  const updateProfile = useCallback(async (updates) => {
    if (!userId) return { success: false, error: 'Not authenticated' }

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (updateError) throw updateError

      setProfile(data)
      return { success: true, data }
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [userId])

  return { profile, loading, error, updateProfile }
}

// Doses Hook
export function useSupabaseDoses(userId) {
  const [doses, setDoses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchDoses = async () => {
      try {
        const { data, error } = await supabase
          .from('doses')
          .select('*')
          .eq('user_id', userId)
          .order('data', { ascending: true })

        if (error) throw error
        setDoses(data || [])
      } catch (err) {
        console.error('Error fetching doses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDoses()
  }, [userId])

  const addDose = useCallback(async (dose) => {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('doses')
        .insert({
          user_id: userId,
          data: dose.data,
          horario: dose.horario,
          dosagem: dose.dosagem,
          local: dose.local,
          observacoes: dose.observacoes
        })
        .select()
        .single()

      if (error) throw error

      setDoses(prev => [...prev, data])
      return data
    } catch (err) {
      console.error('Error adding dose:', err)
      return null
    }
  }, [userId])

  return { doses, loading, addDose }
}

// Weights Hook
export function useSupabaseWeights(userId) {
  const [weights, setWeights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchWeights = async () => {
      try {
        const { data, error } = await supabase
          .from('weights')
          .select('*')
          .eq('user_id', userId)
          .order('data', { ascending: true })

        if (error) throw error
        setWeights(data || [])
      } catch (err) {
        console.error('Error fetching weights:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeights()
  }, [userId])

  const addWeight = useCallback(async (weight) => {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('weights')
        .insert({
          user_id: userId,
          data: weight.data,
          peso: weight.peso,
          observacoes: weight.observacoes || null
        })
        .select()
        .single()

      if (error) throw error

      setWeights(prev => [...prev, data])
      return data
    } catch (err) {
      console.error('Error adding weight:', err)
      return null
    }
  }, [userId])

  return { weights, loading, addWeight }
}

// Measurements Hook
export function useSupabaseMeasurements(userId) {
  const [measurements, setMeasurements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchMeasurements = async () => {
      try {
        const { data, error } = await supabase
          .from('measurements')
          .select('*')
          .eq('user_id', userId)
          .order('data', { ascending: true })

        if (error) throw error
        setMeasurements(data || [])
      } catch (err) {
        console.error('Error fetching measurements:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMeasurements()
  }, [userId])

  const addMeasurement = useCallback(async (measurement) => {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('measurements')
        .insert({
          user_id: userId,
          data: measurement.data,
          cintura: measurement.cintura,
          quadril: measurement.quadril,
          braco: measurement.braco,
          coxa: measurement.coxa,
          peito: measurement.peito,
          pescoco: measurement.pescoco || null,
          observacoes: measurement.observacoes || null
        })
        .select()
        .single()

      if (error) throw error

      setMeasurements(prev => [...prev, data])
      return data
    } catch (err) {
      console.error('Error adding measurement:', err)
      return null
    }
  }, [userId])

  const updateMeasurement = useCallback(async (id, measurement) => {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('measurements')
        .update({
          data: measurement.data,
          cintura: measurement.cintura,
          quadril: measurement.quadril,
          braco: measurement.braco,
          coxa: measurement.coxa,
          peito: measurement.peito,
          pescoco: measurement.pescoco || null,
          observacoes: measurement.observacoes || null
        })
        .eq('id', id)
        .eq('user_id', userId) // Segurança adicional
        .select()
        .single()

      if (error) throw error

      setMeasurements(prev => prev.map(m => m.id === id ? data : m))
      return data
    } catch (err) {
      console.error('Error updating measurement:', err)
      return null
    }
  }, [userId])

  const deleteMeasurement = useCallback(async (id) => {
    if (!userId) return false

    try {
      const { error } = await supabase
        .from('measurements')
        .delete()
        .eq('id', id)
        .eq('user_id', userId) // Segurança adicional

      if (error) throw error

      setMeasurements(prev => prev.filter(m => m.id !== id))
      return true
    } catch (err) {
      console.error('Error deleting measurement:', err)
      return false
    }
  }, [userId])

  return { measurements, loading, addMeasurement, updateMeasurement, deleteMeasurement }
}

// Side Effects Hook
export function useSupabaseSideEffects(userId) {
  const [sideEffects, setSideEffects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchSideEffects = async () => {
      try {
        const { data, error } = await supabase
          .from('side_effects')
          .select('*')
          .eq('user_id', userId)
          .order('data', { ascending: true })

        if (error) throw error
        setSideEffects(data || [])
      } catch (err) {
        console.error('Error fetching side effects:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSideEffects()
  }, [userId])

  const addSideEffect = useCallback(async (effect) => {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('side_effects')
        .insert({
          user_id: userId,
          data: effect.data,
          horario: effect.horario,
          tipo: effect.tipo,
          tipo_label: effect.tipoLabel,
          tipo_icon: effect.tipoIcon,
          intensidade: effect.intensidade,
          duracao: effect.duracao,
          observacoes: effect.observacoes
        })
        .select()
        .single()

      if (error) throw error

      setSideEffects(prev => [...prev, data])
      return data
    } catch (err) {
      console.error('Error adding side effect:', err)
      return null
    }
  }, [userId])

  return { sideEffects, loading, addSideEffect }
}

// Goals Hook
export function useSupabaseGoals(userId) {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchGoals = async () => {
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .order('data_criacao', { ascending: false })

        if (error) throw error
        setGoals(data || [])
      } catch (err) {
        console.error('Error fetching goals:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [userId])

  const addGoal = useCallback(async (goal) => {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          titulo: goal.titulo,
          tipo: goal.tipo,
          valor_alvo: goal.valorAlvo,
          valor_atual: goal.valorAtual
        })
        .select()
        .single()

      if (error) throw error

      setGoals(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error adding goal:', err)
      return null
    }
  }, [userId])

  const toggleGoal = useCallback(async (goalId) => {
    if (!userId) return false

    const goal = goals.find(g => g.id === goalId)
    if (!goal) return false

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          concluida: !goal.concluida,
          data_conclusao: !goal.concluida ? new Date().toISOString() : null
        })
        .eq('id', goalId)
        .eq('user_id', userId)

      if (error) throw error

      setGoals(prev =>
        prev.map(g =>
          g.id === goalId
            ? { ...g, concluida: !g.concluida, data_conclusao: !g.concluida ? new Date().toISOString() : null }
            : g
        )
      )
      return true
    } catch (err) {
      console.error('Error toggling goal:', err)
      return false
    }
  }, [userId, goals])

  const deleteGoal = useCallback(async (goalId) => {
    if (!userId) return false

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId)

      if (error) throw error

      setGoals(prev => prev.filter(g => g.id !== goalId))
      return true
    } catch (err) {
      console.error('Error deleting goal:', err)
      return false
    }
  }, [userId])

  return { goals, loading, addGoal, toggleGoal, deleteGoal }
}

// Subscription Hook (with Stripe)
export function useSupabaseSubscription(userId) {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error && error.code !== 'PGRST116') throw error
        setSubscription(data)
      } catch (err) {
        console.error('Error fetching subscription:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [userId])

  const updateSubscription = useCallback(async (updates) => {
    if (!userId) return { success: false }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setSubscription(data)
      return { success: true, data }
    } catch (err) {
      console.error('Error updating subscription:', err)
      return { success: false, error: err.message }
    }
  }, [userId])

  const subscribe = useCallback(async (planId, stripeData = {}) => {
    const now = new Date()
    let expiresAt

    if (stripeData.billingPeriod === 'yearly') {
      expiresAt = new Date(now.setFullYear(now.getFullYear() + 1))
    } else {
      expiresAt = new Date(now.setMonth(now.getMonth() + 1))
    }

    return updateSubscription({
      plan_id: planId,
      status: 'active',
      stripe_subscription_id: stripeData.subscriptionId || null,
      stripe_customer_id: stripeData.customerId || null,
      billing_period: stripeData.billingPeriod || 'monthly',
      start_date: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    })
  }, [updateSubscription])

  const startTrial = useCallback(async () => {
    const now = new Date()
    const expiresAt = new Date(now.setDate(now.getDate() + 3))

    return updateSubscription({
      plan_id: 'basic',
      status: 'trial',
      billing_period: 'monthly',
      start_date: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    })
  }, [updateSubscription])

  const cancelSubscription = useCallback(async () => {
    return updateSubscription({
      status: 'cancelled'
    })
  }, [updateSubscription])

  const isSubscribed = useCallback(() => {
    if (!subscription) return false
    if (subscription.status === 'cancelled') return false
    if (new Date(subscription.expires_at) < new Date()) return false
    return subscription.status === 'active' || subscription.status === 'trial'
  }, [subscription])

  const getDaysRemaining = useCallback(() => {
    if (!subscription?.expires_at) return 0
    const diff = new Date(subscription.expires_at) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [subscription])

  return {
    subscription,
    loading,
    subscribe,
    startTrial,
    cancelSubscription,
    isSubscribed,
    getDaysRemaining,
    updateSubscription
  }
}

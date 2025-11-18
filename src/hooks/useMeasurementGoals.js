import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../config/supabase'

/**
 * Hook para gerenciar metas de medidas corporais
 * Usa a tabela goals com tipo "measurement_{campo}"
 */
export function useMeasurementGoals(userId, measurements) {
  const [measurementGoals, setMeasurementGoals] = useState({
    cintura: null,
    quadril: null,
    braco: null,
    coxa: null,
    peito: null
  })
  const [loading, setLoading] = useState(true)

  // Buscar metas de medidas do banco
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchMeasurementGoals = async () => {
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .like('tipo', 'measurement_%')
          .eq('concluida', false)

        if (error) throw error

        // Organizar por campo
        const goals = {}
        ;['cintura', 'quadril', 'braco', 'coxa', 'peito'].forEach(field => {
          const goal = data?.find(g => g.tipo === `measurement_${field}`)
          goals[field] = goal ? {
            id: goal.id,
            target: parseFloat(goal.valor_alvo),
            createdAt: goal.data_criacao
          } : null
        })

        setMeasurementGoals(goals)
      } catch (err) {
        console.error('Error fetching measurement goals:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMeasurementGoals()
  }, [userId])

  // Calcular progresso de cada meta
  const getProgress = useCallback((field) => {
    const goal = measurementGoals[field]
    if (!goal || !measurements || measurements.length === 0) return null

    // Pegar valor mais recente
    const latestMeasurement = measurements[0]
    const current = parseFloat(latestMeasurement[field])
    if (!current) return null

    // Pegar valor inicial (primeira medida após criar a meta)
    const goalDate = new Date(goal.createdAt)
    const measurementsAfterGoal = measurements
      .filter(m => new Date(m.data) >= goalDate)
      .sort((a, b) => new Date(a.data) - new Date(b.data))

    const initial = measurementsAfterGoal.length > 0
      ? parseFloat(measurementsAfterGoal[measurementsAfterGoal.length - 1][field])
      : current

    if (!initial) return null

    const target = goal.target
    const totalChange = initial - target
    const currentChange = initial - current
    const percentage = totalChange !== 0 ? (currentChange / totalChange) * 100 : 0

    return {
      initial,
      current,
      target,
      remaining: current - target,
      percentage: Math.min(Math.max(percentage, 0), 100),
      achieved: current <= target
    }
  }, [measurementGoals, measurements])

  // Definir meta para um campo
  const setGoal = useCallback(async (field, targetValue) => {
    if (!userId) return false

    try {
      // Verificar se já existe meta para este campo
      const existingGoal = measurementGoals[field]

      if (existingGoal) {
        // Atualizar meta existente
        const { error } = await supabase
          .from('goals')
          .update({
            valor_alvo: targetValue,
            titulo: `Meta: ${field} ${targetValue}cm`
          })
          .eq('id', existingGoal.id)

        if (error) throw error

        setMeasurementGoals(prev => ({
          ...prev,
          [field]: {
            ...existingGoal,
            target: targetValue
          }
        }))
      } else {
        // Criar nova meta
        const { data, error } = await supabase
          .from('goals')
          .insert({
            user_id: userId,
            titulo: `Meta: ${field} ${targetValue}cm`,
            tipo: `measurement_${field}`,
            valor_alvo: targetValue,
            concluida: false
          })
          .select()
          .single()

        if (error) throw error

        setMeasurementGoals(prev => ({
          ...prev,
          [field]: {
            id: data.id,
            target: targetValue,
            createdAt: data.data_criacao
          }
        }))
      }

      return true
    } catch (err) {
      console.error('Error setting measurement goal:', err)
      return false
    }
  }, [userId, measurementGoals])

  // Remover meta de um campo
  const removeGoal = useCallback(async (field) => {
    if (!userId) return false

    const goal = measurementGoals[field]
    if (!goal) return false

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goal.id)
        .eq('user_id', userId)

      if (error) throw error

      setMeasurementGoals(prev => ({
        ...prev,
        [field]: null
      }))

      return true
    } catch (err) {
      console.error('Error removing measurement goal:', err)
      return false
    }
  }, [userId, measurementGoals])

  // Marcar meta como concluída
  const completeGoal = useCallback(async (field) => {
    if (!userId) return false

    const goal = measurementGoals[field]
    if (!goal) return false

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          concluida: true,
          data_conclusao: new Date().toISOString()
        })
        .eq('id', goal.id)

      if (error) throw error

      setMeasurementGoals(prev => ({
        ...prev,
        [field]: null
      }))

      return true
    } catch (err) {
      console.error('Error completing measurement goal:', err)
      return false
    }
  }, [userId, measurementGoals])

  return {
    measurementGoals,
    loading,
    getProgress,
    setGoal,
    removeGoal,
    completeGoal
  }
}

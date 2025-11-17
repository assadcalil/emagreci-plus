import { useState } from 'react'

// Hook seguro para localStorage com tratamento de erros
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

// Hook para gerenciar dados do perfil
export function useProfile() {
  return useLocalStorage('userProfile', null)
}

// Hook para gerenciar doses
export function useDoses() {
  const [doses, setDoses] = useLocalStorage('doses', [])

  const addDose = (dose) => {
    const newDose = {
      ...dose,
      id: `dose_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }
    setDoses([...doses, newDose])
    return newDose
  }

  const deleteDose = (id) => {
    setDoses(doses.filter(d => d.id !== id))
  }

  return { doses, addDose, deleteDose, setDoses }
}

// Hook para gerenciar pesos
export function useWeights() {
  const [weights, setWeights] = useLocalStorage('weights', [])

  const addWeight = (weight) => {
    const newWeight = {
      ...weight,
      id: `weight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      peso: parseFloat(weight.peso)
    }
    setWeights([...weights, newWeight])
    return newWeight
  }

  const deleteWeight = (id) => {
    setWeights(weights.filter(w => w.id !== id))
  }

  return { weights, addWeight, deleteWeight, setWeights }
}

// Hook para gerenciar medidas corporais
export function useMeasurements() {
  const [measurements, setMeasurements] = useLocalStorage('measurements', [])

  const addMeasurement = (measurement) => {
    const newMeasurement = {
      ...measurement,
      id: `measure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }
    setMeasurements([...measurements, newMeasurement])
    return newMeasurement
  }

  const deleteMeasurement = (id) => {
    setMeasurements(measurements.filter(m => m.id !== id))
  }

  return { measurements, addMeasurement, deleteMeasurement, setMeasurements }
}

// Hook para gerenciar efeitos colaterais
export function useSideEffects() {
  const [sideEffects, setSideEffects] = useLocalStorage('sideEffects', [])

  const addSideEffect = (effect) => {
    const newEffect = {
      ...effect,
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }
    setSideEffects([...sideEffects, newEffect])
    return newEffect
  }

  const deleteSideEffect = (id) => {
    setSideEffects(sideEffects.filter(e => e.id !== id))
  }

  return { sideEffects, addSideEffect, deleteSideEffect, setSideEffects }
}

// Hook para gerenciar metas
export function useGoals() {
  const [goals, setGoals] = useLocalStorage('goals', [])

  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      completed: false
    }
    setGoals([...goals, newGoal])
    return newGoal
  }

  const toggleGoal = (id) => {
    setGoals(goals.map(g =>
      g.id === id ? { ...g, completed: !g.completed, completedAt: !g.completed ? new Date().toISOString() : null } : g
    ))
  }

  const deleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id))
  }

  return { goals, addGoal, toggleGoal, deleteGoal, setGoals }
}

// Hook para lembretes
export function useReminders() {
  const [reminders, setReminders] = useLocalStorage('reminders', {
    enabled: false,
    dayOfWeek: 0, // 0 = Domingo
    time: '08:00',
    lastReminder: null
  })

  const updateReminders = (newSettings) => {
    setReminders({ ...reminders, ...newSettings })
  }

  return { reminders, updateReminders }
}

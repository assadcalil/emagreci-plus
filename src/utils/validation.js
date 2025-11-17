// Validação robusta de dados médicos

export const validateWeight = (weight) => {
  const w = parseFloat(weight)
  if (isNaN(w)) return { valid: false, error: 'Peso inválido' }
  if (w < 20) return { valid: false, error: 'Peso muito baixo (mín: 20kg)' }
  if (w > 400) return { valid: false, error: 'Peso muito alto (máx: 400kg)' }
  return { valid: true }
}

export const validateHeight = (height) => {
  const h = parseFloat(height)
  if (isNaN(h)) return { valid: false, error: 'Altura inválida' }
  if (h < 100) return { valid: false, error: 'Altura muito baixa (mín: 100cm)' }
  if (h > 250) return { valid: false, error: 'Altura muito alta (máx: 250cm)' }
  return { valid: true }
}

export const validateDosage = (dosage) => {
  const d = parseFloat(dosage)
  if (isNaN(d)) return { valid: false, error: 'Dosagem inválida' }
  if (d <= 0) return { valid: false, error: 'Dosagem deve ser maior que 0' }
  if (d > 15) return { valid: false, error: 'Dosagem muito alta (máx: 15mg)' }
  return { valid: true }
}

export const validateAge = (birthDate) => {
  const birth = new Date(birthDate)
  const today = new Date()
  const age = Math.floor((today - birth) / (365.25 * 24 * 60 * 60 * 1000))

  if (age < 18) return { valid: false, error: 'Idade mínima: 18 anos' }
  if (age > 120) return { valid: false, error: 'Data de nascimento inválida' }
  return { valid: true, age }
}

export const validateMeasurement = (value, type) => {
  const v = parseFloat(value)
  if (isNaN(v)) return { valid: false, error: 'Valor inválido' }

  const ranges = {
    cintura: { min: 40, max: 200, label: 'Cintura' },
    quadril: { min: 40, max: 200, label: 'Quadril' },
    braco: { min: 15, max: 80, label: 'Braço' },
    coxa: { min: 30, max: 120, label: 'Coxa' },
    pescoco: { min: 20, max: 60, label: 'Pescoço' }
  }

  const range = ranges[type]
  if (!range) return { valid: true }

  if (v < range.min) return { valid: false, error: `${range.label} muito baixo` }
  if (v > range.max) return { valid: false, error: `${range.label} muito alto` }
  return { valid: true }
}

export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Nome deve ter pelo menos 2 caracteres' }
  }
  if (name.trim().length > 100) {
    return { valid: false, error: 'Nome muito longo' }
  }
  return { valid: true }
}

export const validateDate = (dateString) => {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Data inválida' }
  }

  const today = new Date()
  const oneYearAgo = new Date(today.setFullYear(today.getFullYear() - 1))

  if (date > new Date()) {
    return { valid: false, error: 'Data não pode ser no futuro' }
  }

  if (date < oneYearAgo) {
    return { valid: false, error: 'Data muito antiga (máx: 1 ano atrás)' }
  }

  return { valid: true }
}

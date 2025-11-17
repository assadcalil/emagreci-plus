import { useState } from 'react'
import { validateWeight, validateDate } from '../utils/validation'
import './WeightRegistration.css'

function WeightRegistration({ onSave, onClose, currentWeight }) {
  const [weightData, setWeightData] = useState({
    data: new Date().toISOString().split('T')[0],
    peso: currentWeight || '',
    observacoes: ''
  })
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    // Validar peso
    const weightValidation = validateWeight(weightData.peso)
    if (!weightValidation.valid) {
      newErrors.peso = weightValidation.error
    }

    // Validar data
    const dateValidation = validateDate(weightData.data)
    if (!dateValidation.valid) {
      newErrors.data = dateValidation.error
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      ...weightData,
      peso: parseFloat(weightData.peso)
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚖️ Registrar Peso</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📅 Data</label>
            <input
              type="date"
              value={weightData.data}
              onChange={(e) => {
                setWeightData({ ...weightData, data: e.target.value })
                setErrors({ ...errors, data: null })
              }}
              className={errors.data ? 'input-error' : ''}
              required
            />
            {errors.data && <span className="error-text">{errors.data}</span>}
          </div>

          <div className="form-group">
            <label>⚖️ Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              min="20"
              max="400"
              placeholder="Ex: 85.5"
              value={weightData.peso}
              onChange={(e) => {
                setWeightData({ ...weightData, peso: e.target.value })
                setErrors({ ...errors, peso: null })
              }}
              className={errors.peso ? 'input-error' : ''}
              required
            />
            {errors.peso && <span className="error-text">{errors.peso}</span>}
            <small className="input-hint">Pese-se sempre no mesmo horário para maior precisão</small>
          </div>

          <div className="form-group">
            <label>💭 Observações (opcional)</label>
            <textarea
              rows="3"
              placeholder="Como você está se sentindo? Mudanças notadas?"
              value={weightData.observacoes}
              onChange={(e) => setWeightData({ ...weightData, observacoes: e.target.value })}
              maxLength={500}
            />
            <small className="input-hint">{weightData.observacoes.length}/500 caracteres</small>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar Peso
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WeightRegistration

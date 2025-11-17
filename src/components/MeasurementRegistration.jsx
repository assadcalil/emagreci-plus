import { useState } from 'react'
import { validateMeasurement } from '../utils/validation'
import './MeasurementRegistration.css'

function MeasurementRegistration({ onSave, onClose }) {
  const [measurementData, setMeasurementData] = useState({
    data: new Date().toISOString().split('T')[0],
    cintura: '',
    quadril: '',
    braco: '',
    coxa: '',
    pescoco: '',
    observacoes: ''
  })
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    // Validar cada medida preenchida
    if (measurementData.cintura) {
      const result = validateMeasurement(measurementData.cintura, 'cintura')
      if (!result.valid) newErrors.cintura = result.error
    }
    if (measurementData.quadril) {
      const result = validateMeasurement(measurementData.quadril, 'quadril')
      if (!result.valid) newErrors.quadril = result.error
    }
    if (measurementData.braco) {
      const result = validateMeasurement(measurementData.braco, 'braco')
      if (!result.valid) newErrors.braco = result.error
    }
    if (measurementData.coxa) {
      const result = validateMeasurement(measurementData.coxa, 'coxa')
      if (!result.valid) newErrors.coxa = result.error
    }
    if (measurementData.pescoco) {
      const result = validateMeasurement(measurementData.pescoco, 'pescoco')
      if (!result.valid) newErrors.pescoco = result.error
    }

    // Verificar se pelo menos uma medida foi preenchida
    const hasMeasurement = measurementData.cintura || measurementData.quadril ||
      measurementData.braco || measurementData.coxa || measurementData.pescoco

    if (!hasMeasurement) {
      newErrors.general = 'Preencha pelo menos uma medida'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const cleanData = {
      data: measurementData.data,
      observacoes: measurementData.observacoes
    }

    // Incluir apenas medidas preenchidas
    if (measurementData.cintura) cleanData.cintura = parseFloat(measurementData.cintura)
    if (measurementData.quadril) cleanData.quadril = parseFloat(measurementData.quadril)
    if (measurementData.braco) cleanData.braco = parseFloat(measurementData.braco)
    if (measurementData.coxa) cleanData.coxa = parseFloat(measurementData.coxa)
    if (measurementData.pescoco) cleanData.pescoco = parseFloat(measurementData.pescoco)

    onSave(cleanData)
  }

  const renderInput = (field, label, placeholder, icon) => (
    <div className="form-group">
      <label>{icon} {label} (cm)</label>
      <input
        type="number"
        step="0.1"
        placeholder={placeholder}
        value={measurementData[field]}
        onChange={(e) => {
          setMeasurementData({ ...measurementData, [field]: e.target.value })
          setErrors({ ...errors, [field]: null })
        }}
        className={errors[field] ? 'input-error' : ''}
      />
      {errors[field] && <span className="error-message">{errors[field]}</span>}
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📏 Registrar Medidas</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📅 Data</label>
            <input
              type="date"
              value={measurementData.data}
              onChange={(e) => setMeasurementData({ ...measurementData, data: e.target.value })}
              required
            />
          </div>

          {errors.general && (
            <div className="error-banner">{errors.general}</div>
          )}

          <div className="measurements-grid">
            {renderInput('cintura', 'Cintura', 'Ex: 85', '📍')}
            {renderInput('quadril', 'Quadril', 'Ex: 95', '📍')}
            {renderInput('braco', 'Braço', 'Ex: 32', '💪')}
            {renderInput('coxa', 'Coxa', 'Ex: 55', '🦵')}
            {renderInput('pescoco', 'Pescoço', 'Ex: 38', '📍')}
          </div>

          <div className="form-group">
            <label>💭 Observações (opcional)</label>
            <textarea
              rows="2"
              placeholder="Notas sobre as medidas..."
              value={measurementData.observacoes}
              onChange={(e) => setMeasurementData({ ...measurementData, observacoes: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar Medidas
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MeasurementRegistration

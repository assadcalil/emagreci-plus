import { useState } from 'react'
import { validateDosage, validateDate } from '../utils/validation'
import './DoseRegistration.css'

function DoseRegistration({ onSave, onClose }) {
  const [doseData, setDoseData] = useState({
    data: new Date().toISOString().split('T')[0],
    dosagem: '',
    horario: new Date().toTimeString().split(' ')[0].substring(0, 5),
    local: '',
    observacoes: ''
  })
  const [errors, setErrors] = useState({})

  const locais = [
    'Abdômen',
    'Coxa direita',
    'Coxa esquerda',
    'Braço direito',
    'Braço esquerdo'
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    // Validar dosagem
    const dosageValidation = validateDosage(doseData.dosagem)
    if (!dosageValidation.valid) {
      newErrors.dosagem = dosageValidation.error
    }

    // Validar data
    const dateValidation = validateDate(doseData.data)
    if (!dateValidation.valid) {
      newErrors.data = dateValidation.error
    }

    // Validar local
    if (!doseData.local) {
      newErrors.local = 'Selecione o local de aplicação'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      ...doseData,
      dosagem: parseFloat(doseData.dosagem)
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💉 Registrar Dose</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📅 Data</label>
            <input
              type="date"
              value={doseData.data}
              onChange={(e) => {
                setDoseData({ ...doseData, data: e.target.value })
                setErrors({ ...errors, data: null })
              }}
              className={errors.data ? 'input-error' : ''}
              required
            />
            {errors.data && <span className="error-text">{errors.data}</span>}
          </div>

          <div className="form-group">
            <label>🕐 Horário</label>
            <input
              type="time"
              value={doseData.horario}
              onChange={(e) => setDoseData({ ...doseData, horario: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>💉 Dosagem (mg)</label>
            <input
              type="number"
              step="0.25"
              min="0.1"
              max="15"
              placeholder="Ex: 0.5"
              value={doseData.dosagem}
              onChange={(e) => {
                setDoseData({ ...doseData, dosagem: e.target.value })
                setErrors({ ...errors, dosagem: null })
              }}
              className={errors.dosagem ? 'input-error' : ''}
              required
            />
            {errors.dosagem && <span className="error-text">{errors.dosagem}</span>}
            <small className="input-hint">Dosagens comuns: 0.25mg, 0.5mg, 1mg, 2.5mg</small>
          </div>

          <div className="form-group">
            <label>📍 Local de aplicação</label>
            <div className="button-group">
              {locais.map(local => (
                <button
                  key={local}
                  type="button"
                  className={`btn-option ${doseData.local === local ? 'selected' : ''} ${errors.local ? 'btn-error' : ''}`}
                  onClick={() => {
                    setDoseData({ ...doseData, local })
                    setErrors({ ...errors, local: null })
                  }}
                >
                  {local}
                </button>
              ))}
            </div>
            {errors.local && <span className="error-text">{errors.local}</span>}
          </div>

          <div className="form-group">
            <label>💭 Observações (opcional)</label>
            <textarea
              rows="3"
              placeholder="Efeitos colaterais, sensações, etc..."
              value={doseData.observacoes}
              onChange={(e) => setDoseData({ ...doseData, observacoes: e.target.value })}
              maxLength={500}
            />
            <small className="input-hint">{doseData.observacoes.length}/500 caracteres</small>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar Dose
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DoseRegistration

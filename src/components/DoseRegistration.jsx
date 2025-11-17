import { useState } from 'react'
import './DoseRegistration.css'

function DoseRegistration({ onSave, onClose }) {
  const [doseData, setDoseData] = useState({
    data: new Date().toISOString().split('T')[0],
    dosagem: '',
    horario: new Date().toTimeString().split(' ')[0].substring(0, 5),
    local: '',
    observacoes: ''
  })

  const locais = [
    'Abdômen',
    'Coxa direita',
    'Coxa esquerda',
    'Braço direito',
    'Braço esquerdo'
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Salvar no localStorage
    const doses = JSON.parse(localStorage.getItem('doses') || '[]')
    const newDose = {
      ...doseData,
      id: Date.now(),
      timestamp: new Date().toISOString()
    }
    doses.push(newDose)
    localStorage.setItem('doses', JSON.stringify(doses))
    
    onSave(newDose)
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
            <label>Data</label>
            <input
              type="date"
              value={doseData.data}
              onChange={(e) => setDoseData({...doseData, data: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Horário</label>
            <input
              type="time"
              value={doseData.horario}
              onChange={(e) => setDoseData({...doseData, horario: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Dosagem (mg)</label>
            <input
              type="number"
              step="0.25"
              placeholder="Ex: 0.5"
              value={doseData.dosagem}
              onChange={(e) => setDoseData({...doseData, dosagem: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Local de aplicação</label>
            <div className="button-group">
              {locais.map(local => (
                <button
                  key={local}
                  type="button"
                  className={`btn-option ${doseData.local === local ? 'selected' : ''}`}
                  onClick={() => setDoseData({...doseData, local})}
                >
                  {local}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Observações (opcional)</label>
            <textarea
              rows="3"
              placeholder="Efeitos colaterais, sensações, etc..."
              value={doseData.observacoes}
              onChange={(e) => setDoseData({...doseData, observacoes: e.target.value})}
            />
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
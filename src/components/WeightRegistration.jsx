import { useState } from 'react'
import './WeightRegistration.css'

function WeightRegistration({ onSave, onClose, currentWeight }) {
  const [weightData, setWeightData] = useState({
    data: new Date().toISOString().split('T')[0],
    peso: currentWeight || '',
    observacoes: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Salvar no localStorage
    const weights = JSON.parse(localStorage.getItem('weights') || '[]')
    const newWeight = {
      ...weightData,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      peso: parseFloat(weightData.peso)
    }
    weights.push(newWeight)
    localStorage.setItem('weights', JSON.stringify(weights))
    
    onSave(newWeight)
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
            <label>Data</label>
            <input
              type="date"
              value={weightData.data}
              onChange={(e) => setWeightData({...weightData, data: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Ex: 85.5"
              value={weightData.peso}
              onChange={(e) => setWeightData({...weightData, peso: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Observações (opcional)</label>
            <textarea
              rows="3"
              placeholder="Como você está se sentindo? Mudanças notadas?"
              value={weightData.observacoes}
              onChange={(e) => setWeightData({...weightData, observacoes: e.target.value})}
            />
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
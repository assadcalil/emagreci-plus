import { useState } from 'react'
import './SideEffectRegistration.css'

function SideEffectRegistration({ onSave, onClose }) {
  const [effectData, setEffectData] = useState({
    data: new Date().toISOString().split('T')[0],
    horario: new Date().toTimeString().split(' ')[0].substring(0, 5),
    tipo: '',
    intensidade: 3,
    duracao: '',
    observacoes: ''
  })

  const tiposEfeitos = [
    { id: 'nausea', label: 'Náusea', icon: '🤢' },
    { id: 'vomito', label: 'Vômito', icon: '🤮' },
    { id: 'diarreia', label: 'Diarreia', icon: '💨' },
    { id: 'constipacao', label: 'Constipação', icon: '🚽' },
    { id: 'dor_cabeca', label: 'Dor de cabeça', icon: '🤕' },
    { id: 'tontura', label: 'Tontura', icon: '😵' },
    { id: 'fadiga', label: 'Fadiga', icon: '😴' },
    { id: 'dor_abdominal', label: 'Dor abdominal', icon: '🤰' },
    { id: 'falta_apetite', label: 'Falta de apetite', icon: '🍽️' },
    { id: 'hipoglicemia', label: 'Hipoglicemia', icon: '📉' },
    { id: 'reacao_local', label: 'Reação no local', icon: '💉' },
    { id: 'outro', label: 'Outro', icon: '❓' }
  ]

  const duracoes = [
    'Menos de 1 hora',
    '1-3 horas',
    '3-6 horas',
    '6-12 horas',
    'Mais de 12 horas',
    'O dia todo'
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!effectData.tipo) {
      alert('Selecione o tipo de efeito colateral')
      return
    }

    const selectedEffect = tiposEfeitos.find(t => t.id === effectData.tipo)
    onSave({
      ...effectData,
      tipoLabel: selectedEffect?.label || effectData.tipo,
      tipoIcon: selectedEffect?.icon || '❓'
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🩺 Registrar Efeito Colateral</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>📅 Data</label>
              <input
                type="date"
                value={effectData.data}
                onChange={(e) => setEffectData({ ...effectData, data: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>🕐 Horário</label>
              <input
                type="time"
                value={effectData.horario}
                onChange={(e) => setEffectData({ ...effectData, horario: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tipo de efeito</label>
            <div className="effects-grid">
              {tiposEfeitos.map(tipo => (
                <button
                  key={tipo.id}
                  type="button"
                  className={`effect-btn ${effectData.tipo === tipo.id ? 'selected' : ''}`}
                  onClick={() => setEffectData({ ...effectData, tipo: tipo.id })}
                >
                  <span className="effect-icon">{tipo.icon}</span>
                  <span className="effect-label">{tipo.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>⚡ Intensidade: {effectData.intensidade}/5</label>
            <input
              type="range"
              min="1"
              max="5"
              value={effectData.intensidade}
              onChange={(e) => setEffectData({ ...effectData, intensidade: parseInt(e.target.value) })}
              className="intensity-slider"
            />
            <div className="intensity-labels">
              <span>Leve</span>
              <span>Moderado</span>
              <span>Intenso</span>
            </div>
          </div>

          <div className="form-group">
            <label>⏱️ Duração</label>
            <select
              value={effectData.duracao}
              onChange={(e) => setEffectData({ ...effectData, duracao: e.target.value })}
              required
            >
              <option value="">Selecione...</option>
              {duracoes.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>💭 Observações (opcional)</label>
            <textarea
              rows="3"
              placeholder="O que você fez para aliviar? Outros detalhes..."
              value={effectData.observacoes}
              onChange={(e) => setEffectData({ ...effectData, observacoes: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SideEffectRegistration

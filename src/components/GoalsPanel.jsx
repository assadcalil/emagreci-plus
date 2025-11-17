import { useState } from 'react'
import './GoalsPanel.css'

function GoalsPanel({ goals, onAddGoal, onToggleGoal, onDeleteGoal, currentWeight, initialWeight }) {
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    tipo: 'peso',
    valor: '',
    descricao: ''
  })

  const tiposMetas = [
    { id: 'peso', label: 'Meta de Peso', icon: '⚖️', unit: 'kg' },
    { id: 'perda', label: 'Perda Total', icon: '📉', unit: 'kg' },
    { id: 'doses', label: 'Completar Doses', icon: '💉', unit: 'doses' },
    { id: 'medida', label: 'Medida Corporal', icon: '📏', unit: 'cm' },
    { id: 'habito', label: 'Criar Hábito', icon: '✅', unit: 'dias' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newGoal.valor || !newGoal.descricao) return

    const tipoInfo = tiposMetas.find(t => t.id === newGoal.tipo)
    onAddGoal({
      ...newGoal,
      tipoLabel: tipoInfo.label,
      tipoIcon: tipoInfo.icon,
      unit: tipoInfo.unit
    })

    setNewGoal({ tipo: 'peso', valor: '', descricao: '' })
    setShowAddGoal(false)
  }

  const completedGoals = goals.filter(g => g.completed).length
  const totalGoals = goals.length
  const progressPercentage = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0

  // Calcular conquistas automáticas
  const weightLoss = initialWeight && currentWeight ? initialWeight - currentWeight : 0
  const achievements = []

  if (weightLoss >= 5) achievements.push({ icon: '🥉', label: 'Perdeu 5kg' })
  if (weightLoss >= 10) achievements.push({ icon: '🥈', label: 'Perdeu 10kg' })
  if (weightLoss >= 20) achievements.push({ icon: '🥇', label: 'Perdeu 20kg' })
  if (completedGoals >= 1) achievements.push({ icon: '🎯', label: 'Primeira meta' })
  if (completedGoals >= 5) achievements.push({ icon: '🏆', label: '5 metas cumpridas' })

  return (
    <div className="goals-panel">
      <div className="goals-header">
        <h3>🎯 Minhas Metas</h3>
        <button className="btn-add-goal" onClick={() => setShowAddGoal(!showAddGoal)}>
          {showAddGoal ? '✕' : '+ Nova Meta'}
        </button>
      </div>

      {showAddGoal && (
        <form className="add-goal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipo de meta</label>
            <select
              value={newGoal.tipo}
              onChange={(e) => setNewGoal({ ...newGoal, tipo: e.target.value })}
            >
              {tiposMetas.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.icon} {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Valor ({tiposMetas.find(t => t.id === newGoal.tipo)?.unit})
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="Ex: 75"
              value={newGoal.valor}
              onChange={(e) => setNewGoal({ ...newGoal, valor: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <input
              type="text"
              placeholder="Ex: Chegar aos 75kg até dezembro"
              value={newGoal.descricao}
              onChange={(e) => setNewGoal({ ...newGoal, descricao: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-small">
            Adicionar Meta
          </button>
        </form>
      )}

      {totalGoals > 0 && (
        <div className="goals-progress">
          <div className="progress-header">
            <span>Progresso Geral</span>
            <span>{completedGoals}/{totalGoals} metas</span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="goals-list">
        {goals.length === 0 ? (
          <div className="empty-goals">
            <p>Nenhuma meta definida ainda</p>
            <small>Defina metas para acompanhar seu progresso!</small>
          </div>
        ) : (
          goals.map(goal => (
            <div key={goal.id} className={`goal-item ${goal.completed ? 'completed' : ''}`}>
              <button
                className="goal-checkbox"
                onClick={() => onToggleGoal(goal.id)}
              >
                {goal.completed ? '✅' : '⭕'}
              </button>
              <div className="goal-content">
                <div className="goal-info">
                  <span className="goal-icon">{goal.tipoIcon}</span>
                  <span className="goal-description">{goal.descricao}</span>
                </div>
                <div className="goal-value">
                  {goal.valor} {goal.unit}
                </div>
              </div>
              <button
                className="goal-delete"
                onClick={() => onDeleteGoal(goal.id)}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {achievements.length > 0 && (
        <div className="achievements">
          <h4>🏅 Conquistas</h4>
          <div className="achievements-list">
            {achievements.map((ach, i) => (
              <div key={i} className="achievement-badge">
                <span className="achievement-icon">{ach.icon}</span>
                <span className="achievement-label">{ach.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GoalsPanel

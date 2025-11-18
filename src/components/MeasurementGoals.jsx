import { useState } from 'react'
import { useMeasurementGoals } from '../hooks/useMeasurementGoals'
import './MeasurementGoals.css'

const FIELD_LABELS = {
  cintura: 'Cintura',
  quadril: 'Quadril',
  braco: 'Braço',
  coxa: 'Coxa',
  peito: 'Peito'
}

const FIELD_ICONS = {
  cintura: '⭕',
  quadril: '🍑',
  braco: '💪',
  coxa: '🦵',
  peito: '🫁'
}

function MeasurementGoals({ userId, measurements, onClose }) {
  const { measurementGoals, getProgress, setGoal, removeGoal, completeGoal } = useMeasurementGoals(userId, measurements)
  const [editingField, setEditingField] = useState(null)
  const [goalValue, setGoalValue] = useState('')

  const handleSetGoal = async (field) => {
    const value = parseFloat(goalValue)
    if (!value || value <= 0) {
      alert('Digite um valor válido')
      return
    }

    const success = await setGoal(field, value)
    if (success) {
      setEditingField(null)
      setGoalValue('')
    }
  }

  const handleRemoveGoal = async (field) => {
    if (window.confirm(`Tem certeza que deseja remover a meta de ${FIELD_LABELS[field]}?`)) {
      await removeGoal(field)
    }
  }

  const handleCompleteGoal = async (field) => {
    if (window.confirm(`Parabéns! Deseja marcar a meta de ${FIELD_LABELS[field]} como concluída?`)) {
      await completeGoal(field)
    }
  }

  const getLatestValue = (field) => {
    if (!measurements || measurements.length === 0) return null
    const latest = measurements[0]
    return parseFloat(latest[field]) || null
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-measurement-goals" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎯 Metas de Medidas</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="goals-intro">
          <p>Defina metas para suas medidas corporais e acompanhe seu progresso!</p>
        </div>

        <div className="goals-list">
          {Object.keys(FIELD_LABELS).map(field => {
            const goal = measurementGoals[field]
            const progress = goal ? getProgress(field) : null
            const currentValue = getLatestValue(field)
            const isEditing = editingField === field

            return (
              <div key={field} className="goal-item">
                <div className="goal-header">
                  <div className="goal-title">
                    <span className="goal-icon">{FIELD_ICONS[field]}</span>
                    <span className="goal-label">{FIELD_LABELS[field]}</span>
                    {currentValue && (
                      <span className="current-value">{currentValue}cm</span>
                    )}
                  </div>
                  <div className="goal-actions">
                    {!goal && !isEditing && (
                      <button
                        className="btn-set-goal"
                        onClick={() => {
                          setEditingField(field)
                          setGoalValue('')
                        }}
                      >
                        + Definir Meta
                      </button>
                    )}
                    {goal && !isEditing && (
                      <>
                        <button
                          className="btn-edit-goal"
                          onClick={() => {
                            setEditingField(field)
                            setGoalValue(goal.target.toString())
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-remove-goal"
                          onClick={() => handleRemoveGoal(field)}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="goal-editor">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Meta (cm)"
                      value={goalValue}
                      onChange={(e) => setGoalValue(e.target.value)}
                      autoFocus
                    />
                    <button
                      className="btn-save-goal"
                      onClick={() => handleSetGoal(field)}
                    >
                      Salvar
                    </button>
                    <button
                      className="btn-cancel-goal"
                      onClick={() => {
                        setEditingField(null)
                        setGoalValue('')
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                {goal && progress && !isEditing && (
                  <div className="goal-progress">
                    <div className="progress-stats">
                      <div className="stat">
                        <span className="stat-label">Inicial</span>
                        <span className="stat-value">{progress.initial}cm</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Meta</span>
                        <span className="stat-value target">{progress.target}cm</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Faltam</span>
                        <span className={`stat-value ${progress.remaining <= 0 ? 'achieved' : 'remaining'}`}>
                          {progress.remaining <= 0 ? '✅ Atingida!' : `${Math.abs(progress.remaining).toFixed(1)}cm`}
                        </span>
                      </div>
                    </div>

                    <div className="progress-bar-container">
                      <div
                        className={`progress-bar ${progress.achieved ? 'achieved' : ''}`}
                        style={{ width: `${progress.percentage}%` }}
                      >
                        <span className="progress-percentage">{Math.round(progress.percentage)}%</span>
                      </div>
                    </div>

                    {progress.achieved && (
                      <button
                        className="btn-complete-goal"
                        onClick={() => handleCompleteGoal(field)}
                      >
                        🎉 Marcar como Concluída
                      </button>
                    )}
                  </div>
                )}

                {goal && !currentValue && !isEditing && (
                  <div className="no-data-warning">
                    ⚠️ Registre medidas para ver o progresso
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {(!measurements || measurements.length === 0) && (
          <div className="empty-measurements">
            <p>📏 Você ainda não tem medidas registradas.</p>
            <p>Registre suas medidas primeiro para poder definir metas!</p>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default MeasurementGoals

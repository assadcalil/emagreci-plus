import { useState } from 'react'
import './NutritionTracker.css'

function NutritionTracker({ onSave, onClose, dailyData }) {
  const [nutrition, setNutrition] = useState({
    data: new Date().toISOString().split('T')[0],
    agua: dailyData?.agua || 0,
    proteina: dailyData?.proteina || 0,
    calorias: dailyData?.calorias || 0,
    fibras: dailyData?.fibras || 0
  })

  const waterGlasses = Math.floor(nutrition.agua / 250) // 250ml por copo

  const addWater = (ml) => {
    setNutrition({ ...nutrition, agua: Math.max(0, nutrition.agua + ml) })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(nutrition)
  }

  // Metas diárias recomendadas
  const goals = {
    agua: 2500, // ml
    proteina: 100, // g
    calorias: 1800, // kcal
    fibras: 25 // g
  }

  const getProgressColor = (current, goal) => {
    const percent = (current / goal) * 100
    if (percent < 50) return '#e74c3c'
    if (percent < 80) return '#f39c12'
    return '#2ecc71'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-nutrition" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🥗 Rastreamento Nutricional</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Água */}
          <div className="nutrition-card water-card">
            <div className="nutrition-header">
              <span className="nutrition-icon">💧</span>
              <h3>Água</h3>
              <span className="nutrition-value">{nutrition.agua} ml</span>
            </div>

            <div className="water-glasses">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`water-glass ${i < waterGlasses ? 'filled' : ''}`}
                  onClick={() => setNutrition({ ...nutrition, agua: (i + 1) * 250 })}
                >
                  🥤
                </div>
              ))}
            </div>

            <div className="water-quick-add">
              <button type="button" onClick={() => addWater(250)}>+250ml</button>
              <button type="button" onClick={() => addWater(500)}>+500ml</button>
              <button type="button" onClick={() => addWater(-250)}>-250ml</button>
            </div>

            <div className="progress-bar-nutrition">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, (nutrition.agua / goals.agua) * 100)}%`,
                  background: getProgressColor(nutrition.agua, goals.agua)
                }}
              ></div>
            </div>
            <small>{nutrition.agua}/{goals.agua}ml</small>
          </div>

          {/* Proteína */}
          <div className="nutrition-card">
            <div className="nutrition-header">
              <span className="nutrition-icon">🍗</span>
              <h3>Proteína</h3>
            </div>
            <div className="nutrition-input-group">
              <input
                type="number"
                value={nutrition.proteina}
                onChange={(e) => setNutrition({ ...nutrition, proteina: parseFloat(e.target.value) || 0 })}
                min="0"
                max="500"
              />
              <span>g</span>
            </div>
            <div className="progress-bar-nutrition">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, (nutrition.proteina / goals.proteina) * 100)}%`,
                  background: getProgressColor(nutrition.proteina, goals.proteina)
                }}
              ></div>
            </div>
            <small>{nutrition.proteina}/{goals.proteina}g</small>
          </div>

          {/* Calorias */}
          <div className="nutrition-card">
            <div className="nutrition-header">
              <span className="nutrition-icon">🔥</span>
              <h3>Calorias</h3>
            </div>
            <div className="nutrition-input-group">
              <input
                type="number"
                value={nutrition.calorias}
                onChange={(e) => setNutrition({ ...nutrition, calorias: parseFloat(e.target.value) || 0 })}
                min="0"
                max="10000"
              />
              <span>kcal</span>
            </div>
            <div className="progress-bar-nutrition">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, (nutrition.calorias / goals.calorias) * 100)}%`,
                  background: getProgressColor(nutrition.calorias, goals.calorias)
                }}
              ></div>
            </div>
            <small>{nutrition.calorias}/{goals.calorias}kcal</small>
          </div>

          {/* Fibras */}
          <div className="nutrition-card">
            <div className="nutrition-header">
              <span className="nutrition-icon">🌾</span>
              <h3>Fibras</h3>
            </div>
            <div className="nutrition-input-group">
              <input
                type="number"
                value={nutrition.fibras}
                onChange={(e) => setNutrition({ ...nutrition, fibras: parseFloat(e.target.value) || 0 })}
                min="0"
                max="100"
              />
              <span>g</span>
            </div>
            <div className="progress-bar-nutrition">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, (nutrition.fibras / goals.fibras) * 100)}%`,
                  background: getProgressColor(nutrition.fibras, goals.fibras)
                }}
              ></div>
            </div>
            <small>{nutrition.fibras}/{goals.fibras}g</small>
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

export default NutritionTracker

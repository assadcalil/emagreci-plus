import { useMemo } from 'react'
import './MeasurementAvatar.css'

function MeasurementAvatar({ measurements, showProgress = false }) {
  // Processar medidas para obter inicial e atual
  const measurementData = useMemo(() => {
    if (!measurements || measurements.length === 0) {
      return null
    }

    // Ordenar por data
    const sorted = [...measurements].sort((a, b) => new Date(a.data) - new Date(b.data))

    const initial = sorted[0]
    const current = sorted[sorted.length - 1]

    // Calcular diferenças
    const calculateDiff = (field) => {
      const initialVal = initial[field] || 0
      const currentVal = current[field] || 0
      const diff = initialVal - currentVal
      return {
        initial: initialVal,
        current: currentVal,
        diff: diff,
        percentage: initialVal > 0 ? ((diff / initialVal) * 100).toFixed(1) : 0
      }
    }

    return {
      cintura: calculateDiff('cintura'),
      quadril: calculateDiff('quadril'),
      braco: calculateDiff('braco'),
      coxa: calculateDiff('coxa'),
      pescoco: calculateDiff('pescoco'),
      hasMultipleMeasurements: sorted.length > 1
    }
  }, [measurements])

  if (!measurementData) {
    return (
      <div className="measurement-avatar-empty">
        <div className="empty-icon">📏</div>
        <p>Nenhuma medida registrada ainda</p>
        <small>Registre suas medidas para ver seu progresso visual</small>
      </div>
    )
  }

  const renderMeasurementBadge = (label, data, position, icon) => {
    if (!data.initial && !data.current) return null

    return (
      <div className={`measurement-badge ${position}`}>
        <div className="badge-label">{icon} {label}</div>
        <div className="badge-values">
          {showProgress && measurementData.hasMultipleMeasurements ? (
            <>
              <div className="value-row">
                <span className="value-label">Inicial:</span>
                <span className="value-number">{data.initial.toFixed(1)} cm</span>
              </div>
              <div className="value-row">
                <span className="value-label">Atual:</span>
                <span className="value-number highlight">{data.current.toFixed(1)} cm</span>
              </div>
              {data.diff !== 0 && (
                <div className={`value-diff ${data.diff > 0 ? 'positive' : 'negative'}`}>
                  {data.diff > 0 ? '▼' : '▲'} {Math.abs(data.diff).toFixed(1)} cm
                  <span className="diff-percentage">({data.percentage}%)</span>
                </div>
              )}
            </>
          ) : (
            <div className="value-row">
              <span className="value-number solo">{data.current.toFixed(1)} cm</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="measurement-avatar-container">
      {showProgress && measurementData.hasMultipleMeasurements && (
        <div className="avatar-header">
          <h3>📊 Seu Progresso Visual</h3>
          <p className="subtitle">Comparação: Primeira x Última Medição</p>
        </div>
      )}

      <div className="avatar-body">
        {/* Avatar SVG */}
        <svg className="body-svg" viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg">
          {/* Cabeça */}
          <circle cx="100" cy="40" r="25" fill="#ffd6a5" stroke="#333" strokeWidth="2"/>

          {/* Pescoço */}
          <rect x="92" y="60" width="16" height="20" fill="#ffd6a5" stroke="#333" strokeWidth="2"/>
          <line x1="92" y1="70" x2="80" y2="70" stroke="#667eea" strokeWidth="2" strokeDasharray="3,3"/>
          <line x1="108" y1="70" x2="120" y2="70" stroke="#667eea" strokeWidth="2" strokeDasharray="3,3"/>

          {/* Corpo/Tronco */}
          <ellipse cx="100" cy="130" rx="35" ry="55" fill="#a0c4ff" stroke="#333" strokeWidth="2"/>

          {/* Linha de cintura */}
          <line x1="65" y1="150" x2="50" y2="150" stroke="#667eea" strokeWidth="2" strokeDasharray="3,3"/>
          <line x1="135" y1="150" x2="150" y2="150" stroke="#667eea" strokeWidth="2" strokeDasharray="3,3"/>

          {/* Braço Esquerdo */}
          <ellipse cx="70" cy="110" rx="12" ry="40" fill="#ffd6a5" stroke="#333" strokeWidth="2" transform="rotate(-10 70 110)"/>
          <line x1="70" y1="100" x2="55" y2="100" stroke="#667eea" strokeWidth="2" strokeDasharray="3,3"/>

          {/* Braço Direito */}
          <ellipse cx="130" cy="110" rx="12" ry="40" fill="#ffd6a5" stroke="#333" strokeWidth="2" transform="rotate(10 130 110)"/>
          <line x1="130" y1="100" x2="145" y2="100" stroke="#667eea" strokeWidth="2" strokeDasharray="3,3"/>

          {/* Quadril */}
          <ellipse cx="100" cy="200" rx="38" ry="25" fill="#a0c4ff" stroke="#333" strokeWidth="2"/>
          <line x1="62" y1="200" x2="45" y2="200" stroke="#667eea" strokeWidth="2" strokeDasharray="3,3"/>
          <line x1="138" y1="200" x2="155" y2="200" stroke="#667eea" strokeWidth="2" strokeDasharray="3,3"/>

          {/* Perna Esquerda */}
          <ellipse cx="85" cy="290" rx="18" ry="80" fill="#a0c4ff" stroke="#333" strokeWidth="2"/>
          <line x1="85" y1="250" x2="65" y2="250" stroke="#667eea" strokeWidth="2" strokeDasharray="3,3"/>

          {/* Perna Direita */}
          <ellipse cx="115" cy="290" rx="18" ry="80" fill="#a0c4ff" stroke="#333" strokeWidth="2"/>
          <line x1="115" y1="250" x2="135" y2="250" stroke="#667eea" strokeWidth="2" strokeDasharray="3,3"/>

          {/* Pés */}
          <ellipse cx="85" cy="370" rx="12" ry="8" fill="#333"/>
          <ellipse cx="115" cy="370" rx="12" ry="8" fill="#333"/>
        </svg>

        {/* Badges de medidas */}
        <div className="measurements-overlay">
          {renderMeasurementBadge('Pescoço', measurementData.pescoco, 'top-right', '📍')}
          {renderMeasurementBadge('Braço', measurementData.braco, 'left', '💪')}
          {renderMeasurementBadge('Cintura', measurementData.cintura, 'center-right', '📏')}
          {renderMeasurementBadge('Quadril', measurementData.quadril, 'bottom-right', '📐')}
          {renderMeasurementBadge('Coxa', measurementData.coxa, 'bottom-left', '🦵')}
        </div>
      </div>

      {showProgress && measurementData.hasMultipleMeasurements && (
        <div className="avatar-footer">
          <div className="progress-legend">
            <div className="legend-item">
              <span className="legend-icon positive">▼</span>
              <span>Redução (Progresso Positivo)</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon negative">▲</span>
              <span>Aumento</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MeasurementAvatar

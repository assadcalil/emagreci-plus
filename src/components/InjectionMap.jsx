import { useMemo } from 'react'
import './InjectionMap.css'

function InjectionMap({ doses, onSelectLocation }) {
  // Contar quantas vezes cada local foi usado
  const locationCounts = useMemo(() => {
    const counts = {
      'Abdômen': 0,
      'Coxa direita': 0,
      'Coxa esquerda': 0,
      'Braço direito': 0,
      'Braço esquerdo': 0
    }

    doses.forEach(dose => {
      if (counts[dose.local] !== undefined) {
        counts[dose.local]++
      }
    })

    return counts
  }, [doses])

  // Encontrar o local menos usado (recomendado)
  const recommendedLocation = useMemo(() => {
    let minCount = Infinity
    let recommended = 'Abdômen'

    Object.entries(locationCounts).forEach(([location, count]) => {
      if (count < minCount) {
        minCount = count
        recommended = location
      }
    })

    return recommended
  }, [locationCounts])

  // Última aplicação
  const lastDose = doses.length > 0
    ? doses[doses.length - 1]
    : null

  const getLocationStatus = (location) => {
    const count = locationCounts[location]
    const isLast = lastDose?.local === location
    const isRecommended = location === recommendedLocation

    if (isLast) return 'last'
    if (isRecommended) return 'recommended'
    if (count === 0) return 'unused'
    if (count > 3) return 'overused'
    return 'normal'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'last': return '#e74c3c'
      case 'recommended': return '#2ecc71'
      case 'unused': return '#95a5a6'
      case 'overused': return '#f39c12'
      default: return '#3498db'
    }
  }

  return (
    <div className="injection-map">
      <div className="map-header">
        <h3>🗺️ Mapa de Rotação</h3>
        <p>Alterne os locais para evitar lipodistrofia</p>
      </div>

      <div className="body-map">
        {/* Corpo frontal */}
        <div className="body-front">
          <div className="body-outline">
            {/* Cabeça */}
            <div className="body-head"></div>

            {/* Torso */}
            <div className="body-torso">
              {/* Abdômen */}
              <button
                className={`injection-point abdomen ${getLocationStatus('Abdômen')}`}
                onClick={() => onSelectLocation?.('Abdômen')}
                title={`Abdômen: ${locationCounts['Abdômen']} aplicações`}
              >
                <span className="point-dot"></span>
                <span className="point-count">{locationCounts['Abdômen']}</span>
              </button>
            </div>

            {/* Braços */}
            <div className="body-arms">
              <button
                className={`injection-point arm-left ${getLocationStatus('Braço esquerdo')}`}
                onClick={() => onSelectLocation?.('Braço esquerdo')}
                title={`Braço esquerdo: ${locationCounts['Braço esquerdo']} aplicações`}
              >
                <span className="point-dot"></span>
                <span className="point-count">{locationCounts['Braço esquerdo']}</span>
              </button>
              <button
                className={`injection-point arm-right ${getLocationStatus('Braço direito')}`}
                onClick={() => onSelectLocation?.('Braço direito')}
                title={`Braço direito: ${locationCounts['Braço direito']} aplicações`}
              >
                <span className="point-dot"></span>
                <span className="point-count">{locationCounts['Braço direito']}</span>
              </button>
            </div>

            {/* Pernas */}
            <div className="body-legs">
              <button
                className={`injection-point leg-left ${getLocationStatus('Coxa esquerda')}`}
                onClick={() => onSelectLocation?.('Coxa esquerda')}
                title={`Coxa esquerda: ${locationCounts['Coxa esquerda']} aplicações`}
              >
                <span className="point-dot"></span>
                <span className="point-count">{locationCounts['Coxa esquerda']}</span>
              </button>
              <button
                className={`injection-point leg-right ${getLocationStatus('Coxa direita')}`}
                onClick={() => onSelectLocation?.('Coxa direita')}
                title={`Coxa direita: ${locationCounts['Coxa direita']} aplicações`}
              >
                <span className="point-dot"></span>
                <span className="point-count">{locationCounts['Coxa direita']}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#e74c3c' }}></span>
          <small>Última aplicação</small>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#2ecc71' }}></span>
          <small>Recomendado</small>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#f39c12' }}></span>
          <small>Muito usado</small>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#3498db' }}></span>
          <small>Normal</small>
        </div>
      </div>

      {/* Recomendação */}
      <div className="map-recommendation">
        <span className="rec-icon">💡</span>
        <div>
          <strong>Próxima aplicação recomendada:</strong>
          <p>{recommendedLocation}</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="map-stats">
        {Object.entries(locationCounts).map(([location, count]) => (
          <div key={location} className="stat-bar">
            <span className="stat-label">{location}</span>
            <div className="stat-bar-container">
              <div
                className="stat-bar-fill"
                style={{
                  width: `${Math.min(100, (count / Math.max(...Object.values(locationCounts), 1)) * 100)}%`,
                  background: getStatusColor(getLocationStatus(location))
                }}
              ></div>
            </div>
            <span className="stat-count">{count}x</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InjectionMap

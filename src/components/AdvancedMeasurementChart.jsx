import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import './AdvancedMeasurementChart.css'

const FIELD_CONFIG = {
  cintura: { label: 'Cintura', color: '#e74c3c', enabled: true },
  quadril: { label: 'Quadril', color: '#9b59b6', enabled: true },
  braco: { label: 'Braço', color: '#3498db', enabled: false },
  coxa: { label: 'Coxa', color: '#2ecc71', enabled: false },
  peito: { label: 'Peito', color: '#f39c12', enabled: false }
}

const TIME_RANGES = {
  '7d': { label: 'Última Semana', days: 7 },
  '30d': { label: 'Último Mês', days: 30 },
  '90d': { label: 'Últimos 3 Meses', days: 90 },
  'all': { label: 'Tudo', days: Infinity }
}

function AdvancedMeasurementChart({ measurements, onClose }) {
  const [selectedFields, setSelectedFields] = useState(() => {
    const initial = {}
    Object.entries(FIELD_CONFIG).forEach(([field, config]) => {
      initial[field] = config.enabled
    })
    return initial
  })
  const [timeRange, setTimeRange] = useState('30d')
  const [showDifferences, setShowDifferences] = useState(false)

  // Filter and process data based on time range
  const chartData = useMemo(() => {
    if (!measurements || measurements.length === 0) return []

    const range = TIME_RANGES[timeRange]
    const now = new Date()
    const cutoffDate = new Date(now.getTime() - range.days * 24 * 60 * 60 * 1000)

    const filtered = measurements
      .filter(m => range.days === Infinity || new Date(m.data) >= cutoffDate)
      .sort((a, b) => new Date(a.data) - new Date(b.data))

    if (showDifferences && filtered.length > 0) {
      const baseline = filtered[0]
      return filtered.map(m => {
        const dataPoint = {
          date: new Date(m.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          fullDate: m.data
        }

        Object.keys(FIELD_CONFIG).forEach(field => {
          const baseValue = parseFloat(baseline[field])
          const currentValue = parseFloat(m[field])
          if (baseValue && currentValue) {
            dataPoint[field] = (currentValue - baseValue).toFixed(1)
          }
        })

        return dataPoint
      })
    }

    return filtered.map(m => {
      const dataPoint = {
        date: new Date(m.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        fullDate: m.data
      }

      Object.keys(FIELD_CONFIG).forEach(field => {
        const value = parseFloat(m[field])
        if (value) {
          dataPoint[field] = value
        }
      })

      return dataPoint
    })
  }, [measurements, timeRange, showDifferences])

  const toggleField = (field) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const activeFieldsCount = Object.values(selectedFields).filter(Boolean).length

  const exportData = () => {
    if (chartData.length === 0) return

    // Convert to CSV
    const headers = ['Data', ...Object.entries(FIELD_CONFIG)
      .filter(([field]) => selectedFields[field])
      .map(([_, config]) => config.label)]

    const rows = chartData.map(point => {
      const row = [point.fullDate]
      Object.entries(FIELD_CONFIG).forEach(([field]) => {
        if (selectedFields[field]) {
          row.push(point[field] || '')
        }
      })
      return row.join(',')
    })

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `medidas-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-advanced-chart" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Gráficos Avançados de Medidas</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="chart-controls">
          {/* Time Range Selector */}
          <div className="control-group">
            <label>Período:</label>
            <div className="time-range-buttons">
              {Object.entries(TIME_RANGES).map(([key, config]) => (
                <button
                  key={key}
                  className={`time-range-btn ${timeRange === key ? 'active' : ''}`}
                  onClick={() => setTimeRange(key)}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Field Selector */}
          <div className="control-group">
            <label>Medidas:</label>
            <div className="field-toggles">
              {Object.entries(FIELD_CONFIG).map(([field, config]) => (
                <button
                  key={field}
                  className={`field-toggle ${selectedFields[field] ? 'active' : ''}`}
                  onClick={() => toggleField(field)}
                  style={{
                    borderColor: selectedFields[field] ? config.color : 'var(--border)',
                    backgroundColor: selectedFields[field] ? `${config.color}20` : 'transparent'
                  }}
                >
                  <span
                    className="field-color"
                    style={{ backgroundColor: config.color }}
                  />
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* View Options */}
          <div className="control-group">
            <label>Opções:</label>
            <div className="view-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showDifferences}
                  onChange={(e) => setShowDifferences(e.target.checked)}
                />
                Mostrar diferenças (vs. primeira medida)
              </label>
              <button className="btn-export-data" onClick={exportData}>
                📥 Exportar Dados
              </button>
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="empty-chart">
            <p>📊 Nenhum dado disponível para o período selecionado</p>
            <small>Registre medidas para visualizar os gráficos</small>
          </div>
        ) : activeFieldsCount === 0 ? (
          <div className="empty-chart">
            <p>Selecione pelo menos uma medida para visualizar</p>
          </div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  stroke="#666"
                  style={{ fontSize: '0.85rem' }}
                />
                <YAxis
                  stroke="#666"
                  style={{ fontSize: '0.85rem' }}
                  label={{
                    value: showDifferences ? 'Diferença (cm)' : 'Medida (cm)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: '0.9rem' }
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                  formatter={(value) => `${value}cm`}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                {Object.entries(FIELD_CONFIG).map(([field, config]) => (
                  selectedFields[field] && (
                    <Line
                      key={field}
                      type="monotone"
                      dataKey={field}
                      name={config.label}
                      stroke={config.color}
                      strokeWidth={2}
                      dot={{ fill: config.color, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartData.length > 0 && (
          <div className="chart-stats">
            <h3>Estatísticas do Período</h3>
            <div className="stats-grid">
              {Object.entries(FIELD_CONFIG).map(([field, config]) => {
                if (!selectedFields[field]) return null

                const values = chartData
                  .map(d => parseFloat(d[field]))
                  .filter(v => !isNaN(v))

                if (values.length === 0) return null

                const min = Math.min(...values)
                const max = Math.max(...values)
                const avg = values.reduce((a, b) => a + b, 0) / values.length
                const change = values[values.length - 1] - values[0]

                return (
                  <div key={field} className="stat-card">
                    <div className="stat-header" style={{ borderLeftColor: config.color }}>
                      <span className="stat-name">{config.label}</span>
                    </div>
                    <div className="stat-values">
                      <div className="stat-item">
                        <span className="stat-label">Mínima:</span>
                        <span className="stat-value">{min.toFixed(1)}cm</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Máxima:</span>
                        <span className="stat-value">{max.toFixed(1)}cm</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Média:</span>
                        <span className="stat-value">{avg.toFixed(1)}cm</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Variação:</span>
                        <span className={`stat-value ${change < 0 ? 'positive' : change > 0 ? 'negative' : 'neutral'}`}>
                          {change > 0 ? '+' : ''}{change.toFixed(1)}cm
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
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

export default AdvancedMeasurementChart

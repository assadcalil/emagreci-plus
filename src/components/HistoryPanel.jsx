import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import './HistoryPanel.css'

function HistoryPanel({ doses, weights, sideEffects, measurements, onClose }) {
  const [activeTab, setActiveTab] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all')

  // Combinar todos os registros
  const allRecords = useMemo(() => {
    const records = []

    doses.forEach(d => records.push({
      ...d,
      type: 'dose',
      icon: '💉',
      label: 'Dose',
      date: d.data,
      searchText: `${d.dosagem}mg ${d.local} ${d.observacoes || ''}`
    }))

    weights.forEach(w => records.push({
      ...w,
      type: 'weight',
      icon: '⚖️',
      label: 'Peso',
      date: w.data,
      searchText: `${w.peso}kg ${w.observacoes || ''}`
    }))

    sideEffects.forEach(e => records.push({
      ...e,
      type: 'effect',
      icon: e.tipoIcon || '🩺',
      label: 'Efeito Colateral',
      date: e.data,
      searchText: `${e.tipoLabel} ${e.duracao} ${e.observacoes || ''}`
    }))

    measurements.forEach(m => records.push({
      ...m,
      type: 'measurement',
      icon: '📏',
      label: 'Medidas',
      date: m.data,
      searchText: `cintura ${m.cintura} quadril ${m.quadril} ${m.observacoes || ''}`
    }))

    return records.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [doses, weights, sideEffects, measurements])

  // Filtrar registros
  const filteredRecords = useMemo(() => {
    let records = activeTab === 'todos'
      ? allRecords
      : allRecords.filter(r => r.type === activeTab)

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      records = records.filter(r =>
        r.searchText.toLowerCase().includes(term) ||
        r.label.toLowerCase().includes(term)
      )
    }

    // Filtro de data
    const today = new Date()
    if (dateFilter === 'week') {
      const weekAgo = new Date(today.setDate(today.getDate() - 7))
      records = records.filter(r => new Date(r.date) >= weekAgo)
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today.setMonth(today.getMonth() - 1))
      records = records.filter(r => new Date(r.date) >= monthAgo)
    } else if (dateFilter === '3months') {
      const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3))
      records = records.filter(r => new Date(r.date) >= threeMonthsAgo)
    }

    return records
  }, [allRecords, activeTab, searchTerm, dateFilter])

  const formatRecordDate = (dateString) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: ptBR })
    } catch {
      return dateString
    }
  }

  const renderRecordDetails = (record) => {
    switch (record.type) {
      case 'dose':
        return (
          <div className="record-details">
            <span>💉 {record.dosagem} mg</span>
            <span>📍 {record.local}</span>
            <span>🕐 {record.horario}</span>
          </div>
        )
      case 'weight':
        return (
          <div className="record-details">
            <span>⚖️ {record.peso} kg</span>
          </div>
        )
      case 'effect':
        return (
          <div className="record-details">
            <span>{record.tipoIcon} {record.tipoLabel}</span>
            <span>⚡ Intensidade: {record.intensidade}/5</span>
            <span>⏱️ {record.duracao}</span>
          </div>
        )
      case 'measurement':
        return (
          <div className="record-details">
            {record.cintura && <span>Cintura: {record.cintura}cm</span>}
            {record.quadril && <span>Quadril: {record.quadril}cm</span>}
            {record.braco && <span>Braço: {record.braco}cm</span>}
            {record.coxa && <span>Coxa: {record.coxa}cm</span>}
            {record.pescoco && <span>Pescoço: {record.pescoco}cm</span>}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-fullscreen" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📚 Histórico Completo</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="history-filters">
          <input
            type="text"
            placeholder="🔍 Buscar registros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="date-filter"
          >
            <option value="all">Todo período</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
            <option value="3months">Últimos 3 meses</option>
          </select>
        </div>

        <div className="history-tabs">
          <button
            className={`tab-btn ${activeTab === 'todos' ? 'active' : ''}`}
            onClick={() => setActiveTab('todos')}
          >
            Todos ({allRecords.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'dose' ? 'active' : ''}`}
            onClick={() => setActiveTab('dose')}
          >
            💉 Doses ({doses.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'weight' ? 'active' : ''}`}
            onClick={() => setActiveTab('weight')}
          >
            ⚖️ Pesos ({weights.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'effect' ? 'active' : ''}`}
            onClick={() => setActiveTab('effect')}
          >
            🩺 Efeitos ({sideEffects.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'measurement' ? 'active' : ''}`}
            onClick={() => setActiveTab('measurement')}
          >
            📏 Medidas ({measurements.length})
          </button>
        </div>

        <div className="history-list">
          {filteredRecords.length === 0 ? (
            <div className="empty-history">
              <p>Nenhum registro encontrado</p>
            </div>
          ) : (
            filteredRecords.map(record => (
              <div key={record.id} className={`history-item history-${record.type}`}>
                <div className="history-item-header">
                  <span className="history-icon">{record.icon}</span>
                  <span className="history-label">{record.label}</span>
                  <span className="history-date">{formatRecordDate(record.date)}</span>
                </div>
                {renderRecordDetails(record)}
                {record.observacoes && (
                  <div className="history-notes">
                    💭 {record.observacoes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="history-summary">
          Mostrando {filteredRecords.length} de {allRecords.length} registros
        </div>
      </div>
    </div>
  )
}

export default HistoryPanel

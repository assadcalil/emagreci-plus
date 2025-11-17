import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import './ExportData.css'

function ExportData({ profile, doses, weights, sideEffects, measurements, onClose, onSuccess }) {
  const generateCSV = () => {
    let csv = ''

    // Informações do Perfil
    csv += 'PERFIL DO USUÁRIO\n'
    csv += `Nome,${profile.nome}\n`
    csv += `Data Nascimento,${profile.dataNascimento}\n`
    csv += `Objetivo,${profile.objetivo}\n`
    csv += `Caneta,${profile.tipoCaneta}\n`
    csv += `Peso Inicial,${profile.pesoAtual} kg\n`
    csv += `Altura,${profile.altura} cm\n\n`

    // Doses
    if (doses.length > 0) {
      csv += 'HISTÓRICO DE DOSES\n'
      csv += 'Data,Horário,Dosagem (mg),Local,Observações\n'
      doses.forEach(d => {
        csv += `${d.data},${d.horario},${d.dosagem},${d.local},"${d.observacoes || ''}"\n`
      })
      csv += '\n'
    }

    // Pesos
    if (weights.length > 0) {
      csv += 'HISTÓRICO DE PESOS\n'
      csv += 'Data,Peso (kg),Observações\n'
      weights.forEach(w => {
        csv += `${w.data},${w.peso},"${w.observacoes || ''}"\n`
      })
      csv += '\n'
    }

    // Efeitos Colaterais
    if (sideEffects.length > 0) {
      csv += 'EFEITOS COLATERAIS\n'
      csv += 'Data,Horário,Tipo,Intensidade,Duração,Observações\n'
      sideEffects.forEach(e => {
        csv += `${e.data},${e.horario},${e.tipoLabel},${e.intensidade}/5,${e.duracao},"${e.observacoes || ''}"\n`
      })
      csv += '\n'
    }

    // Medidas
    if (measurements.length > 0) {
      csv += 'MEDIDAS CORPORAIS\n'
      csv += 'Data,Cintura (cm),Quadril (cm),Braço (cm),Coxa (cm),Pescoço (cm),Observações\n'
      measurements.forEach(m => {
        csv += `${m.data},${m.cintura || '-'},${m.quadril || '-'},${m.braco || '-'},${m.coxa || '-'},${m.pescoco || '-'},"${m.observacoes || ''}"\n`
      })
    }

    return csv
  }

  const generateJSON = () => {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      profile,
      doses,
      weights,
      sideEffects,
      measurements
    }, null, 2)
  }

  const generateTextReport = () => {
    const today = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    let report = `
═══════════════════════════════════════════════════════════════
                    RELATÓRIO EMAGRECI+
                    ${today}
═══════════════════════════════════════════════════════════════

INFORMAÇÕES PESSOAIS
─────────────────────
Nome: ${profile.nome}
Data de Nascimento: ${profile.dataNascimento}
Objetivo: ${profile.objetivo}
Medicação: ${profile.tipoCaneta}
Peso Inicial: ${profile.pesoAtual} kg
Altura: ${profile.altura} cm

═══════════════════════════════════════════════════════════════
                      RESUMO DO TRATAMENTO
═══════════════════════════════════════════════════════════════

Total de Doses Aplicadas: ${doses.length}
Registros de Peso: ${weights.length}
Efeitos Colaterais Reportados: ${sideEffects.length}
Medidas Registradas: ${measurements.length}

`

    if (weights.length > 0) {
      const sortedWeights = [...weights].sort((a, b) => new Date(b.data) - new Date(a.data))
      const currentWeight = sortedWeights[0].peso
      const weightLoss = profile.pesoAtual - currentWeight
      const percentage = ((weightLoss / profile.pesoAtual) * 100).toFixed(1)

      report += `EVOLUÇÃO DE PESO
─────────────────────
Peso Inicial: ${profile.pesoAtual} kg
Peso Atual: ${currentWeight} kg
Variação: ${weightLoss > 0 ? '-' : '+'}${Math.abs(weightLoss).toFixed(1)} kg (${weightLoss > 0 ? '-' : '+'}${percentage}%)

`
    }

    if (doses.length > 0) {
      report += `ÚLTIMAS 5 DOSES
─────────────────────
`
      const recentDoses = doses.slice(-5).reverse()
      recentDoses.forEach(d => {
        report += `• ${d.data} às ${d.horario} - ${d.dosagem}mg (${d.local})\n`
        if (d.observacoes) report += `  Obs: ${d.observacoes}\n`
      })
      report += '\n'
    }

    if (sideEffects.length > 0) {
      report += `EFEITOS COLATERAIS RECENTES
─────────────────────
`
      const recentEffects = sideEffects.slice(-5).reverse()
      recentEffects.forEach(e => {
        report += `• ${e.data} - ${e.tipoLabel} (Intensidade: ${e.intensidade}/5)\n`
        report += `  Duração: ${e.duracao}\n`
        if (e.observacoes) report += `  Obs: ${e.observacoes}\n`
      })
      report += '\n'
    }

    report += `
═══════════════════════════════════════════════════════════════
                    FIM DO RELATÓRIO
═══════════════════════════════════════════════════════════════

Este relatório foi gerado automaticamente pelo Emagreci+.
Apresente-o ao seu médico para acompanhamento do tratamento.
`

    return report
  }

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onSuccess(`Arquivo ${filename} baixado com sucesso!`)
  }

  const handleExportCSV = () => {
    const csv = generateCSV()
    const date = format(new Date(), 'yyyy-MM-dd')
    downloadFile(csv, `emagreci_plus_${date}.csv`, 'text/csv;charset=utf-8;')
  }

  const handleExportJSON = () => {
    const json = generateJSON()
    const date = format(new Date(), 'yyyy-MM-dd')
    downloadFile(json, `emagreci_plus_${date}.json`, 'application/json')
  }

  const handleExportReport = () => {
    const report = generateTextReport()
    const date = format(new Date(), 'yyyy-MM-dd')
    downloadFile(report, `relatorio_emagreci_${date}.txt`, 'text/plain;charset=utf-8;')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📤 Exportar Dados</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="export-info">
          <p>Exporte seus dados para compartilhar com seu médico ou fazer backup.</p>
        </div>

        <div className="export-options">
          <button className="export-btn" onClick={handleExportCSV}>
            <span className="export-icon">📊</span>
            <span className="export-title">Exportar CSV</span>
            <span className="export-desc">Planilha para Excel/Google Sheets</span>
          </button>

          <button className="export-btn" onClick={handleExportJSON}>
            <span className="export-icon">💾</span>
            <span className="export-title">Exportar JSON</span>
            <span className="export-desc">Backup completo dos dados</span>
          </button>

          <button className="export-btn" onClick={handleExportReport}>
            <span className="export-icon">📄</span>
            <span className="export-title">Relatório Médico</span>
            <span className="export-desc">Documento formatado para consulta</span>
          </button>
        </div>

        <div className="export-summary">
          <h4>Seus dados:</h4>
          <ul>
            <li>💉 {doses.length} doses registradas</li>
            <li>⚖️ {weights.length} pesagens</li>
            <li>🩺 {sideEffects.length} efeitos colaterais</li>
            <li>📏 {measurements.length} medidas corporais</li>
          </ul>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportData

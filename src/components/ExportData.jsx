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

  const generatePDFReport = () => {
    const today = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    const sortedWeights = weights.length > 0
      ? [...weights].sort((a, b) => new Date(a.data) - new Date(b.data))
      : []
    const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].peso : profile.pesoAtual
    const weightLoss = profile.pesoAtual - currentWeight
    const percentage = ((weightLoss / profile.pesoAtual) * 100).toFixed(1)

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório Médico - ${profile.nome}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            color: #1a202c;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #38b2ac;
          }
          .logo { font-size: 48px; margin-bottom: 10px; }
          .title { font-size: 28px; font-weight: 700; color: #2d3748; margin-bottom: 5px; }
          .subtitle { font-size: 14px; color: #718096; }
          .date { font-size: 12px; color: #a0aec0; margin-top: 10px; }

          .section { margin-bottom: 25px; }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #38b2ac;
            margin-bottom: 12px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e2e8f0;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
          }
          .info-item {
            background: #f7fafc;
            padding: 10px;
            border-radius: 6px;
            border-left: 3px solid #38b2ac;
          }
          .info-label { font-size: 11px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-value { font-size: 14px; font-weight: 600; color: #1a202c; margin-top: 3px; }

          .summary-box {
            background: linear-gradient(135deg, #ebf8ff, #bee3f8);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
          }
          .summary-title { font-size: 12px; color: #2b6cb0; margin-bottom: 8px; }
          .summary-value { font-size: 24px; font-weight: 800; color: #2c5282; }
          .summary-sub { font-size: 11px; color: #4299e1; margin-top: 5px; }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 11px;
          }
          th {
            background: #38b2ac;
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:nth-child(even) { background: #f7fafc; }

          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 10px;
            color: #a0aec0;
          }

          .no-data {
            text-align: center;
            padding: 15px;
            color: #a0aec0;
            font-style: italic;
          }

          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">💉</div>
          <div class="title">Relatório Médico - Emagreci+</div>
          <div class="subtitle">Acompanhamento de Tratamento com GLP-1</div>
          <div class="date">Gerado em ${today}</div>
        </div>

        <div class="section">
          <div class="section-title">👤 Informações do Paciente</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nome Completo</div>
              <div class="info-value">${profile.nome}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Data de Nascimento</div>
              <div class="info-value">${profile.dataNascimento ? format(new Date(profile.dataNascimento), 'dd/MM/yyyy') : '-'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Medicação</div>
              <div class="info-value">${profile.tipoCaneta}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Objetivo</div>
              <div class="info-value">${profile.objetivo}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Altura</div>
              <div class="info-value">${profile.altura} cm</div>
            </div>
            <div class="info-item">
              <div class="info-label">Peso Inicial</div>
              <div class="info-value">${profile.pesoAtual} kg</div>
            </div>
          </div>
        </div>

        ${weights.length > 0 ? `
        <div class="summary-box">
          <div class="summary-title">EVOLUÇÃO DO PESO</div>
          <div class="summary-value">${weightLoss > 0 ? '-' : '+'}${Math.abs(weightLoss).toFixed(1)} kg</div>
          <div class="summary-sub">
            De ${profile.pesoAtual} kg para ${currentWeight} kg
            (${weightLoss > 0 ? '-' : '+'}${percentage}%)
          </div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">💉 Histórico de Aplicações (${doses.length} registros)</div>
          ${doses.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
                <th>Dosagem</th>
                <th>Local</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              ${doses.slice().reverse().map(d => `
                <tr>
                  <td>${format(new Date(d.data), 'dd/MM/yyyy')}</td>
                  <td>${d.horario}</td>
                  <td><strong>${d.dosagem} mg</strong></td>
                  <td>${d.local}</td>
                  <td>${d.observacoes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ` : '<div class="no-data">Nenhuma aplicação registrada</div>'}
        </div>

        <div class="section">
          <div class="section-title">⚖️ Histórico de Peso (${weights.length} registros)</div>
          ${weights.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Peso</th>
                <th>Variação</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              ${sortedWeights.map((w, i) => {
                const prevWeight = i > 0 ? sortedWeights[i-1].peso : profile.pesoAtual
                const diff = w.peso - prevWeight
                return `
                <tr>
                  <td>${format(new Date(w.data), 'dd/MM/yyyy')}</td>
                  <td><strong>${w.peso} kg</strong></td>
                  <td style="color: ${diff <= 0 ? '#48bb78' : '#e53e3e'}">${diff <= 0 ? '' : '+'}${diff.toFixed(1)} kg</td>
                  <td>${w.observacoes || '-'}</td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
          ` : '<div class="no-data">Nenhum peso registrado</div>'}
        </div>

        ${sideEffects.length > 0 ? `
        <div class="section">
          <div class="section-title">🩺 Efeitos Colaterais Reportados (${sideEffects.length} registros)</div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Intensidade</th>
                <th>Duração</th>
                <th>Observações</th>
              </tr>
            </thead>
            <tbody>
              ${sideEffects.slice().reverse().map(e => `
                <tr>
                  <td>${format(new Date(e.data), 'dd/MM/yyyy')}</td>
                  <td>${e.tipoLabel}</td>
                  <td><strong>${e.intensidade}/5</strong></td>
                  <td>${e.duracao}</td>
                  <td>${e.observacoes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${measurements.length > 0 ? `
        <div class="section">
          <div class="section-title">📏 Medidas Corporais (${measurements.length} registros)</div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Cintura</th>
                <th>Quadril</th>
                <th>Braço</th>
                <th>Coxa</th>
              </tr>
            </thead>
            <tbody>
              ${measurements.slice().reverse().map(m => `
                <tr>
                  <td>${format(new Date(m.data), 'dd/MM/yyyy')}</td>
                  <td>${m.cintura ? m.cintura + ' cm' : '-'}</td>
                  <td>${m.quadril ? m.quadril + ' cm' : '-'}</td>
                  <td>${m.braco ? m.braco + ' cm' : '-'}</td>
                  <td>${m.coxa ? m.coxa + ' cm' : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="footer">
          <p><strong>Emagreci+</strong> - Aplicativo de Acompanhamento de Tratamento com GLP-1</p>
          <p>Este relatório foi gerado automaticamente e deve ser apresentado ao médico responsável pelo tratamento.</p>
          <p>Relatório gerado em ${today}</p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="
            background: #38b2ac;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
          ">
            📄 Salvar como PDF / Imprimir
          </button>
        </div>
      </body>
      </html>
    `
    return html
  }

  const handleExportPDF = () => {
    const html = generatePDFReport()
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(html)
      newWindow.document.close()
      onSuccess('Relatório PDF gerado! Use Ctrl+P ou o botão para salvar.')
    } else {
      onSuccess('Popup bloqueado. Permita popups para gerar o PDF.')
    }
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
          <button className="export-btn export-btn-primary" onClick={handleExportPDF}>
            <span className="export-icon">📄</span>
            <span className="export-title">Relatório PDF para Médico</span>
            <span className="export-desc">Documento profissional completo com todos os dados</span>
          </button>

          <button className="export-btn" onClick={handleExportCSV}>
            <span className="export-icon">📊</span>
            <span className="export-title">Exportar CSV</span>
            <span className="export-desc">Planilha para Excel/Google Sheets</span>
          </button>

          <button className="export-btn" onClick={handleExportJSON}>
            <span className="export-icon">💾</span>
            <span className="export-title">Backup JSON</span>
            <span className="export-desc">Backup completo dos dados</span>
          </button>

          <button className="export-btn" onClick={handleExportReport}>
            <span className="export-icon">📝</span>
            <span className="export-title">Relatório Texto</span>
            <span className="export-desc">Versão simplificada em texto</span>
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

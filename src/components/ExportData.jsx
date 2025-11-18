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
        csv += `${e.data},${e.horario || ''},${e.tipo_label || e.tipoLabel},${e.intensidade}/5,${e.duracao},"${e.observacoes || ''}"\n`
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
        report += `• ${e.data} - ${e.tipo_label || e.tipoLabel} (Intensidade: ${e.intensidade}/5)\n`
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
    const sortedMeasurements = measurements.length > 0
      ? [...measurements].sort((a, b) => new Date(a.data) - new Date(b.data))
      : []
    const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].peso : profile.pesoAtual
    const weightLoss = profile.pesoAtual - currentWeight
    const percentage = ((weightLoss / profile.pesoAtual) * 100).toFixed(1)

    // Generate weight chart SVG
    const generateWeightChart = () => {
      if (sortedWeights.length < 2) return ''

      const chartWidth = 700
      const chartHeight = 250
      const padding = 50
      const dataPoints = sortedWeights.slice(-12) // Last 12 entries

      const minWeight = Math.min(...dataPoints.map(w => w.peso)) - 2
      const maxWeight = Math.max(...dataPoints.map(w => w.peso)) + 2
      const weightRange = maxWeight - minWeight

      const xStep = (chartWidth - 2 * padding) / (dataPoints.length - 1)

      const points = dataPoints.map((w, i) => {
        const x = padding + i * xStep
        const y = chartHeight - padding - ((w.peso - minWeight) / weightRange) * (chartHeight - 2 * padding)
        return { x, y, peso: w.peso, data: format(new Date(w.data), 'dd/MM') }
      })

      const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

      return `
        <div class="chart-container">
          <h4 style="color: #38b2ac; margin-bottom: 15px; font-size: 14px;">📈 Gráfico de Evolução do Peso</h4>
          <svg width="${chartWidth}" height="${chartHeight}" style="background: #f7fafc; border-radius: 8px;">
            <!-- Grid lines -->
            ${[0, 1, 2, 3, 4].map(i => {
              const y = padding + i * ((chartHeight - 2 * padding) / 4)
              const weightVal = (maxWeight - (i * weightRange / 4)).toFixed(1)
              return `
                <line x1="${padding}" y1="${y}" x2="${chartWidth - padding}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>
                <text x="${padding - 10}" y="${y + 4}" font-size="10" fill="#718096" text-anchor="end">${weightVal}</text>
              `
            }).join('')}

            <!-- Area fill -->
            <path d="${pathD} L ${points[points.length-1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z" fill="rgba(56, 178, 172, 0.1)"/>

            <!-- Line -->
            <path d="${pathD}" fill="none" stroke="#38b2ac" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

            <!-- Points and labels -->
            ${points.map(p => `
              <circle cx="${p.x}" cy="${p.y}" r="5" fill="#38b2ac" stroke="white" stroke-width="2"/>
              <text x="${p.x}" y="${chartHeight - padding + 20}" font-size="9" fill="#718096" text-anchor="middle">${p.data}</text>
              <text x="${p.x}" y="${p.y - 10}" font-size="10" fill="#2d3748" text-anchor="middle" font-weight="600">${p.peso}</text>
            `).join('')}

            <!-- Axis labels -->
            <text x="${padding - 35}" y="${chartHeight / 2}" font-size="11" fill="#4a5568" text-anchor="middle" transform="rotate(-90, ${padding - 35}, ${chartHeight / 2})">Peso (kg)</text>
          </svg>
        </div>
      `
    }

    // Generate measurements chart SVG
    const generateMeasurementsChart = () => {
      if (sortedMeasurements.length < 2) return ''

      const chartWidth = 700
      const chartHeight = 280
      const padding = 50
      const dataPoints = sortedMeasurements.slice(-10) // Last 10 entries

      // Get all measurements values
      const allValues = []
      dataPoints.forEach(m => {
        if (m.cintura) allValues.push(m.cintura)
        if (m.quadril) allValues.push(m.quadril)
        if (m.coxa) allValues.push(m.coxa)
        if (m.braco) allValues.push(m.braco)
      })

      if (allValues.length === 0) return ''

      const minVal = Math.min(...allValues) - 5
      const maxVal = Math.max(...allValues) + 5
      const valRange = maxVal - minVal

      const xStep = (chartWidth - 2 * padding) / (dataPoints.length - 1)

      const getPoints = (key) => {
        return dataPoints.map((m, i) => {
          const x = padding + i * xStep
          const val = m[key]
          if (!val) return null
          const y = chartHeight - padding - ((val - minVal) / valRange) * (chartHeight - 2 * padding)
          return { x, y, val, data: format(new Date(m.data), 'dd/MM') }
        }).filter(p => p !== null)
      }

      const cinturaPoints = getPoints('cintura')
      const quadrilPoints = getPoints('quadril')
      const coxaPoints = getPoints('coxa')
      const bracoPoints = getPoints('braco')

      const createPath = (points, color) => {
        if (points.length < 2) return ''
        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
        return `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
      }

      return `
        <div class="chart-container" style="margin-top: 20px;">
          <h4 style="color: #ed8936; margin-bottom: 15px; font-size: 14px;">📏 Gráfico de Evolução das Medidas</h4>
          <svg width="${chartWidth}" height="${chartHeight}" style="background: #f7fafc; border-radius: 8px;">
            <!-- Grid lines -->
            ${[0, 1, 2, 3, 4].map(i => {
              const y = padding + i * ((chartHeight - 2 * padding) / 4)
              const val = (maxVal - (i * valRange / 4)).toFixed(0)
              return `
                <line x1="${padding}" y1="${y}" x2="${chartWidth - padding}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>
                <text x="${padding - 10}" y="${y + 4}" font-size="10" fill="#718096" text-anchor="end">${val}</text>
              `
            }).join('')}

            <!-- Lines for each measurement -->
            ${createPath(cinturaPoints, '#e53e3e')}
            ${createPath(quadrilPoints, '#38a169')}
            ${createPath(coxaPoints, '#3182ce')}
            ${createPath(bracoPoints, '#805ad5')}

            <!-- Points -->
            ${cinturaPoints.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#e53e3e" stroke="white" stroke-width="2"/>`).join('')}
            ${quadrilPoints.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#38a169" stroke="white" stroke-width="2"/>`).join('')}
            ${coxaPoints.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#3182ce" stroke="white" stroke-width="2"/>`).join('')}
            ${bracoPoints.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#805ad5" stroke="white" stroke-width="2"/>`).join('')}

            <!-- Date labels -->
            ${dataPoints.map((m, i) => {
              const x = padding + i * xStep
              return `<text x="${x}" y="${chartHeight - padding + 20}" font-size="9" fill="#718096" text-anchor="middle">${format(new Date(m.data), 'dd/MM')}</text>`
            }).join('')}

            <!-- Axis label -->
            <text x="${padding - 35}" y="${chartHeight / 2}" font-size="11" fill="#4a5568" text-anchor="middle" transform="rotate(-90, ${padding - 35}, ${chartHeight / 2})">Medida (cm)</text>
          </svg>

          <!-- Legend -->
          <div style="display: flex; justify-content: center; gap: 20px; margin-top: 10px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 5px;">
              <div style="width: 12px; height: 12px; background: #e53e3e; border-radius: 50%;"></div>
              <span style="font-size: 11px; color: #4a5568;">Cintura</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
              <div style="width: 12px; height: 12px; background: #38a169; border-radius: 50%;"></div>
              <span style="font-size: 11px; color: #4a5568;">Quadril</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
              <div style="width: 12px; height: 12px; background: #3182ce; border-radius: 50%;"></div>
              <span style="font-size: 11px; color: #4a5568;">Coxa</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
              <div style="width: 12px; height: 12px; background: #805ad5; border-radius: 50%;"></div>
              <span style="font-size: 11px; color: #4a5568;">Braço</span>
            </div>
          </div>
        </div>
      `
    }

    // Generate side effects summary
    const generateSideEffectsSummary = () => {
      if (sideEffects.length === 0) return ''

      // Group effects by type
      const effectsByType = {}
      sideEffects.forEach(e => {
        const label = e.tipo_label || e.tipoLabel
        if (!effectsByType[label]) {
          effectsByType[label] = {
            count: 0,
            totalIntensity: 0,
            maxIntensity: 0
          }
        }
        effectsByType[label].count++
        effectsByType[label].totalIntensity += e.intensidade
        effectsByType[label].maxIntensity = Math.max(effectsByType[label].maxIntensity, e.intensidade)
      })

      const sortedEffects = Object.entries(effectsByType)
        .map(([type, data]) => ({
          type,
          count: data.count,
          avgIntensity: (data.totalIntensity / data.count).toFixed(1),
          maxIntensity: data.maxIntensity
        }))
        .sort((a, b) => b.count - a.count)

      return `
        <div class="effects-summary" style="background: #fff5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #fed7d7;">
          <h4 style="color: #c53030; margin-bottom: 12px; font-size: 13px;">📊 Resumo dos Efeitos Colaterais</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
            ${sortedEffects.map(effect => `
              <div style="background: white; padding: 10px; border-radius: 6px; border-left: 3px solid #fc8181;">
                <div style="font-weight: 600; color: #1a202c; font-size: 12px;">${effect.type}</div>
                <div style="font-size: 11px; color: #718096; margin-top: 4px;">
                  Ocorrências: <strong>${effect.count}x</strong><br>
                  Intensidade média: <strong>${effect.avgIntensity}/5</strong><br>
                  Intensidade máxima: <strong>${effect.maxIntensity}/5</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `
    }

    // Generate measurement avatar visualization (InBody Style)
    const generateMeasurementAvatar = () => {
      if (sortedMeasurements.length === 0) return ''

      const first = sortedMeasurements[0]
      const last = sortedMeasurements[sortedMeasurements.length - 1]
      const hasMultiple = sortedMeasurements.length > 1

      const getMeasurementData = (field, label) => {
        const initialVal = first[field] || 0
        const currentVal = last[field] || 0
        const diff = initialVal - currentVal
        const percentage = initialVal > 0 ? ((diff / initialVal) * 100).toFixed(1) : 0

        if (!initialVal && !currentVal) return null

        return {
          label,
          initial: initialVal,
          current: currentVal,
          diff,
          percentage,
          hasData: true
        }
      }

      const measurements = {
        pescoco: getMeasurementData('pescoco', 'Pescoço'),
        braco: getMeasurementData('braco', 'Braço'),
        cintura: getMeasurementData('cintura', 'Cintura'),
        quadril: getMeasurementData('quadril', 'Quadril'),
        coxa: getMeasurementData('coxa', 'Coxa')
      }

      // Função para determinar cor baseada no progresso
      const getProgressColor = (diff) => {
        if (diff > 0) return { bg: '#d1fae5', text: '#065f46', bar: '#10b981' } // Verde - perdeu cm
        if (diff < 0) return { bg: '#fee2e2', text: '#991b1b', bar: '#ef4444' } // Vermelho - ganhou cm
        return { bg: '#e0e7ff', text: '#3730a3', bar: '#6366f1' } // Azul - sem mudança
      }

      // Renderizar barra de progresso horizontal (estilo InBody)
      const renderProgressBar = (data) => {
        if (!data) return ''

        const colors = getProgressColor(data.diff)
        const maxVal = Math.max(data.initial, data.current) * 1.2 // 20% de margem
        const initialPercent = (data.initial / maxVal) * 100
        const currentPercent = (data.current / maxVal) * 100

        return `
          <div style="margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid ${colors.bar};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-weight: 700; font-size: 12px; color: #2d3748;">${data.label}</div>
              <div style="font-size: 11px; color: #64748b;">
                ${hasMultiple ? `${data.initial.toFixed(1)} → ${data.current.toFixed(1)} cm` : `${data.current.toFixed(1)} cm`}
              </div>
            </div>

            ${hasMultiple ? `
              <div style="position: relative; height: 24px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 6px;">
                <div style="position: absolute; top: 0; left: 0; height: 100%; background: ${colors.bar}; width: ${currentPercent}%; opacity: 0.9; border-radius: 4px;"></div>
                <div style="position: absolute; top: 0; left: 0; height: 100%; border: 2px dashed #94a3b8; width: ${initialPercent}%; background: transparent; border-radius: 4px;"></div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 10px; font-weight: 700; color: #1a202c; text-shadow: 0 0 3px white;">${data.current.toFixed(1)} cm</div>
              </div>

              ${data.diff !== 0 ? `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="font-size: 10px; color: #64748b;">
                    <span style="padding: 2px 6px; background: ${colors.bg}; color: ${colors.text}; border-radius: 4px; font-weight: 600;">
                      ${data.diff > 0 ? '▼' : '▲'} ${Math.abs(data.diff).toFixed(1)} cm
                    </span>
                  </div>
                  <div style="font-size: 10px; font-weight: 600; color: ${colors.text};">
                    ${data.diff > 0 ? 'Reduziu' : 'Aumentou'} ${Math.abs(parseFloat(data.percentage))}%
                  </div>
                </div>
              ` : `
                <div style="font-size: 10px; color: #64748b; text-align: center;">Sem alteração</div>
              `}
            ` : `
              <div style="position: relative; height: 20px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; height: 100%; background: ${colors.bar}; width: ${currentPercent}%; border-radius: 4px;"></div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 10px; font-weight: 700; color: #1a202c; text-shadow: 0 0 3px white;">${data.current.toFixed(1)} cm</div>
              </div>
            `}
          </div>
        `
      }

      // SVG do corpo (frontal e lateral)
      const bodyVisualization = `
        <div style="display: flex; justify-content: space-around; align-items: center; margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); border-radius: 12px;">
          <!-- Visão Frontal -->
          <div style="text-align: center;">
            <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 8px;">VISÃO FRONTAL</div>
            <svg width="120" height="280" viewBox="0 0 120 280" xmlns="http://www.w3.org/2000/svg">
              <!-- Cabeça -->
              <circle cx="60" cy="25" r="18" fill="#ffd6a5" stroke="#333" stroke-width="1.5"/>
              <!-- Pescoço -->
              <rect x="54" y="40" width="12" height="15" fill="#ffd6a5" stroke="#333" stroke-width="1.5"/>
              <!-- Tronco -->
              <path d="M 35 55 Q 30 100, 30 130 L 30 160 Q 30 170, 35 175 L 85 175 Q 90 170, 90 160 L 90 130 Q 90 100, 85 55 Z" fill="#a0c4ff" stroke="#333" stroke-width="1.5"/>
              <!-- Braços -->
              <ellipse cx="25" cy="90" rx="8" ry="35" fill="#ffd6a5" stroke="#333" stroke-width="1.5"/>
              <ellipse cx="95" cy="90" rx="8" ry="35" fill="#ffd6a5" stroke="#333" stroke-width="1.5"/>
              <!-- Pernas -->
              <rect x="40" y="175" width="14" height="95" rx="7" fill="#a0c4ff" stroke="#333" stroke-width="1.5"/>
              <rect x="66" y="175" width="14" height="95" rx="7" fill="#a0c4ff" stroke="#333" stroke-width="1.5"/>
              <!-- Pés -->
              <ellipse cx="47" cy="270" rx="8" ry="5" fill="#333"/>
              <ellipse cx="73" cy="270" rx="8" ry="5" fill="#333"/>
              <!-- Linhas de medida -->
              <line x1="30" y1="50" x2="90" y2="50" stroke="#667eea" stroke-width="1.5" stroke-dasharray="2,2"/>
              <line x1="30" y1="135" x2="90" y2="135" stroke="#667eea" stroke-width="2" stroke-dasharray="2,2"/>
              <line x1="28" y1="175" x2="92" y2="175" stroke="#667eea" stroke-width="1.5" stroke-dasharray="2,2"/>
              <line x1="40" y1="210" x2="80" y2="210" stroke="#667eea" stroke-width="1.5" stroke-dasharray="2,2"/>
            </svg>
          </div>

          <!-- Visão Lateral -->
          <div style="text-align: center;">
            <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-bottom: 8px;">VISÃO LATERAL</div>
            <svg width="80" height="280" viewBox="0 0 80 280" xmlns="http://www.w3.org/2000/svg">
              <!-- Cabeça (lateral) -->
              <circle cx="40" cy="25" r="18" fill="#ffd6a5" stroke="#333" stroke-width="1.5"/>
              <!-- Pescoço -->
              <path d="M 35 40 Q 33 47, 36 55 L 44 55 Q 47 47, 45 40 Z" fill="#ffd6a5" stroke="#333" stroke-width="1.5"/>
              <!-- Tronco (lateral) -->
              <path d="M 20 55 Q 15 90, 18 130 Q 20 160, 25 175 L 55 175 Q 60 160, 58 130 Q 55 90, 50 55 Z" fill="#a0c4ff" stroke="#333" stroke-width="1.5"/>
              <!-- Perna (lateral) -->
              <path d="M 30 175 L 28 270 L 42 270 L 45 175 Z" fill="#a0c4ff" stroke="#333" stroke-width="1.5"/>
              <!-- Pé -->
              <ellipse cx="35" cy="272" rx="12" ry="5" fill="#333"/>
              <!-- Curvas -->
              <path d="M 36 55 Q 32 90, 35 130" stroke="#667eea" stroke-width="1.5" stroke-dasharray="2,2" fill="none"/>
              <path d="M 44 55 Q 48 90, 45 130" stroke="#667eea" stroke-width="1.5" stroke-dasharray="2,2" fill="none"/>
            </svg>
          </div>
        </div>
      `

      return `
        <div style="page-break-inside: avoid; margin-bottom: 25px;">
          <div style="background: white; border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 3px solid #667eea;">
              <div style="font-size: 18px; font-weight: 800; color: #1a202c; margin-bottom: 4px; letter-spacing: -0.5px;">
                📊 ANÁLISE SEGMENTADA DE COMPOSIÇÃO CORPORAL
              </div>
              ${hasMultiple ? `
                <div style="font-size: 11px; color: #64748b; font-weight: 600;">
                  COMPARAÇÃO: ${format(new Date(first.data), 'dd/MM/yyyy')} → ${format(new Date(last.data), 'dd/MM/yyyy')}
                  <span style="margin-left: 8px; padding: 2px 8px; background: #667eea20; color: #667eea; border-radius: 4px; font-size: 10px;">
                    ${sortedMeasurements.length} medições registradas
                  </span>
                </div>
              ` : `
                <div style="font-size: 11px; color: #64748b; font-weight: 600;">
                  MEDIÇÃO REALIZADA EM: ${format(new Date(last.data), 'dd/MM/yyyy')}
                </div>
              `}
            </div>

            <!-- Body Visualization -->
            ${bodyVisualization}

            <!-- Measurements Analysis -->
            <div style="margin-bottom: 16px;">
              <div style="background: linear-gradient(90deg, #667eea, #764ba2); color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 12px; text-align: center;">
                ${hasMultiple ? 'ANÁLISE COMPARATIVA DE MEDIDAS' : 'MEDIDAS CORPORAIS'}
              </div>

              ${measurements.pescoco ? renderProgressBar(measurements.pescoco) : ''}
              ${measurements.braco ? renderProgressBar(measurements.braco) : ''}
              ${measurements.cintura ? renderProgressBar(measurements.cintura) : ''}
              ${measurements.quadril ? renderProgressBar(measurements.quadril) : ''}
              ${measurements.coxa ? renderProgressBar(measurements.coxa) : ''}
            </div>

            <!-- Summary -->
            ${hasMultiple ? `
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 16px; border-radius: 10px; border: 2px solid #0ea5e9;">
                <div style="font-size: 12px; font-weight: 700; color: #0369a1; margin-bottom: 10px; text-align: center;">
                  📈 RESUMO DO PROGRESSO
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                  ${Object.values(measurements).filter(m => m && m.diff !== 0).map(m => `
                    <div style="background: white; padding: 10px; border-radius: 6px; text-align: center; border: 1px solid ${getProgressColor(m.diff).bar};">
                      <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">${m.label}</div>
                      <div style="font-size: 16px; font-weight: 800; color: ${getProgressColor(m.diff).bar}; margin-bottom: 2px;">
                        ${m.diff > 0 ? '-' : '+'}${Math.abs(m.diff).toFixed(1)} cm
                      </div>
                      <div style="font-size: 9px; color: ${getProgressColor(m.diff).text}; font-weight: 600;">
                        ${Math.abs(parseFloat(m.percentage))}% ${m.diff > 0 ? 'redução' : 'aumento'}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Legend -->
            <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-size: 10px; color: #64748b;">
                ${hasMultiple ? `
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="width: 12px; height: 12px; background: #10b981; border-radius: 2px;"></div>
                    <span>Medida Atual</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <div style="width: 12px; height: 12px; border: 2px dashed #94a3b8; border-radius: 2px; background: transparent;"></div>
                    <span>Medida Inicial</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-weight: 700; color: #10b981;">▼</span>
                    <span>Redução (Bom)</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-weight: 700; color: #ef4444;">▲</span>
                    <span>Aumento</span>
                  </div>
                ` : `
                  <div style="text-align: center; font-style: italic;">
                    Registre novas medições para acompanhar seu progresso ao longo do tempo
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      `
    }
    // Calculate measurements changes
    const getMeasurementsChanges = () => {
      if (sortedMeasurements.length < 2) return ''

      const first = sortedMeasurements[0]
      const last = sortedMeasurements[sortedMeasurements.length - 1]

      const changes = []
      if (first.cintura && last.cintura) {
        const diff = last.cintura - first.cintura
        changes.push(`Cintura: ${diff <= 0 ? '' : '+'}${diff.toFixed(1)} cm`)
      }
      if (first.quadril && last.quadril) {
        const diff = last.quadril - first.quadril
        changes.push(`Quadril: ${diff <= 0 ? '' : '+'}${diff.toFixed(1)} cm`)
      }
      if (first.coxa && last.coxa) {
        const diff = last.coxa - first.coxa
        changes.push(`Coxa: ${diff <= 0 ? '' : '+'}${diff.toFixed(1)} cm`)
      }
      if (first.braco && last.braco) {
        const diff = last.braco - first.braco
        changes.push(`Braço: ${diff <= 0 ? '' : '+'}${diff.toFixed(1)} cm`)
      }

      if (changes.length === 0) return ''

      return `
        <div style="background: #fefcbf; padding: 12px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #f6e05e;">
          <div style="font-size: 12px; color: #744210; font-weight: 600; margin-bottom: 8px;">📏 Variação Total das Medidas</div>
          <div style="display: flex; flex-wrap: wrap; gap: 15px;">
            ${changes.map(c => `<span style="font-size: 11px; color: #744210;">${c}</span>`).join('')}
          </div>
        </div>
      `
    }

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

          .section { margin-bottom: 25px; page-break-inside: avoid; }
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

          .chart-container {
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            margin-bottom: 20px;
          }

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
            .section { page-break-inside: avoid; }
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

        ${generateWeightChart()}
        ` : ''}

        ${sortedMeasurements.length > 0 ? `
        ${generateMeasurementAvatar()}
        ${getMeasurementsChanges()}
        ${generateMeasurementsChart()}
        ` : ''}

        ${sideEffects.length > 0 ? `
        <div class="section">
          <div class="section-title">🩺 Efeitos Colaterais Durante o Tratamento</div>
          ${generateSideEffectsSummary()}
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Horário</th>
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
                  <td>${e.horario || '-'}</td>
                  <td><strong>${e.tipo_label || e.tipoLabel}</strong></td>
                  <td style="color: ${e.intensidade >= 4 ? '#e53e3e' : e.intensidade >= 3 ? '#dd6b20' : '#38a169'}"><strong>${e.intensidade}/5</strong></td>
                  <td>${e.duracao}</td>
                  <td>${e.observacoes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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
          <div class="section-title">⚖️ Histórico Completo de Peso (${weights.length} registros)</div>
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

        ${measurements.length > 0 ? `
        <div class="section">
          <div class="section-title">📏 Histórico Completo de Medidas (${measurements.length} registros)</div>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Cintura</th>
                <th>Quadril</th>
                <th>Braço</th>
                <th>Coxa</th>
                <th>Pescoço</th>
              </tr>
            </thead>
            <tbody>
              ${sortedMeasurements.map(m => `
                <tr>
                  <td>${format(new Date(m.data), 'dd/MM/yyyy')}</td>
                  <td>${m.cintura ? m.cintura + ' cm' : '-'}</td>
                  <td>${m.quadril ? m.quadril + ' cm' : '-'}</td>
                  <td>${m.braco ? m.braco + ' cm' : '-'}</td>
                  <td>${m.coxa ? m.coxa + ' cm' : '-'}</td>
                  <td>${m.pescoco ? m.pescoco + ' cm' : '-'}</td>
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

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

    // Generate body avatar with measurements
    const generateBodyAvatar = () => {
      if (sortedMeasurements.length < 2) return ''

      const first = sortedMeasurements[0]
      const last = sortedMeasurements[sortedMeasurements.length - 1]

      // Calculate differences
      const measurements = {
        cintura: {
          inicial: first.cintura || 0,
          atual: last.cintura || 0,
          diff: (last.cintura || 0) - (first.cintura || 0)
        },
        quadril: {
          inicial: first.quadril || 0,
          atual: last.quadril || 0,
          diff: (last.quadril || 0) - (first.quadril || 0)
        },
        braco: {
          inicial: first.braco || 0,
          atual: last.braco || 0,
          diff: (last.braco || 0) - (first.braco || 0)
        },
        coxa: {
          inicial: first.coxa || 0,
          atual: last.coxa || 0,
          diff: (last.coxa || 0) - (first.coxa || 0)
        }
      }

      const hasAnyMeasurement = Object.values(measurements).some(m => m.inicial > 0 && m.atual > 0)
      if (!hasAnyMeasurement) return ''

      return `
        <div style="background: linear-gradient(135deg, #f0fff4, #c6f6d5); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #9ae6b4;">
          <h4 style="text-align: center; color: #22543d; margin-bottom: 20px; font-size: 16px;">👤 Evolução das Medidas Corporais</h4>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
            <!-- Before Avatar -->
            <div style="text-align: center;">
              <div style="background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h5 style="color: #e53e3e; margin-bottom: 15px; font-size: 13px;">📅 INÍCIO</h5>
                <svg width="180" height="280" viewBox="0 0 180 280" style="margin: 0 auto;">
                  <!-- Head -->
                  <circle cx="90" cy="30" r="20" fill="#fed7d7" stroke="#e53e3e" stroke-width="2"/>
                  <!-- Body -->
                  <rect x="70" y="55" width="40" height="80" rx="10" fill="#fed7d7" stroke="#e53e3e" stroke-width="2"/>
                  <!-- Arms -->
                  <rect x="40" y="60" width="25" height="50" rx="8" fill="#fed7d7" stroke="#e53e3e" stroke-width="2"/>
                  <rect x="115" y="60" width="25" height="50" rx="8" fill="#fed7d7" stroke="#e53e3e" stroke-width="2"/>
                  <!-- Legs -->
                  <rect x="75" y="140" width="15" height="90" rx="7" fill="#fed7d7" stroke="#e53e3e" stroke-width="2"/>
                  <rect x="90" y="140" width="15" height="90" rx="7" fill="#fed7d7" stroke="#e53e3e" stroke-width="2"/>

                  <!-- Measurement labels - Before -->
                  ${measurements.braco.inicial > 0 ? `
                    <text x="25" y="85" font-size="10" fill="#c53030" font-weight="600" text-anchor="middle">
                      ${measurements.braco.inicial.toFixed(1)}
                    </text>
                  ` : ''}

                  ${measurements.cintura.inicial > 0 ? `
                    <text x="90" y="100" font-size="10" fill="#c53030" font-weight="600" text-anchor="middle">
                      ${measurements.cintura.inicial.toFixed(1)}
                    </text>
                  ` : ''}

                  ${measurements.quadril.inicial > 0 ? `
                    <text x="90" y="145" font-size="10" fill="#c53030" font-weight="600" text-anchor="middle">
                      ${measurements.quadril.inicial.toFixed(1)}
                    </text>
                  ` : ''}

                  ${measurements.coxa.inicial > 0 ? `
                    <text x="82" y="180" font-size="10" fill="#c53030" font-weight="600" text-anchor="middle">
                      ${measurements.coxa.inicial.toFixed(1)}
                    </text>
                  ` : ''}
                </svg>

                <div style="margin-top: 15px; padding: 10px; background: #fff5f5; border-radius: 8px;">
                  ${measurements.braco.inicial > 0 ? `<div style="font-size: 10px; color: #742a2a; margin: 3px 0;"><strong>Braço:</strong> ${measurements.braco.inicial.toFixed(1)} cm</div>` : ''}
                  ${measurements.cintura.inicial > 0 ? `<div style="font-size: 10px; color: #742a2a; margin: 3px 0;"><strong>Cintura:</strong> ${measurements.cintura.inicial.toFixed(1)} cm</div>` : ''}
                  ${measurements.quadril.inicial > 0 ? `<div style="font-size: 10px; color: #742a2a; margin: 3px 0;"><strong>Quadril:</strong> ${measurements.quadril.inicial.toFixed(1)} cm</div>` : ''}
                  ${measurements.coxa.inicial > 0 ? `<div style="font-size: 10px; color: #742a2a; margin: 3px 0;"><strong>Coxa:</strong> ${measurements.coxa.inicial.toFixed(1)} cm</div>` : ''}
                </div>
              </div>
            </div>

            <!-- After Avatar -->
            <div style="text-align: center;">
              <div style="background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h5 style="color: #38a169; margin-bottom: 15px; font-size: 13px;">✅ ATUAL</h5>
                <svg width="180" height="280" viewBox="0 0 180 280" style="margin: 0 auto;">
                  <!-- Head -->
                  <circle cx="90" cy="30" r="20" fill="#c6f6d5" stroke="#38a169" stroke-width="2"/>
                  <!-- Body (slightly smaller) -->
                  <rect x="72" y="55" width="36" height="78" rx="10" fill="#c6f6d5" stroke="#38a169" stroke-width="2"/>
                  <!-- Arms (slightly smaller) -->
                  <rect x="42" y="60" width="23" height="48" rx="8" fill="#c6f6d5" stroke="#38a169" stroke-width="2"/>
                  <rect x="115" y="60" width="23" height="48" rx="8" fill="#c6f6d5" stroke="#38a169" stroke-width="2"/>
                  <!-- Legs (slightly smaller) -->
                  <rect x="76" y="138" width="14" height="88" rx="7" fill="#c6f6d5" stroke="#38a169" stroke-width="2"/>
                  <rect x="90" y="138" width="14" height="88" rx="7" fill="#c6f6d5" stroke="#38a169" stroke-width="2"/>

                  <!-- Measurement labels - After -->
                  ${measurements.braco.atual > 0 ? `
                    <text x="25" y="85" font-size="10" fill="#22543d" font-weight="600" text-anchor="middle">
                      ${measurements.braco.atual.toFixed(1)}
                    </text>
                  ` : ''}

                  ${measurements.cintura.atual > 0 ? `
                    <text x="90" y="100" font-size="10" fill="#22543d" font-weight="600" text-anchor="middle">
                      ${measurements.cintura.atual.toFixed(1)}
                    </text>
                  ` : ''}

                  ${measurements.quadril.atual > 0 ? `
                    <text x="90" y="143" font-size="10" fill="#22543d" font-weight="600" text-anchor="middle">
                      ${measurements.quadril.atual.toFixed(1)}
                    </text>
                  ` : ''}

                  ${measurements.coxa.atual > 0 ? `
                    <text x="82" y="178" font-size="10" fill="#22543d" font-weight="600" text-anchor="middle">
                      ${measurements.coxa.atual.toFixed(1)}
                    </text>
                  ` : ''}
                </svg>

                <div style="margin-top: 15px; padding: 10px; background: #f0fff4; border-radius: 8px;">
                  ${measurements.braco.atual > 0 ? `<div style="font-size: 10px; color: #22543d; margin: 3px 0;"><strong>Braço:</strong> ${measurements.braco.atual.toFixed(1)} cm</div>` : ''}
                  ${measurements.cintura.atual > 0 ? `<div style="font-size: 10px; color: #22543d; margin: 3px 0;"><strong>Cintura:</strong> ${measurements.cintura.atual.toFixed(1)} cm</div>` : ''}
                  ${measurements.quadril.atual > 0 ? `<div style="font-size: 10px; color: #22543d; margin: 3px 0;"><strong>Quadril:</strong> ${measurements.quadril.atual.toFixed(1)} cm</div>` : ''}
                  ${measurements.coxa.atual > 0 ? `<div style="font-size: 10px; color: #22543d; margin: 3px 0;"><strong>Coxa:</strong> ${measurements.coxa.atual.toFixed(1)} cm</div>` : ''}
                </div>
              </div>
            </div>
          </div>

          <!-- Differences Summary -->
          <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h5 style="text-align: center; color: #2d3748; margin-bottom: 12px; font-size: 14px;">📊 Redução Total</h5>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
              ${measurements.braco.diff !== 0 && measurements.braco.inicial > 0 ? `
                <div style="text-align: center; padding: 10px; background: ${measurements.braco.diff < 0 ? '#f0fff4' : '#fff5f5'}; border-radius: 8px; border: 2px solid ${measurements.braco.diff < 0 ? '#9ae6b4' : '#fc8181'};">
                  <div style="font-size: 11px; color: #718096; margin-bottom: 4px;">Braço</div>
                  <div style="font-size: 16px; font-weight: 700; color: ${measurements.braco.diff < 0 ? '#38a169' : '#e53e3e'};">
                    ${measurements.braco.diff > 0 ? '+' : ''}${measurements.braco.diff.toFixed(1)} cm
                  </div>
                </div>
              ` : ''}

              ${measurements.cintura.diff !== 0 && measurements.cintura.inicial > 0 ? `
                <div style="text-align: center; padding: 10px; background: ${measurements.cintura.diff < 0 ? '#f0fff4' : '#fff5f5'}; border-radius: 8px; border: 2px solid ${measurements.cintura.diff < 0 ? '#9ae6b4' : '#fc8181'};">
                  <div style="font-size: 11px; color: #718096; margin-bottom: 4px;">Cintura</div>
                  <div style="font-size: 16px; font-weight: 700; color: ${measurements.cintura.diff < 0 ? '#38a169' : '#e53e3e'};">
                    ${measurements.cintura.diff > 0 ? '+' : ''}${measurements.cintura.diff.toFixed(1)} cm
                  </div>
                </div>
              ` : ''}

              ${measurements.quadril.diff !== 0 && measurements.quadril.inicial > 0 ? `
                <div style="text-align: center; padding: 10px; background: ${measurements.quadril.diff < 0 ? '#f0fff4' : '#fff5f5'}; border-radius: 8px; border: 2px solid ${measurements.quadril.diff < 0 ? '#9ae6b4' : '#fc8181'};">
                  <div style="font-size: 11px; color: #718096; margin-bottom: 4px;">Quadril</div>
                  <div style="font-size: 16px; font-weight: 700; color: ${measurements.quadril.diff < 0 ? '#38a169' : '#e53e3e'};">
                    ${measurements.quadril.diff > 0 ? '+' : ''}${measurements.quadril.diff.toFixed(1)} cm
                  </div>
                </div>
              ` : ''}

              ${measurements.coxa.diff !== 0 && measurements.coxa.inicial > 0 ? `
                <div style="text-align: center; padding: 10px; background: ${measurements.coxa.diff < 0 ? '#f0fff4' : '#fff5f5'}; border-radius: 8px; border: 2px solid ${measurements.coxa.diff < 0 ? '#9ae6b4' : '#fc8181'};">
                  <div style="font-size: 11px; color: #718096; margin-bottom: 4px;">Coxa</div>
                  <div style="font-size: 16px; font-weight: 700; color: ${measurements.coxa.diff < 0 ? '#38a169' : '#e53e3e'};">
                    ${measurements.coxa.diff > 0 ? '+' : ''}${measurements.coxa.diff.toFixed(1)} cm
                  </div>
                </div>
              ` : ''}
            </div>
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
        ${generateBodyAvatar()}
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

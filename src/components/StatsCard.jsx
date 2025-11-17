import { calculateIMC, getIMCCategory, calculateWeightLoss } from '../utils/calculations'
import './StatsCard.css'

function StatsCard({ profile, weights, doses, sideEffects }) {
  const initialWeight = profile?.pesoAtual ? parseFloat(profile.pesoAtual) : 0
  const height = profile?.altura ? parseFloat(profile.altura) : 0

  // Peso atual (mais recente registrado ou do perfil)
  const sortedWeights = weights.length > 0
    ? [...weights].sort((a, b) => new Date(b.data) - new Date(a.data))
    : []
  const currentWeight = sortedWeights.length > 0 ? sortedWeights[0].peso : initialWeight

  // Cálculos
  const imc = height > 0 ? calculateIMC(currentWeight, height) : 0
  const imcCategory = getIMCCategory(parseFloat(imc))
  const weightLossData = calculateWeightLoss(initialWeight, currentWeight)

  // Estatísticas de doses
  const totalDoses = doses.length
  const lastDose = doses.length > 0
    ? [...doses].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
    : null

  // Dias desde última dose
  const daysSinceLastDose = lastDose
    ? Math.floor((new Date() - new Date(lastDose.timestamp)) / (1000 * 60 * 60 * 24))
    : null

  // Efeitos colaterais frequentes
  const effectCounts = {}
  sideEffects.forEach(e => {
    effectCounts[e.tipoLabel] = (effectCounts[e.tipoLabel] || 0) + 1
  })
  const mostCommonEffect = Object.entries(effectCounts)
    .sort((a, b) => b[1] - a[1])[0]

  // Média de peso perdido por semana
  const weeksOnMedication = totalDoses > 0 && lastDose
    ? Math.max(1, Math.ceil((new Date(lastDose.timestamp) - new Date(doses[0].timestamp)) / (1000 * 60 * 60 * 24 * 7)))
    : 1
  const avgWeightLossPerWeek = weightLossData.kg > 0
    ? (parseFloat(weightLossData.kg) / weeksOnMedication).toFixed(2)
    : 0

  return (
    <div className="stats-container">
      <h2>📊 Suas Estatísticas</h2>

      <div className="stats-grid">
        {/* IMC */}
        <div className="stat-card imc-card">
          <div className="stat-header">
            <span className="stat-icon">📊</span>
            <span className="stat-title">IMC Atual</span>
          </div>
          <div className="stat-value" style={{ color: imcCategory.color }}>
            {imc}
          </div>
          <div className="stat-label" style={{ color: imcCategory.color }}>
            {imcCategory.text}
          </div>
        </div>

        {/* Perda de Peso */}
        <div className="stat-card weight-loss-card">
          <div className="stat-header">
            <span className="stat-icon">📉</span>
            <span className="stat-title">Peso Perdido</span>
          </div>
          <div className="stat-value">
            {weightLossData.kg > 0 ? `-${weightLossData.kg}` : weightLossData.kg} kg
          </div>
          <div className="stat-label">
            {weightLossData.percentual > 0 ? `-${weightLossData.percentual}%` : '0%'} do peso inicial
          </div>
        </div>

        {/* Peso Atual */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">⚖️</span>
            <span className="stat-title">Peso Atual</span>
          </div>
          <div className="stat-value">{currentWeight} kg</div>
          <div className="stat-label">Inicial: {initialWeight} kg</div>
        </div>

        {/* Total de Doses */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">💉</span>
            <span className="stat-title">Total de Doses</span>
          </div>
          <div className="stat-value">{totalDoses}</div>
          <div className="stat-label">
            {daysSinceLastDose !== null
              ? daysSinceLastDose === 0
                ? 'Última: Hoje'
                : `Última: ${daysSinceLastDose} dia(s) atrás`
              : 'Nenhuma dose registrada'}
          </div>
        </div>

        {/* Média Semanal */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">📈</span>
            <span className="stat-title">Média Semanal</span>
          </div>
          <div className="stat-value">{avgWeightLossPerWeek} kg</div>
          <div className="stat-label">Perda por semana</div>
        </div>

        {/* Efeitos Colaterais */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">🩺</span>
            <span className="stat-title">Efeitos Colaterais</span>
          </div>
          <div className="stat-value">{sideEffects.length}</div>
          <div className="stat-label">
            {mostCommonEffect
              ? `Mais comum: ${mostCommonEffect[0]}`
              : 'Nenhum registrado'}
          </div>
        </div>
      </div>

      {/* Insight Principal */}
      {totalDoses > 0 && (
        <div className="main-insight">
          <div className="insight-icon">💡</div>
          <div className="insight-text">
            {weightLossData.kg > 0 ? (
              <>
                <strong>Parabéns!</strong> Você já perdeu <strong>{weightLossData.kg} kg</strong> ({weightLossData.percentual}% do peso inicial).
                {avgWeightLossPerWeek > 0.5 && avgWeightLossPerWeek <= 1 && (
                  <> Sua perda de peso está dentro da média saudável de 0.5-1kg por semana.</>
                )}
                {avgWeightLossPerWeek > 1 && (
                  <> Você está perdendo peso rapidamente. Consulte seu médico regularmente.</>
                )}
              </>
            ) : weightLossData.kg < 0 ? (
              <>Você ganhou <strong>{Math.abs(weightLossData.kg)} kg</strong>. Não desanime, o processo é gradual.</>
            ) : (
              <>Continue registrando seus dados para acompanhar sua evolução!</>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StatsCard

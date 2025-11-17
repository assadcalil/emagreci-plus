import { useMemo } from 'react'
import './TransformationAvatar.css'

function TransformationAvatar({ initialWeight, currentWeight, targetWeight, height }) {
  // Calcular o progresso da transformação
  const progress = useMemo(() => {
    if (!initialWeight || !currentWeight) return 0
    const totalToLose = initialWeight - (targetWeight || initialWeight * 0.85)
    const lost = initialWeight - currentWeight
    return Math.min(100, Math.max(0, (lost / totalToLose) * 100))
  }, [initialWeight, currentWeight, targetWeight])

  // Calcular IMC para determinar a forma do avatar
  const bmi = useMemo(() => {
    if (!currentWeight || !height) return 25
    const h = height / 100
    return currentWeight / (h * h)
  }, [currentWeight, height])

  // Determinar a fase do avatar baseado no IMC
  const avatarPhase = useMemo(() => {
    if (bmi >= 40) return 'phase-1'
    if (bmi >= 35) return 'phase-2'
    if (bmi >= 30) return 'phase-3'
    if (bmi >= 25) return 'phase-4'
    return 'phase-5'
  }, [bmi])

  // Calcular cor baseada no progresso
  const progressColor = useMemo(() => {
    if (progress < 25) return '#e74c3c'
    if (progress < 50) return '#f39c12'
    if (progress < 75) return '#3498db'
    return '#2ecc71'
  }, [progress])

  // Frases motivacionais baseadas no progresso
  const motivationalMessage = useMemo(() => {
    if (progress === 0) return 'Sua jornada começa agora!'
    if (progress < 25) return 'Você está no caminho certo!'
    if (progress < 50) return 'Continue assim, está indo bem!'
    if (progress < 75) return 'Incrível progresso! Não pare!'
    if (progress < 100) return 'Quase lá! Você é incrível!'
    return 'META ALCANÇADA! 🎉'
  }, [progress])

  const weightLost = initialWeight - currentWeight
  const percentageLost = ((weightLost / initialWeight) * 100).toFixed(1)

  return (
    <div className="avatar-container">
      <div className="avatar-header">
        <h3>🪞 Seu Avatar de Transformação</h3>
        <p className="avatar-subtitle">Veja sua evolução em tempo real</p>
      </div>

      <div className="avatar-display">
        {/* Avatar Visual */}
        <div className={`avatar-body ${avatarPhase}`}>
          <div className="avatar-head">
            <div className="avatar-face">
              <div className="avatar-eyes">
                <span className="eye">👁️</span>
                <span className="eye">👁️</span>
              </div>
              <div className="avatar-smile">
                {progress >= 50 ? '😊' : '🙂'}
              </div>
            </div>
          </div>
          <div className="avatar-torso">
            <div className="torso-inner"></div>
          </div>
          <div className="avatar-arms">
            <div className="arm left"></div>
            <div className="arm right"></div>
          </div>
          <div className="avatar-legs">
            <div className="leg left"></div>
            <div className="leg right"></div>
          </div>

          {/* Efeito de brilho */}
          {progress > 0 && (
            <div className="transformation-glow" style={{ opacity: progress / 100 }}></div>
          )}

          {/* Partículas de conquista */}
          {progress >= 75 && (
            <div className="achievement-particles">
              <span>✨</span>
              <span>⭐</span>
              <span>✨</span>
            </div>
          )}
        </div>

        {/* Barra de Progresso Circular */}
        <div className="progress-ring">
          <svg viewBox="0 0 100 100">
            <circle
              className="progress-ring-bg"
              cx="50"
              cy="50"
              r="45"
            />
            <circle
              className="progress-ring-fill"
              cx="50"
              cy="50"
              r="45"
              style={{
                strokeDashoffset: 283 - (283 * progress) / 100,
                stroke: progressColor
              }}
            />
          </svg>
          <div className="progress-text">
            <span className="progress-value">{Math.round(progress)}%</span>
            <span className="progress-label">do objetivo</span>
          </div>
        </div>
      </div>

      {/* Estatísticas do Avatar */}
      <div className="avatar-stats">
        <div className="stat-item">
          <span className="stat-icon">📉</span>
          <div>
            <strong>{weightLost > 0 ? `-${weightLost.toFixed(1)}` : '0'} kg</strong>
            <small>Peso perdido</small>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">📊</span>
          <div>
            <strong>{percentageLost > 0 ? `-${percentageLost}` : '0'}%</strong>
            <small>Redução</small>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🎯</span>
          <div>
            <strong>{bmi.toFixed(1)}</strong>
            <small>IMC Atual</small>
          </div>
        </div>
      </div>

      {/* Mensagem Motivacional */}
      <div className="motivational-banner" style={{ background: progressColor }}>
        <span className="motivation-icon">💪</span>
        <p>{motivationalMessage}</p>
      </div>

      {/* Timeline de Conquistas */}
      <div className="avatar-milestones">
        <div className={`milestone ${weightLost >= 2 ? 'achieved' : ''}`}>
          <span>🥉</span>
          <small>-2kg</small>
        </div>
        <div className={`milestone ${weightLost >= 5 ? 'achieved' : ''}`}>
          <span>🥈</span>
          <small>-5kg</small>
        </div>
        <div className={`milestone ${weightLost >= 10 ? 'achieved' : ''}`}>
          <span>🥇</span>
          <small>-10kg</small>
        </div>
        <div className={`milestone ${weightLost >= 20 ? 'achieved' : ''}`}>
          <span>🏆</span>
          <small>-20kg</small>
        </div>
        <div className={`milestone ${progress >= 100 ? 'achieved' : ''}`}>
          <span>👑</span>
          <small>Meta</small>
        </div>
      </div>
    </div>
  )
}

export default TransformationAvatar

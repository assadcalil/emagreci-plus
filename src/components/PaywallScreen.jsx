import { useState } from 'react'
import { PLANS } from '../hooks/useSubscription'
import './PaywallScreen.css'

function PaywallScreen({ onSelectPlan, onStartTrial, trialUsed }) {
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubscribe = async () => {
    setIsProcessing(true)
    // Simular processamento de pagamento
    await new Promise(resolve => setTimeout(resolve, 1500))
    onSelectPlan(selectedPlan)
    setIsProcessing(false)
  }

  const handleTrial = async () => {
    if (trialUsed) return
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    onStartTrial()
    setIsProcessing(false)
  }

  return (
    <div className="paywall-screen">
      <div className="paywall-container">
        {/* Header */}
        <div className="paywall-header">
          <div className="paywall-logo">💎</div>
          <h1>Desbloqueie Todo o Potencial</h1>
          <p>Escolha o plano ideal para sua jornada de transformação</p>
        </div>

        {/* Planos */}
        <div className="plans-container">
          {Object.values(PLANS).map(plan => (
            <div
              key={plan.id}
              className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="popular-badge">MAIS POPULAR</div>
              )}

              <div className="plan-header" style={{ background: plan.color }}>
                <span className="plan-icon">{plan.icon}</span>
                <h3>{plan.name}</h3>
              </div>

              <div className="plan-price">
                <span className="currency">R$</span>
                <span className="amount">{plan.price.toFixed(2).replace('.', ',')}</span>
                <span className="period">/{plan.period}</span>
              </div>

              <ul className="plan-features">
                {plan.highlights.map((feature, i) => (
                  <li key={i}>
                    <span className="check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="plan-selector">
                <div className={`radio-btn ${selectedPlan === plan.id ? 'checked' : ''}`}>
                  {selectedPlan === plan.id && <span className="radio-inner"></span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="paywall-actions">
          <button
            className="btn-subscribe"
            onClick={handleSubscribe}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                Assinar {PLANS[selectedPlan].name} - R$ {PLANS[selectedPlan].price.toFixed(2).replace('.', ',')}
              </>
            )}
          </button>

          {!trialUsed && (
            <button
              className="btn-trial"
              onClick={handleTrial}
              disabled={isProcessing}
            >
              Experimentar 7 dias grátis
            </button>
          )}

          <p className="terms">
            Ao assinar, você concorda com nossos <a href="#">Termos de Uso</a> e <a href="#">Política de Privacidade</a>
          </p>
        </div>

        {/* Garantia */}
        <div className="guarantee-badge">
          <span className="guarantee-icon">🛡️</span>
          <div>
            <strong>Garantia de 7 dias</strong>
            <p>Não gostou? Devolvemos seu dinheiro</p>
          </div>
        </div>

        {/* Benefícios */}
        <div className="benefits-section">
          <h4>Por que assinar o Emagreci+?</h4>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span>📊</span>
              <p>Acompanhe seu progresso com dados precisos</p>
            </div>
            <div className="benefit-item">
              <span>🎯</span>
              <p>Alcance suas metas mais rápido</p>
            </div>
            <div className="benefit-item">
              <span>🔒</span>
              <p>Seus dados protegidos e seguros</p>
            </div>
            <div className="benefit-item">
              <span>📱</span>
              <p>Acesso em qualquer dispositivo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaywallScreen

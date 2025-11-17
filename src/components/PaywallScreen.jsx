import { useState } from 'react'
import { PLANS } from '../hooks/useSubscription'
import { useStripe } from '../hooks/useStripe'
import './PaywallScreen.css'

function PaywallScreen({ onSelectPlan, onStartTrial, trialUsed, onClose, userEmail }) {
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [billingPeriod, setBillingPeriod] = useState('monthly')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showStripeInfo, setShowStripeInfo] = useState(false)

  const { createCheckoutSession, isLoading: stripeLoading, error: stripeError } = useStripe()

  const handleSubscribe = async () => {
    setIsProcessing(true)

    try {
      // Criar sessão de checkout no Stripe
      const result = await createCheckoutSession(selectedPlan, billingPeriod, userEmail)

      if (result.success) {
        // Em produção, o usuário seria redirecionado para o Stripe
        console.log('Checkout configurado:', result)

        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Chamar callback com dados do Stripe
        onSelectPlan(selectedPlan, {
          subscriptionId: `sub_${Date.now()}`,
          customerId: `cus_${Date.now()}`,
          billingPeriod
        })

        setShowStripeInfo(true)
      } else {
        console.error('Erro no checkout:', result.error)
      }
    } catch (err) {
      console.error('Erro ao processar assinatura:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTrial = async () => {
    if (trialUsed) return
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    onStartTrial()
    setIsProcessing(false)
  }

  const getPlanPrice = (plan) => {
    if (billingPeriod === 'yearly') {
      const yearlyPrice = plan.yearlyPrice
      const monthlyEquivalent = (yearlyPrice / 12).toFixed(2)
      return {
        display: monthlyEquivalent.replace('.', ','),
        total: yearlyPrice.toFixed(2).replace('.', ','),
        period: 'mês',
        note: `R$ ${yearlyPrice.toFixed(2).replace('.', ',')} cobrado anualmente`
      }
    }
    return {
      display: plan.price.toFixed(2).replace('.', ','),
      total: plan.price.toFixed(2).replace('.', ','),
      period: plan.period,
      note: null
    }
  }

  return (
    <div className="paywall-screen">
      <div className="paywall-container">
        {/* Botão Fechar */}
        {onClose && (
          <button className="paywall-close" onClick={onClose}>
            ✕
          </button>
        )}

        {/* Header */}
        <div className="paywall-header">
          <div className="paywall-logo">💎</div>
          <h1>Desbloqueie Todo o Potencial</h1>
          <p>Escolha o plano ideal para sua jornada de transformação</p>
        </div>

        {/* Toggle Mensal/Anual */}
        <div className="billing-toggle">
          <button
            className={`toggle-btn ${billingPeriod === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Mensal
          </button>
          <button
            className={`toggle-btn ${billingPeriod === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('yearly')}
          >
            Anual
            <span className="discount-badge">-17%</span>
          </button>
        </div>

        {/* Planos */}
        <div className="plans-container">
          {Object.values(PLANS).map(plan => {
            const priceInfo = getPlanPrice(plan)
            return (
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
                  <span className="amount">{priceInfo.display}</span>
                  <span className="period">/{priceInfo.period}</span>
                  {priceInfo.note && (
                    <div className="billing-note">{priceInfo.note}</div>
                  )}
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
            )
          })}
        </div>

        {/* Informação do Stripe */}
        {stripeError && (
          <div className="stripe-error">
            <span>⚠️</span> {stripeError}
          </div>
        )}

        {/* Ações */}
        <div className="paywall-actions">
          <button
            className="btn-subscribe"
            onClick={handleSubscribe}
            disabled={isProcessing || stripeLoading}
          >
            {isProcessing || stripeLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                Assinar {PLANS[selectedPlan].name} - R$ {getPlanPrice(PLANS[selectedPlan]).display}/mês
              </>
            )}
          </button>

          {!trialUsed && (
            <button
              className="btn-trial"
              onClick={handleTrial}
              disabled={isProcessing}
            >
              Experimentar 3 dias grátis (Plano Básico)
            </button>
          )}

          <div className="payment-methods">
            <span>Pagamento seguro via</span>
            <div className="payment-icons">
              <span className="stripe-badge">Stripe</span>
              <span>💳</span>
              <span>📱</span>
            </div>
          </div>

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

        {/* Stripe Info Modal */}
        {showStripeInfo && (
          <div className="stripe-info-modal">
            <div className="stripe-info-content">
              <h3>✅ Integração Stripe Configurada</h3>
              <p>Para ativar pagamentos reais, configure as variáveis de ambiente:</p>
              <pre>
{`VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
VITE_STRIPE_BASIC_MONTHLY=price_xxx
VITE_STRIPE_PRO_MONTHLY=price_xxx
VITE_STRIPE_PREMIUM_MONTHLY=price_xxx`}
              </pre>
              <p>Acesse o <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">Dashboard do Stripe</a> para criar os produtos e preços.</p>
              <button onClick={() => setShowStripeInfo(false)}>Entendi</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaywallScreen

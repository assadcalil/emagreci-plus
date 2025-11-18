import { useState } from 'react'
import { PLANS } from '../hooks/useSubscription'
import './PlanDropdown.css'

function PlanDropdown({ subscription, onUpgrade, onSupport, onManage }) {
  const [isOpen, setIsOpen] = useState(false)

  // Obter plano atual ou usar básico como padrão
  const currentPlan = subscription?.planId ? PLANS[subscription.planId] : PLANS.basic

  // Calcular dias restantes
  const getDaysRemaining = () => {
    if (!subscription?.expiresAt) return null
    const now = new Date()
    const expires = new Date(subscription.expiresAt)
    const diff = expires - now
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  const daysRemaining = getDaysRemaining()
  const isTrial = subscription?.status === 'trial'
  const isActive = subscription?.status === 'active'

  // Obter próximo plano para upgrade
  const getNextPlan = () => {
    if (currentPlan.id === 'basic') return PLANS.pro
    if (currentPlan.id === 'pro') return PLANS.premium
    return null
  }

  const nextPlan = getNextPlan()

  return (
    <div className="plan-dropdown-container">
      <button
        className="plan-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Ver detalhes do plano"
      >
        <span className="plan-icon">{currentPlan.icon}</span>
        <span className="plan-name">{currentPlan.name}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="plan-dropdown-content">
          <div className="plan-header">
            <h3>
              {currentPlan.icon} Plano {currentPlan.name}
            </h3>
            {isTrial && (
              <span className="plan-badge trial">Período de Teste</span>
            )}
            {isActive && (
              <span className="plan-badge active">Ativo</span>
            )}
          </div>

          <div className="plan-info">
            <div className="plan-price">
              <span className="price-label">Valor:</span>
              <span className="price-value">
                R$ {currentPlan.price.toFixed(2)}/{currentPlan.period}
              </span>
            </div>

            {daysRemaining !== null && (
              <div className="plan-expiry">
                <span className="expiry-icon">📅</span>
                <span className="expiry-text">
                  {daysRemaining > 0
                    ? `${daysRemaining} dias restantes`
                    : 'Expirado'}
                </span>
              </div>
            )}

            {subscription?.billingPeriod && (
              <div className="plan-billing">
                <span className="billing-icon">💳</span>
                <span className="billing-text">
                  Cobrança {subscription.billingPeriod === 'monthly' ? 'Mensal' : 'Anual'}
                </span>
              </div>
            )}
          </div>

          <div className="plan-features-summary">
            <h4>Recursos inclusos:</h4>
            <ul>
              {currentPlan.highlights.slice(0, 5).map((highlight, idx) => (
                <li key={idx}>
                  <span className="check-icon">✓</span> {highlight}
                </li>
              ))}
            </ul>
          </div>

          <div className="plan-actions">
            {nextPlan && (
              <button
                className="plan-action-btn upgrade-btn"
                onClick={() => {
                  setIsOpen(false)
                  onUpgrade && onUpgrade(nextPlan)
                }}
              >
                <span>⬆️</span>
                <span>Upgrade para {nextPlan.name}</span>
              </button>
            )}

            <button
              className="plan-action-btn support-btn"
              onClick={() => {
                setIsOpen(false)
                onSupport && onSupport()
              }}
            >
              <span>💬</span>
              <span>
                Suporte {
                  currentPlan.features.support === 'priority' ? 'Prioritário' :
                  currentPlan.features.support === 'chat' ? 'Chat' : 'Email'
                }
              </span>
            </button>

            {isActive && (
              <button
                className="plan-action-btn manage-btn"
                onClick={() => {
                  setIsOpen(false)
                  onManage && onManage()
                }}
              >
                <span>⚙️</span>
                <span>Gerenciar Assinatura</span>
              </button>
            )}
          </div>

          <div className="plan-footer">
            <small>
              {isTrial && 'Aproveite o período de teste gratuito!'}
              {isActive && !isTrial && 'Obrigado por ser nosso assinante!'}
              {!isActive && !isTrial && 'Assine agora e tenha acesso completo'}
            </small>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlanDropdown

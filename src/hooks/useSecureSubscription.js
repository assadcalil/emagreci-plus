import { useState, useEffect, useCallback } from 'react'
import { STRIPE_PRICES } from '../config/stripe'
import {
  secureStore,
  secureRetrieve,
  getStorageKey,
  validateWithStripe,
  checkRateLimit,
  isSecurityBlocked
} from '../utils/subscriptionSecurity'

// Definição dos planos
export const PLANS = {
  basic: {
    id: 'basic',
    name: 'Básico',
    price: 19.90,
    yearlyPrice: 199.00,
    period: 'mês',
    color: '#95a5a6',
    icon: '🌱',
    stripePriceId: STRIPE_PRICES.basic,
    features: {
      doses: true,
      weights: true,
      basicChart: true,
      reminders: true,
      maxGoals: 1,
      sideEffects: false,
      measurements: false,
      photos: false,
      nutrition: false,
      injectionMap: false,
      export: false,
      stats: false,
      avatar: false,
      history: false,
      achievements: false,
      community: false,
      support: 'email'
    },
    highlights: [
      'Registro de doses ilimitado',
      'Registro de peso ilimitado',
      'Gráfico de evolução básico',
      'Lembretes de dose',
      '1 meta ativa'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Profissional',
    price: 39.90,
    yearlyPrice: 399.00,
    period: 'mês',
    color: '#3498db',
    icon: '⭐',
    popular: true,
    stripePriceId: STRIPE_PRICES.pro,
    features: {
      doses: true,
      weights: true,
      basicChart: true,
      reminders: true,
      maxGoals: 10,
      sideEffects: true,
      measurements: true,
      photos: 10, // por mês
      nutrition: true,
      injectionMap: true,
      export: false,
      stats: true,
      avatar: true,
      history: true,
      achievements: true,
      community: false,
      support: 'chat'
    },
    highlights: [
      'Tudo do Básico +',
      'Efeitos colaterais',
      'Medidas corporais',
      'Fotos de progresso (10/mês)',
      'Rastreamento nutricional',
      'Mapa de rotação de injeção',
      'Avatar de Transformação',
      'Estatísticas avançadas',
      'Metas ilimitadas',
      'Histórico com filtros'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 69.90,
    yearlyPrice: 699.00,
    period: 'mês',
    color: '#f39c12',
    icon: '👑',
    stripePriceId: STRIPE_PRICES.premium,
    features: {
      doses: true,
      weights: true,
      basicChart: true,
      reminders: true,
      maxGoals: Infinity,
      sideEffects: true,
      measurements: true,
      photos: Infinity,
      nutrition: true,
      injectionMap: true,
      export: true,
      stats: true,
      avatar: true,
      history: true,
      achievements: true,
      community: true,
      support: 'priority'
    },
    highlights: [
      'Tudo do Profissional +',
      'Fotos ilimitadas',
      'Exportação de relatórios',
      'Comunidade exclusiva',
      'Suporte prioritário 24/7',
      'Insights com IA',
      'Comparação de fotos lado a lado',
      'Conquistas especiais',
      'Backup na nuvem'
    ]
  }
}

const DEFAULT_SUBSCRIPTION = {
  planId: null,
  startDate: null,
  expiresAt: null,
  status: 'none', // none, active, expired, trial, cancelled
  stripeSubscriptionId: null,
  stripeCustomerId: null,
  billingPeriod: 'monthly'
}

export function useSecureSubscription() {
  const [subscription, setSubscriptionState] = useState(DEFAULT_SUBSCRIPTION)
  const [trialUsed, setTrialUsedState] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [securityError, setSecurityError] = useState(null)
  const [isBlocked, setIsBlocked] = useState(false)

  const STORAGE_KEY = getStorageKey()
  const TRIAL_KEY = '_emagreci_trial_v2'

  // Load subscription data securely on mount
  useEffect(() => {
    const loadSubscription = async () => {
      if (isSecurityBlocked()) {
        setIsBlocked(true)
        setSecurityError('Acesso bloqueado por violação de segurança. Tente novamente em 24 horas.')
        setIsLoading(false)
        return
      }

      try {
        const data = await secureRetrieve(STORAGE_KEY)
        if (data) {
          // Additional validation: verify with Stripe if we have Stripe IDs
          if (data.stripeSubscriptionId && data.stripeCustomerId) {
            const stripeValidation = await validateWithStripe(
              data.stripeSubscriptionId,
              data.stripeCustomerId
            )
            if (!stripeValidation.valid) {
              console.warn('Stripe validation failed:', stripeValidation.reason)
              setSecurityError('Falha na validação da assinatura com Stripe')
              setSubscriptionState(DEFAULT_SUBSCRIPTION)
              setIsLoading(false)
              return
            }
          }
          setSubscriptionState(data)
        }

        // Load trial status
        const trialData = localStorage.getItem(TRIAL_KEY)
        if (trialData) {
          try {
            const parsed = JSON.parse(trialData)
            if (parsed.used && parsed.timestamp) {
              // Verify trial timestamp is not manipulated
              if (parsed.timestamp <= Date.now() && parsed.timestamp > Date.now() - (365 * 24 * 60 * 60 * 1000)) {
                setTrialUsedState(true)
              }
            }
          } catch (e) {
            // Invalid trial data
          }
        }
      } catch (err) {
        console.error('Security error loading subscription:', err)
        setSecurityError(err.message)
        setSubscriptionState(DEFAULT_SUBSCRIPTION)
      } finally {
        setIsLoading(false)
      }
    }

    loadSubscription()
  }, [STORAGE_KEY])

  // Save subscription securely
  const setSubscription = useCallback(async (newData) => {
    try {
      await secureStore(STORAGE_KEY, newData)
      setSubscriptionState(newData)
      setSecurityError(null)
    } catch (err) {
      console.error('Error saving subscription:', err)
      setSecurityError('Erro ao salvar assinatura')
    }
  }, [STORAGE_KEY])

  // Subscribe with security checks
  const subscribe = useCallback(async (planId, stripeData = {}) => {
    // Check rate limit
    const rateCheck = checkRateLimit('subscribe')
    if (!rateCheck.allowed) {
      setSecurityError(rateCheck.reason)
      return false
    }

    // Validate Stripe data
    if (stripeData.subscriptionId && stripeData.customerId) {
      const validation = await validateWithStripe(
        stripeData.subscriptionId,
        stripeData.customerId
      )
      if (!validation.valid) {
        setSecurityError('Dados de assinatura Stripe inválidos')
        return false
      }
    }

    const now = new Date()
    let expiresAt

    if (stripeData.billingPeriod === 'yearly') {
      expiresAt = new Date(now.setFullYear(now.getFullYear() + 1))
    } else {
      expiresAt = new Date(now.setMonth(now.getMonth() + 1))
    }

    const newSubscription = {
      planId,
      startDate: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      stripeSubscriptionId: stripeData.subscriptionId || null,
      stripeCustomerId: stripeData.customerId || null,
      billingPeriod: stripeData.billingPeriod || 'monthly'
    }

    await setSubscription(newSubscription)
    return true
  }, [setSubscription])

  // Update from Stripe webhook data
  const updateFromStripe = useCallback(async (stripeData) => {
    const validation = await validateWithStripe(
      stripeData.subscriptionId,
      stripeData.customerId
    )
    if (!validation.valid) {
      setSecurityError('Dados Stripe inválidos')
      return false
    }

    const newData = {
      ...subscription,
      stripeSubscriptionId: stripeData.subscriptionId,
      stripeCustomerId: stripeData.customerId,
      status: stripeData.status || subscription.status,
      expiresAt: stripeData.currentPeriodEnd || subscription.expiresAt
    }

    await setSubscription(newData)
    return true
  }, [subscription, setSubscription])

  // Start trial with security
  const startTrial = useCallback(async () => {
    if (trialUsed) {
      setSecurityError('Período de teste já utilizado')
      return false
    }

    const rateCheck = checkRateLimit('trial')
    if (!rateCheck.allowed) {
      setSecurityError(rateCheck.reason)
      return false
    }

    const now = new Date()
    const expiresAt = new Date(now.setDate(now.getDate() + 3)) // 3 dias trial

    const trialSubscription = {
      planId: 'basic',
      startDate: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'trial',
      stripeSubscriptionId: null,
      stripeCustomerId: null,
      billingPeriod: 'monthly'
    }

    await setSubscription(trialSubscription)

    // Mark trial as used with timestamp
    const trialData = {
      used: true,
      timestamp: Date.now()
    }
    localStorage.setItem(TRIAL_KEY, JSON.stringify(trialData))
    setTrialUsedState(true)

    return true
  }, [trialUsed, setSubscription])

  // Cancel subscription
  const cancelSubscription = useCallback(async () => {
    const rateCheck = checkRateLimit('cancel')
    if (!rateCheck.allowed) {
      setSecurityError(rateCheck.reason)
      return false
    }

    const newData = {
      ...subscription,
      status: 'cancelled'
    }

    await setSubscription(newData)
    return true
  }, [subscription, setSubscription])

  // Check feature access with validation
  const checkAccess = useCallback((feature) => {
    if (isBlocked || securityError) {
      return false
    }

    if (!subscription.planId || subscription.status === 'none') {
      return false
    }

    // Verificar se expirou
    if (new Date(subscription.expiresAt) < new Date()) {
      return false
    }

    // Verificar se está cancelado
    if (subscription.status === 'cancelled') {
      return false
    }

    const plan = PLANS[subscription.planId]
    if (!plan) return false

    return plan.features[feature]
  }, [subscription, isBlocked, securityError])

  const getCurrentPlan = useCallback(() => {
    if (!subscription.planId) return null
    return PLANS[subscription.planId]
  }, [subscription.planId])

  const getDaysRemaining = useCallback(() => {
    if (!subscription.expiresAt) return 0
    const diff = new Date(subscription.expiresAt) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }, [subscription.expiresAt])

  const isSubscribed = useCallback(() => {
    if (isBlocked || securityError) return false
    if (subscription.status === 'cancelled') return false
    if (new Date(subscription.expiresAt) < new Date()) return false
    return subscription.status === 'active' || subscription.status === 'trial'
  }, [subscription, isBlocked, securityError])

  const getSubscriptionInfo = useCallback(() => {
    return {
      ...subscription,
      plan: getCurrentPlan(),
      daysRemaining: getDaysRemaining(),
      isActive: isSubscribed(),
      securityError,
      isBlocked
    }
  }, [subscription, getCurrentPlan, getDaysRemaining, isSubscribed, securityError, isBlocked])

  // Clear subscription data (for logout)
  const clearSubscription = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(STORAGE_KEY + '_v')
    setSubscriptionState(DEFAULT_SUBSCRIPTION)
  }, [STORAGE_KEY])

  return {
    subscription,
    subscribe,
    updateFromStripe,
    startTrial,
    cancelSubscription,
    checkAccess,
    getCurrentPlan,
    getDaysRemaining,
    isSubscribed,
    getSubscriptionInfo,
    clearSubscription,
    trialUsed,
    isLoading,
    securityError,
    isBlocked,
    PLANS
  }
}

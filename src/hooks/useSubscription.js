import { useLocalStorage } from './useLocalStorage'

// Definição dos planos
export const PLANS = {
  basic: {
    id: 'basic',
    name: 'Básico',
    price: 19.90,
    originalPrice: 29.90,
    period: 'mês',
    color: '#95a5a6',
    icon: '🌱',
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
    originalPrice: 59.90,
    period: 'mês',
    color: '#3498db',
    icon: '⭐',
    popular: true,
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
    originalPrice: 99.90,
    period: 'mês',
    color: '#f39c12',
    icon: '👑',
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

export function useSubscription() {
  const [subscription, setSubscription] = useLocalStorage('subscription', {
    planId: null,
    startDate: null,
    expiresAt: null,
    status: 'none' // none, active, expired, trial
  })

  const [trialUsed, setTrialUsed] = useLocalStorage('trialUsed', false)

  const subscribe = (planId) => {
    const now = new Date()
    const expiresAt = new Date(now.setMonth(now.getMonth() + 1))

    setSubscription({
      planId,
      startDate: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active'
    })
  }

  const startTrial = () => {
    if (trialUsed) return false

    const now = new Date()
    const expiresAt = new Date(now.setDate(now.getDate() + 3)) // 3 dias trial

    setSubscription({
      planId: 'basic', // Trial no plano básico
      startDate: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'trial'
    })
    setTrialUsed(true)
    return true
  }

  const cancelSubscription = () => {
    setSubscription({
      ...subscription,
      status: 'cancelled'
    })
  }

  const checkAccess = (feature) => {
    if (!subscription.planId || subscription.status === 'none') {
      return false
    }

    // Verificar se expirou
    if (new Date(subscription.expiresAt) < new Date()) {
      return false
    }

    const plan = PLANS[subscription.planId]
    if (!plan) return false

    return plan.features[feature]
  }

  const getCurrentPlan = () => {
    if (!subscription.planId) return null
    return PLANS[subscription.planId]
  }

  const getDaysRemaining = () => {
    if (!subscription.expiresAt) return 0
    const diff = new Date(subscription.expiresAt) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const isSubscribed = () => {
    return subscription.status === 'active' || subscription.status === 'trial'
  }

  return {
    subscription,
    subscribe,
    startTrial,
    cancelSubscription,
    checkAccess,
    getCurrentPlan,
    getDaysRemaining,
    isSubscribed,
    trialUsed,
    PLANS
  }
}

import { useState, useCallback } from 'react'
import { getStripe, STRIPE_PRICES, CHECKOUT_CONFIG } from '../config/stripe'
import { useLocalStorage } from './useLocalStorage'

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stripeCustomerId, setStripeCustomerId] = useLocalStorage('stripeCustomerId', null)
  const [stripeSubscriptionId, setStripeSubscriptionId] = useLocalStorage('stripeSubscriptionId', null)

  // Criar sessão de checkout no Stripe
  const createCheckoutSession = useCallback(async (planId, billingPeriod = 'monthly', customerEmail = null) => {
    setIsLoading(true)
    setError(null)

    try {
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe não foi inicializado corretamente')
      }

      const priceId = STRIPE_PRICES[planId]?.[billingPeriod]
      if (!priceId) {
        throw new Error(`Plano ${planId} com período ${billingPeriod} não encontrado`)
      }

      // Em produção, você criaria a sessão no backend
      // Por enquanto, vamos simular com Stripe Checkout direto

      // Simular criação de sessão (em produção, isso viria do backend)
      const sessionConfig = {
        lineItems: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: CHECKOUT_CONFIG.mode,
        successUrl: CHECKOUT_CONFIG.successUrl,
        cancelUrl: CHECKOUT_CONFIG.cancelUrl,
        allowPromotionCodes: CHECKOUT_CONFIG.allowPromotionCodes,
        billingAddressCollection: CHECKOUT_CONFIG.billingAddressCollection,
      }

      if (customerEmail) {
        sessionConfig.customerEmail = customerEmail
      }

      if (stripeCustomerId) {
        sessionConfig.customer = stripeCustomerId
      }

      // Em produção real, você faria:
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ priceId, customerEmail, customerId: stripeCustomerId })
      // })
      // const { sessionId } = await response.json()
      // const { error } = await stripe.redirectToCheckout({ sessionId })

      // Para teste/desenvolvimento, podemos usar redirect direto
      // Nota: Em produção real, SEMPRE crie sessões no backend por segurança

      console.log('Configuração de checkout:', sessionConfig)

      // Simular redirecionamento para checkout
      // Em produção, descomente o código abaixo:
      /*
      const { error: stripeError } = await stripe.redirectToCheckout(sessionConfig)

      if (stripeError) {
        throw stripeError
      }
      */

      // Para demo, retornamos informações da sessão
      return {
        success: true,
        planId,
        billingPeriod,
        priceId,
        message: 'Sessão de checkout configurada. Em produção, você seria redirecionado para o Stripe.'
      }

    } catch (err) {
      setError(err.message)
      console.error('Erro ao criar sessão de checkout:', err)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [stripeCustomerId])

  // Verificar status da assinatura
  const checkSubscriptionStatus = useCallback(async () => {
    if (!stripeSubscriptionId) {
      return { active: false, status: 'none' }
    }

    try {
      // Em produção, verificaria no backend
      // const response = await fetch(`/api/subscription/${stripeSubscriptionId}`)
      // const subscription = await response.json()
      // return subscription

      // Para demo, retorna status simulado
      return {
        active: true,
        status: 'active',
        subscriptionId: stripeSubscriptionId
      }
    } catch (err) {
      console.error('Erro ao verificar assinatura:', err)
      return { active: false, status: 'error', error: err.message }
    }
  }, [stripeSubscriptionId])

  // Cancelar assinatura
  const cancelSubscription = useCallback(async () => {
    if (!stripeSubscriptionId) {
      return { success: false, error: 'Nenhuma assinatura ativa' }
    }

    setIsLoading(true)
    try {
      // Em produção:
      // const response = await fetch(`/api/cancel-subscription`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ subscriptionId: stripeSubscriptionId })
      // })
      // const result = await response.json()

      // Para demo
      setStripeSubscriptionId(null)
      return { success: true, message: 'Assinatura cancelada com sucesso' }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [stripeSubscriptionId, setStripeSubscriptionId])

  // Abrir portal do cliente Stripe (para gerenciar assinatura)
  const openCustomerPortal = useCallback(async () => {
    if (!stripeCustomerId) {
      setError('Nenhum cliente Stripe associado')
      return
    }

    setIsLoading(true)
    try {
      // Em produção:
      // const response = await fetch('/api/create-portal-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ customerId: stripeCustomerId })
      // })
      // const { url } = await response.json()
      // window.location.href = url

      console.log('Abrindo portal do cliente Stripe...')
      // Para demo, apenas log
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [stripeCustomerId])

  // Processar webhook de sucesso (chamado após redirecionamento)
  const handleCheckoutSuccess = useCallback(async (sessionId) => {
    setIsLoading(true)
    try {
      // Em produção, verificaria a sessão no backend
      // const response = await fetch(`/api/checkout-success?session_id=${sessionId}`)
      // const { customerId, subscriptionId, planId } = await response.json()

      // Para demo, simular dados
      const mockData = {
        customerId: `cus_${Date.now()}`,
        subscriptionId: `sub_${Date.now()}`,
        planId: 'pro' // seria extraído da sessão real
      }

      setStripeCustomerId(mockData.customerId)
      setStripeSubscriptionId(mockData.subscriptionId)

      return {
        success: true,
        ...mockData
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [setStripeCustomerId, setStripeSubscriptionId])

  return {
    isLoading,
    error,
    stripeCustomerId,
    stripeSubscriptionId,
    createCheckoutSession,
    checkSubscriptionStatus,
    cancelSubscription,
    openCustomerPortal,
    handleCheckoutSuccess,
    setStripeCustomerId,
    setStripeSubscriptionId
  }
}

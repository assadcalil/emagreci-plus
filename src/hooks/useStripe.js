import { useState, useCallback } from 'react'
import { STRIPE_PRICES } from '../config/stripe'
import { useLocalStorage } from './useLocalStorage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4242'

export function useStripe() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stripeCustomerId, setStripeCustomerId] = useLocalStorage('stripeCustomerId', null)
  const [stripeSubscriptionId, setStripeSubscriptionId] = useLocalStorage('stripeSubscriptionId', null)

  // Criar sessão de checkout no Stripe
  const createCheckoutSession = useCallback(async (planId, billingPeriod = 'monthly', userId, userEmail) => {
    setIsLoading(true)
    setError(null)

    try {
      const priceId = STRIPE_PRICES[planId]?.[billingPeriod]
      if (!priceId) {
        throw new Error(`Plano ${planId} com período ${billingPeriod} não encontrado`)
      }

      if (!userId || !userEmail) {
        throw new Error('User ID e email são obrigatórios')
      }

      // Criar sessão de checkout no backend
      const response = await fetch(`${API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId,
          userEmail,
          planId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar sessão de checkout')
      }

      const { url } = await response.json()

      // Redirecionar para o Stripe Checkout
      window.location.href = url

      return {
        success: true,
        planId,
        billingPeriod,
        priceId
      }

    } catch (err) {
      setError(err.message)
      console.error('Erro ao criar sessão de checkout:', err)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

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
  const openCustomerPortal = useCallback(async (customerId) => {
    if (!customerId) {
      setError('Nenhum cliente Stripe associado')
      return { success: false, error: 'Nenhum cliente Stripe associado' }
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/create-portal-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar sessão do portal')
      }

      const { url } = await response.json()
      window.location.href = url

      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

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

import { loadStripe } from '@stripe/stripe-js'

// Stripe Public Key - Use sua chave publicável do Stripe
// Em produção, use variáveis de ambiente
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_YOUR_KEY_HERE'

// Inicializa o Stripe
let stripePromise = null

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY)
  }
  return stripePromise
}

// IDs dos produtos/preços no Stripe
// Substitua pelos IDs reais criados no Dashboard do Stripe
export const STRIPE_PRICES = {
  basic: {
    monthly: import.meta.env.VITE_STRIPE_BASIC_MONTHLY || 'price_basic_monthly',
    yearly: import.meta.env.VITE_STRIPE_BASIC_YEARLY || 'price_basic_yearly'
  },
  pro: {
    monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY || 'price_pro_monthly',
    yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY || 'price_pro_yearly'
  },
  premium: {
    monthly: import.meta.env.VITE_STRIPE_PREMIUM_MONTHLY || 'price_premium_monthly',
    yearly: import.meta.env.VITE_STRIPE_PREMIUM_YEARLY || 'price_premium_yearly'
  }
}

// URL do backend para criar sessões de checkout
// Em desenvolvimento, use um servidor local ou simulação
export const STRIPE_API_URL = import.meta.env.VITE_STRIPE_API_URL || '/api/stripe'

// Configurações de checkout
export const CHECKOUT_CONFIG = {
  successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${window.location.origin}/pricing`,
  mode: 'subscription',
  allowPromotionCodes: true,
  billingAddressCollection: 'required',
  customerEmail: null, // Será preenchido se usuário estiver logado
}

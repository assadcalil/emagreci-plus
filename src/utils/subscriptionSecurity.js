/**
 * Subscription Security Module
 * Implements multiple layers of protection against subscription manipulation
 */

// Cryptographic key for integrity verification (in production, this would be server-side)
const INTEGRITY_SECRET = 'emagreci_plus_secure_2024_' + window.location.hostname

// Generate a secure hash for data integrity
const generateHash = async (data) => {
  const encoder = new TextEncoder()
  const dataString = JSON.stringify(data) + INTEGRITY_SECRET
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataString))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Create a signed subscription object
export const signSubscription = async (subscriptionData) => {
  const timestamp = Date.now()
  const payload = {
    ...subscriptionData,
    _timestamp: timestamp,
    _version: '2.0'
  }

  const signature = await generateHash(payload)

  return {
    payload,
    signature,
    _meta: {
      createdAt: timestamp,
      checksum: signature.slice(0, 16) // Partial checksum for quick validation
    }
  }
}

// Verify subscription data integrity
export const verifySubscription = async (signedData) => {
  if (!signedData || !signedData.payload || !signedData.signature) {
    return { valid: false, reason: 'Invalid data structure' }
  }

  // Verify signature
  const expectedSignature = await generateHash(signedData.payload)
  if (expectedSignature !== signedData.signature) {
    return { valid: false, reason: 'Signature mismatch - data has been tampered' }
  }

  // Verify checksum
  if (signedData._meta?.checksum !== signedData.signature.slice(0, 16)) {
    return { valid: false, reason: 'Checksum mismatch' }
  }

  // Verify timestamp is not in the future
  if (signedData.payload._timestamp > Date.now() + 60000) {
    return { valid: false, reason: 'Invalid timestamp' }
  }

  // Verify expiration date is reasonable (max 1 year from creation)
  const maxValidPeriod = 365 * 24 * 60 * 60 * 1000 // 1 year in ms
  const expiresAt = new Date(signedData.payload.expiresAt).getTime()
  const createdAt = signedData._meta.createdAt

  if (expiresAt - createdAt > maxValidPeriod) {
    return { valid: false, reason: 'Subscription period exceeds maximum allowed' }
  }

  return { valid: true, data: signedData.payload }
}

// Obfuscate storage key to make it harder to find
export const getStorageKey = () => {
  const base = 'emagreci_sub_data'
  const salt = window.location.hostname.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return `_${base}_${salt.toString(36)}`
}

// Validate subscription with Stripe (requires backend in production)
export const validateWithStripe = async (subscriptionId, customerId) => {
  if (!subscriptionId || !customerId) {
    return { valid: false, reason: 'Missing Stripe identifiers' }
  }

  // In production, this would call your backend which verifies with Stripe API
  // Example:
  // const response = await fetch('/api/verify-subscription', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${getAuthToken()}`
  //   },
  //   body: JSON.stringify({ subscriptionId, customerId })
  // })
  // return response.json()

  // For demo purposes, we verify the format and structure
  if (!subscriptionId.startsWith('sub_') || !customerId.startsWith('cus_')) {
    return { valid: false, reason: 'Invalid Stripe ID format' }
  }

  // Verify subscription ID timestamp is not manipulated
  const subTimestamp = subscriptionId.replace('sub_', '')
  const cusTimestamp = customerId.replace('cus_', '')

  // Check if timestamps are within reasonable range (not too old, not in future)
  const now = Date.now()
  const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000)

  if (parseInt(subTimestamp) > now || parseInt(subTimestamp) < oneYearAgo) {
    return { valid: false, reason: 'Subscription ID timestamp invalid' }
  }

  if (parseInt(cusTimestamp) > now || parseInt(cusTimestamp) < oneYearAgo) {
    return { valid: false, reason: 'Customer ID timestamp invalid' }
  }

  return { valid: true }
}

// Detect tampering attempts
let tamperAttempts = 0
const MAX_TAMPER_ATTEMPTS = 3

export const recordTamperAttempt = () => {
  tamperAttempts++
  console.warn(`Security: Tamper attempt detected (${tamperAttempts}/${MAX_TAMPER_ATTEMPTS})`)

  if (tamperAttempts >= MAX_TAMPER_ATTEMPTS) {
    // Clear all subscription data and block access
    localStorage.removeItem(getStorageKey())
    localStorage.setItem('_security_block', Date.now().toString())
    console.error('Security: Multiple tamper attempts detected. Subscription data cleared.')
    return true // Blocked
  }

  return false
}

// Check if user is blocked due to tampering
export const isSecurityBlocked = () => {
  const blockTime = localStorage.getItem('_security_block')
  if (!blockTime) return false

  // Block for 24 hours
  const blockDuration = 24 * 60 * 60 * 1000
  if (Date.now() - parseInt(blockTime) > blockDuration) {
    localStorage.removeItem('_security_block')
    return false
  }

  return true
}

// Generate device fingerprint for additional verification
export const getDeviceFingerprint = () => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('Emagreci+ Security', 2, 2)

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|')

  return btoa(fingerprint).slice(0, 32)
}

// Secure subscription storage with multiple layers
export const secureStore = async (key, data) => {
  const signedData = await signSubscription(data)
  const deviceFP = getDeviceFingerprint()

  const securePackage = {
    ...signedData,
    _device: deviceFP,
    _nonce: Math.random().toString(36).substring(7)
  }

  localStorage.setItem(key, JSON.stringify(securePackage))

  // Store verification hash separately
  const verificationHash = await generateHash(securePackage)
  localStorage.setItem(key + '_v', verificationHash.slice(0, 32))
}

// Secure subscription retrieval with verification
export const secureRetrieve = async (key) => {
  if (isSecurityBlocked()) {
    throw new Error('Access blocked due to security violation')
  }

  const stored = localStorage.getItem(key)
  const storedHash = localStorage.getItem(key + '_v')

  if (!stored) {
    return null
  }

  let securePackage
  try {
    securePackage = JSON.parse(stored)
  } catch (e) {
    recordTamperAttempt()
    throw new Error('Invalid data format')
  }

  // Verify the overall package hash
  const currentHash = await generateHash(securePackage)
  if (currentHash.slice(0, 32) !== storedHash) {
    recordTamperAttempt()
    throw new Error('Data integrity verification failed')
  }

  // Verify the subscription signature
  const verification = await verifySubscription(securePackage)
  if (!verification.valid) {
    recordTamperAttempt()
    throw new Error(`Subscription verification failed: ${verification.reason}`)
  }

  // Verify device fingerprint (optional - can be too strict)
  // const currentFP = getDeviceFingerprint()
  // if (securePackage._device !== currentFP) {
  //   console.warn('Device fingerprint mismatch - different device detected')
  // }

  return verification.data
}

// Rate limiting for subscription actions
const actionTimestamps = {}
const RATE_LIMITS = {
  subscribe: { count: 3, window: 3600000 }, // 3 per hour
  trial: { count: 1, window: 86400000 * 30 }, // 1 per 30 days
  cancel: { count: 2, window: 86400000 } // 2 per day
}

export const checkRateLimit = (action) => {
  if (!RATE_LIMITS[action]) return { allowed: true }

  const now = Date.now()
  const limit = RATE_LIMITS[action]

  if (!actionTimestamps[action]) {
    actionTimestamps[action] = []
  }

  // Clean old timestamps
  actionTimestamps[action] = actionTimestamps[action].filter(
    ts => now - ts < limit.window
  )

  if (actionTimestamps[action].length >= limit.count) {
    return {
      allowed: false,
      reason: `Rate limit exceeded for ${action}. Please try again later.`
    }
  }

  actionTimestamps[action].push(now)
  return { allowed: true }
}

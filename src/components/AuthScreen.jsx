import React, { useState } from 'react'
import { validateEmail, validatePassword, validateName } from '../utils/validation'
import './AuthScreen.css'

const AuthScreen = ({ onAuth, loading, error }) => {
  const [mode, setMode] = useState('login') // login, signup, forgot
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nome, setNome] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (pwd) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++
    return Math.min(strength, 4)
  }

  const handlePasswordChange = (pwd) => {
    setPassword(pwd)
    setPasswordStrength(calculatePasswordStrength(pwd))
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setSuccessMessage('')

    // Validar email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setFormError(emailValidation.error)
      return
    }

    if (mode === 'forgot') {
      const result = await onAuth('forgot', { email: email.trim() })
      if (result.success) {
        setSuccessMessage('Email de recuperação enviado! Verifique sua caixa de entrada.')
        setMode('login')
      } else {
        setFormError(result.error || 'Erro ao enviar email de recuperação')
      }
      return
    }

    // Validar senha
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      setFormError(passwordValidation.error)
      return
    }

    if (mode === 'signup') {
      // Validar nome
      const nameValidation = validateName(nome)
      if (!nameValidation.valid) {
        setFormError(nameValidation.error)
        return
      }

      if (password !== confirmPassword) {
        setFormError('As senhas não coincidem')
        return
      }
    }

    const result = await onAuth(mode, {
      email: email.trim(),
      password,
      nome: nome.trim()
    })

    if (!result.success) {
      if (result.error?.includes('Invalid login')) {
        setFormError('Email ou senha incorretos')
      } else if (result.error?.includes('already registered')) {
        setFormError('Este email já está cadastrado')
      } else {
        setFormError(result.error || 'Erro ao processar. Tente novamente.')
      }
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">💊</div>
          <h1>Emagreci+</h1>
          <p>
            {mode === 'login' && 'Entre na sua conta'}
            {mode === 'signup' && 'Crie sua conta gratuita'}
            {mode === 'forgot' && 'Recupere sua senha'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="nome">Nome Completo</label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder={mode === 'signup' ? 'Mínimo 8 caracteres com maiúsculas, minúsculas e números' : 'Digite sua senha'}
                required
                minLength={8}
              />
              {mode === 'signup' && password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className={`strength-fill strength-${passwordStrength}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    />
                  </div>
                  <span className="strength-label">
                    {passwordStrength === 0 && 'Muito fraca'}
                    {passwordStrength === 1 && 'Fraca'}
                    {passwordStrength === 2 && 'Razoável'}
                    {passwordStrength === 3 && 'Boa'}
                    {passwordStrength === 4 && 'Excelente'}
                  </span>
                </div>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Senha</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita sua senha"
                required
              />
            </div>
          )}

          {(formError || error) && (
            <div className="auth-error">
              {formError || error}
            </div>
          )}

          {successMessage && (
            <div className="auth-success">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                {mode === 'login' && 'Entrar'}
                {mode === 'signup' && 'Criar Conta'}
                {mode === 'forgot' && 'Enviar Email'}
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'login' && (
            <>
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  setMode('forgot')
                  setFormError('')
                }}
              >
                Esqueci minha senha
              </button>
              <p>
                Não tem conta?{' '}
                <button
                  type="button"
                  className="auth-link highlight"
                  onClick={() => {
                    setMode('signup')
                    setFormError('')
                  }}
                >
                  Cadastre-se grátis
                </button>
              </p>
            </>
          )}

          {mode === 'signup' && (
            <p>
              Já tem conta?{' '}
              <button
                type="button"
                className="auth-link highlight"
                onClick={() => {
                  setMode('login')
                  setFormError('')
                }}
              >
                Faça login
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <button
              type="button"
              className="auth-link"
              onClick={() => {
                setMode('login')
                setFormError('')
              }}
            >
              Voltar ao login
            </button>
          )}
        </div>

        <div className="auth-security">
          <div className="security-badge">
            <span>🔒</span>
            <span>Conexão segura</span>
          </div>
          <p>Seus dados estão protegidos com criptografia de ponta a ponta</p>
        </div>
      </div>
    </div>
  )
}

export default AuthScreen

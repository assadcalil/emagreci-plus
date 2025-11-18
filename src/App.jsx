import React, { useState, useEffect } from 'react'
import QuizQuestion from './components/QuizQuestion'
import DoseRegistration from './components/DoseRegistration'
import WeightRegistration from './components/WeightRegistration'
import WeightChart from './components/WeightChart'
import MeasurementRegistration from './components/MeasurementRegistration'
import SideEffectRegistration from './components/SideEffectRegistration'
import GoalsPanel from './components/GoalsPanel'
import StatsCard from './components/StatsCard'
import HistoryPanel from './components/HistoryPanel'
import ExportData from './components/ExportData'
import ReminderSettings from './components/ReminderSettings'
import PaywallScreen from './components/PaywallScreen'
import TransformationAvatar from './components/TransformationAvatar'
import NutritionTracker from './components/NutritionTracker'
import InjectionMap from './components/InjectionMap'
import ProgressPhotos from './components/ProgressPhotos'
import LandingPage from './components/LandingPage'
import AuthScreen from './components/AuthScreen'
import CommunityChat from './components/CommunityChat'
import PlanDropdown from './components/PlanDropdown'
import MeasurementAvatar from './components/MeasurementAvatar'
import { ToastContainer } from './components/Toast'
import { useToast } from './hooks/useToast'
import { useAuth } from './hooks/useAuth'
import {
  useSupabaseProfile,
  useSupabaseDoses,
  useSupabaseWeights,
  useSupabaseMeasurements,
  useSupabaseSideEffects,
  useSupabaseGoals,
  useSupabaseSubscription
} from './hooks/useSupabaseData'
import { useCommunityChat } from './hooks/useCommunityChat'
import { quizQuestions } from './data/quizData'
import { PLANS } from './hooks/useSubscription'
import './App.css'

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})

  // Modais
  const [showDoseModal, setShowDoseModal] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [showMeasurementModal, setShowMeasurementModal] = useState(false)
  const [editingMeasurement, setEditingMeasurement] = useState(null)
  const [showSideEffectModal, setShowSideEffectModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [showNutritionModal, setShowNutritionModal] = useState(false)
  const [showPhotosModal, setShowPhotosModal] = useState(false)

  // View state
  const [activeView, setActiveView] = useState('dashboard')

  // Authentication
  const {
    user,
    loading: authLoading,
    error: authError,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated
  } = useAuth()

  // Supabase Data Hooks (only active when user is authenticated)
  const { profile, updateProfile, loading: profileLoading } = useSupabaseProfile(user?.id)
  const { doses, addDose } = useSupabaseDoses(user?.id)
  const { weights, addWeight } = useSupabaseWeights(user?.id)
  const { measurements, addMeasurement, updateMeasurement, deleteMeasurement } = useSupabaseMeasurements(user?.id)
  const { sideEffects, addSideEffect } = useSupabaseSideEffects(user?.id)
  const { goals, addGoal, toggleGoal, deleteGoal } = useSupabaseGoals(user?.id)
  const {
    subscription,
    subscribe,
    startTrial,
    cancelSubscription,
    isSubscribed,
    getDaysRemaining
  } = useSupabaseSubscription(user?.id)

  // Community Chat
  const {
    messages: communityMessages,
    sendMessage: sendCommunityMessage,
    shareResult: shareCommunityResult,
    likeMessage: likeCommunityMessage,
    loading: communityLoading
  } = useCommunityChat(user?.id)

  // Toast notifications
  const toast = useToast()

  // Check if user has completed profile setup
  useEffect(() => {
    if (isAuthenticated && profile) {
      // User is logged in and has profile
      setShowLanding(false)
      setShowAuth(false)

      if (profile.nome && profile.tipo_caneta) {
        // Profile is complete
        setQuizCompleted(true)
        setAnswers({
          nome: profile.nome,
          idade: profile.idade,
          altura: profile.altura,
          pesoAtual: profile.peso_atual,
          tipoCaneta: profile.tipo_caneta,
          objetivo: profile.objetivo,
          experiencia: profile.experiencia
        })

        // Check subscription
        if (!isSubscribed()) {
          setShowPaywall(true)
        }
      } else {
        // Profile incomplete, show quiz
        setQuizCompleted(false)
      }
    }
  }, [isAuthenticated, profile, isSubscribed])

  // Handle authentication
  const handleAuth = async (mode, data) => {
    if (mode === 'login') {
      const result = await signIn(data.email, data.password)
      if (result.success) {
        toast.success('Bem-vindo de volta!')
        setShowAuth(false)
      }
      return result
    }

    if (mode === 'signup') {
      const result = await signUp(data.email, data.password, { nome: data.nome })
      if (result.success) {
        toast.success('Conta criada com sucesso!')
        setShowAuth(false)
      }
      return result
    }

    if (mode === 'forgot') {
      const result = await resetPassword(data.email)
      if (result.success) {
        toast.success('Email de recuperação enviado!')
      }
      return result
    }

    return { success: false, error: 'Modo inválido' }
  }

  // Handle logout
  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      const result = await signOut()
      if (result.success) {
        setShowLanding(true)
        setShowAuth(false)
        setQuizCompleted(false)
        setShowPaywall(false)
        setCurrentQuestion(0)
        setAnswers({})
        toast.info('Você saiu da sua conta')
      }
    }
  }

  // Check feature access based on subscription
  const checkAccess = (feature) => {
    if (!subscription || !isSubscribed()) return false

    const plan = PLANS[subscription.plan_id]
    if (!plan) return false

    return plan.features[feature]
  }

  const getCurrentPlan = () => {
    if (!subscription?.plan_id) return null
    return PLANS[subscription.plan_id]
  }

  // Loading screen
  if (authLoading || (isAuthenticated && profileLoading)) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-icon">💊</div>
          <h2>Emagreci+</h2>
          <div className="loading-spinner-large"></div>
          <p>Carregando seus dados...</p>
        </div>
      </div>
    )
  }

  // Landing Page
  if (showLanding && !isAuthenticated) {
    return (
      <>
        <LandingPage
          onStart={() => {
            setShowLanding(false)
            setShowAuth(true)
          }}
          onLogin={() => {
            setShowLanding(false)
            setShowAuth(true)
          }}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    )
  }

  // Auth Screen (Login/Signup)
  if (showAuth && !isAuthenticated) {
    return (
      <>
        <AuthScreen
          onAuth={handleAuth}
          loading={authLoading}
          error={authError}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    )
  }

  // Quiz for new users
  if (isAuthenticated && !quizCompleted) {
    const question = quizQuestions[currentQuestion]

    const handleNext = async () => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        // Save profile to Supabase
        try {
          const profileData = {
            nome: answers.nome || user?.user_metadata?.nome || '',
            idade: parseInt(answers.idade) || null,
            altura: parseFloat(answers.altura) || null,
            peso_atual: parseFloat(answers.pesoAtual) || null,
            peso_inicial: parseFloat(answers.pesoAtual) || null,
            tipo_caneta: answers.tipoCaneta || '',
            objetivo: answers.objetivo || '',
            experiencia: answers.experiencia || ''
          }

          const result = await updateProfile(profileData)
          if (result.success) {
            setQuizCompleted(true)
            setShowPaywall(true)
            toast.success('Perfil criado com sucesso!')
          } else {
            toast.error('Erro ao salvar perfil. Tente novamente.')
          }
        } catch (err) {
          console.error('Error saving profile:', err)
          toast.error('Erro ao salvar perfil')
        }
      }
    }

    const handleBack = () => {
      if (currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1)
      }
    }

    const handleAnswer = (value) => {
      setAnswers({
        ...answers,
        [question.id]: value
      })
    }

    return (
      <>
        <QuizQuestion
          question={question}
          value={answers[question.id] || ''}
          onChange={handleAnswer}
          onNext={handleNext}
          onBack={handleBack}
          isFirst={currentQuestion === 0}
          isLast={currentQuestion === quizQuestions.length - 1}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    )
  }

  // Paywall Screen
  if (showPaywall && isAuthenticated) {
    return (
      <>
        <PaywallScreen
          onSelectPlan={async (planId, stripeData = {}) => {
            const result = await subscribe(planId, stripeData)
            if (result.success) {
              setShowPaywall(false)
              toast.success(`Bem-vindo ao plano ${PLANS[planId]?.name}! 🎉`)
            } else {
              toast.error('Erro ao ativar plano. Tente novamente.')
            }
          }}
          onStartTrial={async () => {
            const result = await startTrial()
            if (result.success) {
              setShowPaywall(false)
              toast.success('Trial de 3 dias ativado! Aproveite! 🚀')
            } else {
              toast.error('Erro ao ativar trial')
            }
          }}
          trialUsed={subscription?.status === 'trial' || subscription?.status === 'expired'}
          onClose={() => setShowPaywall(false)}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    )
  }

  // Main Dashboard
  const currentWeight = weights.length > 0
    ? [...weights].sort((a, b) => new Date(b.data) - new Date(a.data))[0].peso
    : parseFloat(answers.pesoAtual || profile?.peso_atual || 0)

  const currentPlan = getCurrentPlan()
  const daysRemaining = getDaysRemaining()

  const handleSaveDose = async (newDose) => {
    const result = await addDose(newDose)
    if (result) {
      setShowDoseModal(false)
      toast.success('Dose registrada com sucesso!')
    } else {
      toast.error('Erro ao registrar dose')
    }
  }

  const handleSaveWeight = async (newWeight) => {
    const result = await addWeight(newWeight)
    if (result) {
      setShowWeightModal(false)
      toast.success('Peso registrado com sucesso!')
    } else {
      toast.error('Erro ao registrar peso')
    }
  }

  const handleSaveMeasurement = async (newMeasurement, measurementId) => {
    if (!checkAccess('measurements')) {
      toast.warning('Atualize seu plano para registrar medidas')
      return
    }

    // Se tem ID, é edição
    if (measurementId) {
      const result = await updateMeasurement(measurementId, newMeasurement)
      if (result) {
        setShowMeasurementModal(false)
        setEditingMeasurement(null)
        toast.success('Medidas atualizadas com sucesso!')
      } else {
        toast.error('Erro ao atualizar medidas')
      }
    } else {
      // Senão, é novo registro
      const result = await addMeasurement(newMeasurement)
      if (result) {
        setShowMeasurementModal(false)
        toast.success('Medidas registradas com sucesso!')
      } else {
        toast.error('Erro ao registrar medidas')
      }
    }
  }

  const handleEditMeasurement = (measurement) => {
    setEditingMeasurement(measurement)
    setShowMeasurementModal(true)
  }

  const handleDeleteMeasurement = async (measurementId) => {
    if (window.confirm('Tem certeza que deseja excluir esta medida?')) {
      const result = await deleteMeasurement(measurementId)
      if (result) {
        toast.success('Medida excluída com sucesso!')
      } else {
        toast.error('Erro ao excluir medida')
      }
    }
  }

  const handleSaveSideEffect = async (newEffect) => {
    if (!checkAccess('sideEffects')) {
      toast.warning('Atualize seu plano para registrar efeitos colaterais')
      return
    }
    const result = await addSideEffect(newEffect)
    if (result) {
      setShowSideEffectModal(false)
      toast.warning('Efeito colateral registrado. Acompanhe sua saúde!')
    } else {
      toast.error('Erro ao registrar efeito')
    }
  }

  const handleSaveNutrition = (nutrition) => {
    if (!checkAccess('nutrition')) {
      toast.warning('Atualize seu plano para rastreamento nutricional')
      return
    }
    // TODO: Implement nutrition saving to Supabase
    setShowNutritionModal(false)
    toast.success('Nutrição registrada!')
  }

  const handleAddPhoto = (photo) => {
    const maxPhotos = checkAccess('photos')
    if (maxPhotos !== true && maxPhotos !== Infinity) {
      toast.warning(`Limite de fotos atingido`)
      return
    }
    // TODO: Implement photo upload to Supabase Storage
    toast.success('Foto adicionada!')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const recentDoses = doses.slice(-5).reverse()

  const userName = answers.nome || profile?.nome || user?.email?.split('@')[0] || 'Usuário'

  return (
    <div className="app-container">
      <div className="dashboard">
        {/* Subscription Banner */}
        {currentPlan && subscription?.status === 'active' && daysRemaining <= 7 && daysRemaining > 0 && (
          <div className="subscription-banner">
            <span>⚠️ Sua assinatura {currentPlan.name} expira em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}</span>
            <button onClick={() => setShowPaywall(true)}>Renovar</button>
          </div>
        )}

        {/* Trial Banner */}
        {currentPlan && subscription?.status === 'trial' && (
          <div className="subscription-banner" style={{ background: 'linear-gradient(135deg, #38b2ac, #319795)' }}>
            <span>🎁 Teste grátis: {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}</span>
            <button onClick={() => setShowPaywall(true)}>Assinar Agora</button>
          </div>
        )}

        {/* Upgrade Banner */}
        {currentPlan?.id === 'basic' && subscription?.status === 'active' && (
          <div className="upgrade-banner">
            <div className="upgrade-content">
              <span>🚀 Desbloqueie mais recursos!</span>
              <p>Faça upgrade para Pro ou Premium e tenha acesso completo</p>
            </div>
            <button onClick={() => setShowPaywall(true)}>Ver Planos</button>
          </div>
        )}

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Olá, {userName.split(' ')[0]}! 👋</h1>
          </div>
          <div className="header-actions">
            <PlanDropdown
              subscription={subscription}
              onUpgrade={(plan) => {
                setShowPaywall(true)
                toast.info(`Faça upgrade para o plano ${plan.name} e tenha acesso a recursos exclusivos!`)
              }}
              onSupport={() => {
                const supportType = currentPlan?.features.support || 'email'
                if (supportType === 'priority') {
                  toast.info('Suporte prioritário: suporte@emagreciplus.com.br (24/7)')
                } else if (supportType === 'chat') {
                  toast.info('Suporte via chat disponível no horário comercial')
                } else {
                  toast.info('Suporte via email: suporte@emagreciplus.com.br')
                }
              }}
              onManage={() => {
                toast.info('Redirecionando para o portal de gerenciamento...')
                // Aqui você pode integrar com o Stripe Portal
              }}
            />
            <button className="btn-icon" onClick={() => setShowReminderModal(true)} title="Lembretes">
              ⏰
            </button>
            {checkAccess('export') && (
              <button className="btn-icon" onClick={() => setShowExportModal(true)} title="Exportar PDF">
                📤
              </button>
            )}
            {checkAccess('history') && (
              <button className="btn-icon" onClick={() => setShowHistoryModal(true)} title="Histórico">
                📚
              </button>
            )}
            <button className="btn-icon" onClick={handleLogout} title="Sair">
              🚪
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-action btn-dose" onClick={() => setShowDoseModal(true)}>
            <span>💉</span>
            <span>Dose</span>
          </button>
          <button className="btn-action btn-weight" onClick={() => setShowWeightModal(true)}>
            <span>⚖️</span>
            <span>Peso</span>
          </button>
          <button
            className={`btn-action btn-measure ${!checkAccess('measurements') ? 'locked' : ''}`}
            onClick={() => checkAccess('measurements') ? setShowMeasurementModal(true) : toast.warning('Faça upgrade para o plano Pro')}
          >
            <span>📏</span>
            <span>Medidas</span>
          </button>
          <button
            className={`btn-action btn-effect ${!checkAccess('sideEffects') ? 'locked' : ''}`}
            onClick={() => checkAccess('sideEffects') ? setShowSideEffectModal(true) : toast.warning('Faça upgrade para o plano Pro')}
          >
            <span>🩺</span>
            <span>Efeitos</span>
          </button>
          <button
            className={`btn-action btn-nutrition ${!checkAccess('nutrition') ? 'locked' : ''}`}
            onClick={() => checkAccess('nutrition') ? setShowNutritionModal(true) : toast.warning('Faça upgrade para o plano Pro')}
          >
            <span>🥗</span>
            <span>Nutrição</span>
          </button>
          <button
            className={`btn-action btn-photos ${!checkAccess('photos') ? 'locked' : ''}`}
            onClick={() => checkAccess('photos') ? setShowPhotosModal(true) : toast.warning('Faça upgrade para o plano Pro')}
          >
            <span>📸</span>
            <span>Fotos</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="view-tabs">
          <button
            className={`view-tab ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`view-tab ${activeView === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveView('progress')}
          >
            📈 Progresso
          </button>
          <button
            className={`view-tab ${activeView === 'avatar' ? 'active' : ''} ${!checkAccess('avatar') ? 'locked' : ''}`}
            onClick={() => checkAccess('avatar') ? setActiveView('avatar') : toast.warning('Faça upgrade para o plano Pro')}
          >
            🪞 Avatar
          </button>
          <button
            className={`view-tab ${activeView === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveView('goals')}
          >
            🎯 Metas
          </button>
          <button
            className={`view-tab ${activeView === 'community' ? 'active' : ''} ${!checkAccess('community') ? 'locked' : ''}`}
            onClick={() => checkAccess('community') ? setActiveView('community') : toast.warning('Faça upgrade para o plano Premium')}
          >
            💬 Comunidade
          </button>
        </div>

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <>
            {checkAccess('stats') && (
              <StatsCard
                profile={answers}
                weights={weights}
                doses={doses}
                sideEffects={sideEffects}
              />
            )}

            <div className="cards-grid">
              <div className="info-card">
                <div className="card-icon">⚖️</div>
                <div className="card-content">
                  <h3>Peso Atual</h3>
                  <p className="card-value">{currentWeight} kg</p>
                </div>
              </div>

              <div className="info-card">
                <div className="card-icon">💉</div>
                <div className="card-content">
                  <h3>Caneta</h3>
                  <p className="card-value">{answers.tipoCaneta || profile?.tipo_caneta}</p>
                </div>
              </div>

              <div className="info-card">
                <div className="card-icon">📊</div>
                <div className="card-content">
                  <h3>Total de Doses</h3>
                  <p className="card-value">{doses.length}</p>
                </div>
              </div>

              <div className="info-card">
                <div className="card-icon">🎯</div>
                <div className="card-content">
                  <h3>Objetivo</h3>
                  <p className="card-value-small">{answers.objetivo || profile?.objetivo}</p>
                </div>
              </div>
            </div>

            {checkAccess('injectionMap') && <InjectionMap doses={doses} />}

            {measurements.length > 0 && checkAccess('measurements') && (
              <div className="section">
                <h2>📏 Suas Medidas Corporais</h2>
                <MeasurementAvatar measurements={measurements} showProgress={true} />
              </div>
            )}

            <div className="section">
              <h2>📅 Doses Recentes</h2>
              {doses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💉</div>
                  <h3>Nenhuma dose registrada ainda</h3>
                  <p>Clique em &quot;Dose&quot; para começar o acompanhamento</p>
                </div>
              ) : (
                <div className="doses-list">
                  {recentDoses.map((dose) => (
                    <div key={dose.id} className="dose-item">
                      <div className="dose-header">
                        <span className="dose-date">📅 {formatDate(dose.data)}</span>
                        <span className="dose-time">🕐 {dose.horario}</span>
                      </div>
                      <div className="dose-details">
                        <span className="dose-dosagem">💉 {dose.dosagem} mg</span>
                        <span className="dose-local">📍 {dose.local}</span>
                      </div>
                      {dose.observacoes && (
                        <div className="dose-obs">
                          <p>💭 {dose.observacoes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Progress View */}
        {activeView === 'progress' && (
          <>
            <div className="section">
              <h2>📈 Evolução de Peso</h2>
              <WeightChart weights={weights} />
            </div>

            {measurements.length > 0 && checkAccess('measurements') && (
              <>
                <div className="section">
                  <h2>📏 Avatar de Medidas Corporais</h2>
                  <MeasurementAvatar measurements={measurements} showProgress={true} />
                </div>

                <div className="section">
                  <h2>📋 Últimas Medidas</h2>
                  <div className="measurements-list">
                    {measurements.slice(-3).reverse().map(m => (
                      <div key={m.id} className="measurement-item">
                        <div className="measurement-header">
                          <div className="measurement-date">{formatDate(m.data)}</div>
                          <div className="measurement-actions">
                            <button
                              className="btn-icon-small"
                              onClick={() => handleEditMeasurement(m)}
                              title="Editar medidas"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon-small btn-delete"
                              onClick={() => handleDeleteMeasurement(m.id)}
                              title="Excluir medidas"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div className="measurement-values">
                          {m.cintura && <span>Cintura: {m.cintura}cm</span>}
                          {m.quadril && <span>Quadril: {m.quadril}cm</span>}
                          {m.braco && <span>Braço: {m.braco}cm</span>}
                          {m.coxa && <span>Coxa: {m.coxa}cm</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {sideEffects.length > 0 && checkAccess('sideEffects') && (
              <div className="section">
                <h2>🩺 Efeitos Colaterais Recentes</h2>
                <div className="effects-list">
                  {sideEffects.slice(-5).reverse().map(e => (
                    <div key={e.id} className="effect-item">
                      <span className="effect-icon">{e.tipo_icon}</span>
                      <span className="effect-name">{e.tipo_label}</span>
                      <span className="effect-intensity">⚡ {e.intensidade}/5</span>
                      <span className="effect-date">{formatDate(e.data)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Avatar View */}
        {activeView === 'avatar' && checkAccess('avatar') && (
          <TransformationAvatar
            initialWeight={parseFloat(answers.pesoAtual || profile?.peso_inicial || 0)}
            currentWeight={currentWeight}
            targetWeight={parseFloat(answers.pesoAtual || profile?.peso_inicial || 0) * 0.85}
            height={parseFloat(answers.altura || profile?.altura || 170)}
          />
        )}

        {/* Goals View */}
        {activeView === 'goals' && (
          <GoalsPanel
            goals={goals.map(g => ({
              id: g.id,
              titulo: g.titulo,
              tipo: g.tipo,
              valorAlvo: g.valor_alvo,
              valorAtual: g.valor_atual,
              concluida: g.concluida,
              dataCriacao: g.data_criacao
            }))}
            onAddGoal={addGoal}
            onToggleGoal={toggleGoal}
            onDeleteGoal={deleteGoal}
            currentWeight={currentWeight}
            initialWeight={parseFloat(answers.pesoAtual || profile?.peso_inicial || 0)}
          />
        )}

        {/* Community View */}
        {activeView === 'community' && checkAccess('community') && (
          <CommunityChat
            messages={communityMessages}
            onSendMessage={(content) => {
              sendCommunityMessage(content, userName)
                .then(result => {
                  if (!result.success) {
                    toast.error('Erro ao enviar mensagem')
                  }
                })
            }}
            onShareResult={(message, weightLossValue) => {
              shareCommunityResult(userName, weightLossValue, message)
                .then(result => {
                  if (result.success) {
                    toast.success('Resultado compartilhado com sucesso! 🎉')
                  } else {
                    toast.error('Erro ao compartilhar resultado')
                  }
                })
            }}
            onLikeMessage={likeCommunityMessage}
            currentUserId={user?.id}
            userName={userName}
            weightLoss={parseFloat(answers.pesoAtual || profile?.peso_inicial || 0) - currentWeight}
            loading={communityLoading}
          />
        )}
      </div>

      {/* Modals */}
      {showDoseModal && (
        <DoseRegistration onSave={handleSaveDose} onClose={() => setShowDoseModal(false)} />
      )}

      {showWeightModal && (
        <WeightRegistration onSave={handleSaveWeight} onClose={() => setShowWeightModal(false)} currentWeight={currentWeight} />
      )}

      {showMeasurementModal && (
        <MeasurementRegistration
          onSave={handleSaveMeasurement}
          onClose={() => {
            setShowMeasurementModal(false)
            setEditingMeasurement(null)
          }}
          initialData={editingMeasurement}
        />
      )}

      {showSideEffectModal && (
        <SideEffectRegistration onSave={handleSaveSideEffect} onClose={() => setShowSideEffectModal(false)} />
      )}

      {showNutritionModal && (
        <NutritionTracker onSave={handleSaveNutrition} onClose={() => setShowNutritionModal(false)} dailyData={{}} />
      )}

      {showPhotosModal && (
        <ProgressPhotos photos={[]} onAddPhoto={handleAddPhoto} maxPhotos={checkAccess('photos') === true ? null : checkAccess('photos')} onClose={() => setShowPhotosModal(false)} />
      )}

      {showHistoryModal && (
        <HistoryPanel
          doses={doses}
          weights={weights}
          sideEffects={sideEffects.map(e => ({
            ...e,
            tipoLabel: e.tipo_label,
            tipoIcon: e.tipo_icon
          }))}
          measurements={measurements}
          onClose={() => setShowHistoryModal(false)}
          onEditMeasurement={handleEditMeasurement}
          onDeleteMeasurement={handleDeleteMeasurement}
        />
      )}

      {showExportModal && (
        <ExportData
          profile={answers}
          doses={doses}
          weights={weights}
          sideEffects={sideEffects.map(e => ({
            ...e,
            tipoLabel: e.tipo_label,
            tipoIcon: e.tipo_icon
          }))}
          measurements={measurements}
          onClose={() => setShowExportModal(false)}
          onSuccess={toast.success}
        />
      )}

      {showReminderModal && (
        <ReminderSettings
          reminders={{ enabled: false, dayOfWeek: 0, time: '08:00' }}
          onUpdate={() => {}}
          onClose={() => setShowReminderModal(false)}
          onSuccess={toast.success}
        />
      )}

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </div>
  )
}

export default App

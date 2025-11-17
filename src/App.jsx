import { useState, useEffect } from 'react'
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
import { ToastContainer } from './components/Toast'
import { useToast } from './hooks/useToast'
import { useSubscription } from './hooks/useSubscription'
import { quizQuestions } from './data/quizData'
import {
  useProfile,
  useDoses,
  useWeights,
  useMeasurements,
  useSideEffects,
  useGoals,
  useReminders,
  useNutrition,
  useProgressPhotos
} from './hooks/useLocalStorage'
import './App.css'

function App() {
  const [started, setStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})

  // Modais
  const [showDoseModal, setShowDoseModal] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [showMeasurementModal, setShowMeasurementModal] = useState(false)
  const [showSideEffectModal, setShowSideEffectModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [showNutritionModal, setShowNutritionModal] = useState(false)
  const [showPhotosModal, setShowPhotosModal] = useState(false)

  // View state
  const [activeView, setActiveView] = useState('dashboard')

  // Hooks de dados
  const [profile, setProfile] = useProfile()
  const { doses, addDose } = useDoses()
  const { weights, addWeight } = useWeights()
  const { measurements, addMeasurement } = useMeasurements()
  const { sideEffects, addSideEffect } = useSideEffects()
  const { goals, addGoal, toggleGoal, deleteGoal } = useGoals()
  const { reminders, updateReminders } = useReminders()
  const { addNutritionEntry, getTodayNutrition } = useNutrition()
  const { photos, addPhoto, getMonthlyCount } = useProgressPhotos()

  // Subscription
  const { subscribe, startTrial, checkAccess, isSubscribed, trialUsed, getCurrentPlan, getDaysRemaining } = useSubscription()

  // Toast notifications
  const toast = useToast()

  // Carregar perfil ao iniciar
  useEffect(() => {
    if (profile && !quizCompleted) {
      const timer = setTimeout(() => {
        setAnswers(profile)
        setStarted(true)
        setQuizCompleted(true)
        if (!isSubscribed()) {
          setShowPaywall(true)
        }
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [profile, quizCompleted, isSubscribed])

  // Verificar lembretes
  useEffect(() => {
    if (!reminders.enabled) return

    const checkReminder = () => {
      const now = new Date()
      const currentDay = now.getDay()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      if (currentDay === reminders.dayOfWeek && currentTime === reminders.time) {
        if (Notification.permission === 'granted') {
          new Notification('Emagreci+ - Lembrete', {
            body: 'Hora de aplicar sua dose! 💉',
            icon: '💉'
          })
        }
        toast.info('Lembrete: Hora de aplicar sua dose!')
      }
    }

    const interval = setInterval(checkReminder, 60000)
    return () => clearInterval(interval)
  }, [reminders, toast])

  // Tela inicial
  if (!started) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <div className="logo-container">
            <div className="logo-icon">💉</div>
            <h1 className="app-name">Emagreci+</h1>
          </div>
          <p className="tagline">Sua jornada de transformação começa aqui</p>
          <div className="feature-highlights">
            <span>📊 Gráficos de progresso</span>
            <span>🎯 Metas personalizadas</span>
            <span>🪞 Avatar de Transformação</span>
          </div>
          <button className="btn-primary btn-large" onClick={() => setStarted(true)}>
            Começar Agora
          </button>
          <p className="splash-subtitle">Mais de 10.000 usuários transformados</p>
        </div>
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </div>
    )
  }

  // Quiz em andamento
  if (!quizCompleted) {
    const question = quizQuestions[currentQuestion]

    const handleNext = () => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        try {
          setProfile(answers)
          setQuizCompleted(true)
          setShowPaywall(true)
          toast.success('Perfil criado com sucesso!')
        } catch {
          toast.error('Erro ao salvar perfil. Tente novamente.')
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
  if (showPaywall && !isSubscribed()) {
    return (
      <>
        <PaywallScreen
          onSelectPlan={(planId) => {
            subscribe(planId)
            setShowPaywall(false)
            toast.success(`Bem-vindo ao plano ${planId}! 🎉`)
          }}
          onStartTrial={() => {
            startTrial()
            setShowPaywall(false)
            toast.success('Trial de 7 dias ativado! Aproveite! 🚀')
          }}
          trialUsed={trialUsed}
        />
        <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
      </>
    )
  }

  // Handlers
  const handleSaveDose = (newDose) => {
    addDose(newDose)
    setShowDoseModal(false)
    toast.success('Dose registrada com sucesso!')
  }

  const handleSaveWeight = (newWeight) => {
    addWeight(newWeight)
    setShowWeightModal(false)
    toast.success('Peso registrado com sucesso!')
  }

  const handleSaveMeasurement = (newMeasurement) => {
    if (!checkAccess('measurements')) {
      toast.warning('Atualize seu plano para registrar medidas')
      return
    }
    addMeasurement(newMeasurement)
    setShowMeasurementModal(false)
    toast.success('Medidas registradas com sucesso!')
  }

  const handleSaveSideEffect = (newEffect) => {
    if (!checkAccess('sideEffects')) {
      toast.warning('Atualize seu plano para registrar efeitos colaterais')
      return
    }
    addSideEffect(newEffect)
    setShowSideEffectModal(false)
    toast.warning('Efeito colateral registrado. Acompanhe sua saúde!')
  }

  const handleSaveNutrition = (nutrition) => {
    if (!checkAccess('nutrition')) {
      toast.warning('Atualize seu plano para rastreamento nutricional')
      return
    }
    addNutritionEntry(nutrition)
    setShowNutritionModal(false)
    toast.success('Nutrição registrada!')
  }

  const handleAddPhoto = (photo) => {
    const maxPhotos = checkAccess('photos')
    if (maxPhotos !== true && maxPhotos !== Infinity) {
      const monthlyCount = getMonthlyCount()
      if (monthlyCount >= maxPhotos) {
        toast.warning(`Limite de ${maxPhotos} fotos/mês atingido`)
        return
      }
    }
    addPhoto(photo)
    toast.success('Foto adicionada!')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const recentDoses = doses.slice(-5).reverse()

  const currentWeight = weights.length > 0
    ? [...weights].sort((a, b) => new Date(b.data) - new Date(a.data))[0].peso
    : parseFloat(answers.pesoAtual || 0)

  const currentPlan = getCurrentPlan()
  const daysRemaining = getDaysRemaining()

  return (
    <div className="app-container">
      <div className="dashboard">
        {/* Subscription Banner */}
        {currentPlan && daysRemaining <= 7 && (
          <div className="subscription-banner">
            <span>⚠️ Sua assinatura {currentPlan.name} expira em {daysRemaining} dias</span>
            <button onClick={() => setShowPaywall(true)}>Renovar</button>
          </div>
        )}

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Olá, {answers.nome?.split(' ')[0]}! 👋</h1>
            <p>Plano {currentPlan?.name} {currentPlan?.icon}</p>
          </div>
          <div className="header-actions">
            <button className="btn-icon" onClick={() => setShowReminderModal(true)} title="Lembretes">
              ⏰
            </button>
            {checkAccess('export') && (
              <button className="btn-icon" onClick={() => setShowExportModal(true)} title="Exportar">
                📤
              </button>
            )}
            {checkAccess('history') && (
              <button className="btn-icon" onClick={() => setShowHistoryModal(true)} title="Histórico">
                📚
              </button>
            )}
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
            onClick={() => checkAccess('measurements') ? setShowMeasurementModal(true) : toast.warning('Faça upgrade para o plano Pro para acessar')}
          >
            <span>📏</span>
            <span>Medidas</span>
          </button>
          <button
            className={`btn-action btn-effect ${!checkAccess('sideEffects') ? 'locked' : ''}`}
            onClick={() => checkAccess('sideEffects') ? setShowSideEffectModal(true) : toast.warning('Faça upgrade para o plano Pro para acessar')}
          >
            <span>🩺</span>
            <span>Efeitos</span>
          </button>
          <button
            className={`btn-action btn-nutrition ${!checkAccess('nutrition') ? 'locked' : ''}`}
            onClick={() => checkAccess('nutrition') ? setShowNutritionModal(true) : toast.warning('Faça upgrade para o plano Pro para acessar')}
          >
            <span>🥗</span>
            <span>Nutrição</span>
          </button>
          <button
            className={`btn-action btn-photos ${!checkAccess('photos') ? 'locked' : ''}`}
            onClick={() => checkAccess('photos') ? setShowPhotosModal(true) : toast.warning('Faça upgrade para o plano Pro para acessar')}
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
            onClick={() => checkAccess('avatar') ? setActiveView('avatar') : toast.warning('Faça upgrade para o plano Pro para acessar o Avatar')}
          >
            🪞 Avatar
          </button>
          <button
            className={`view-tab ${activeView === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveView('goals')}
          >
            🎯 Metas
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
                  <p className="card-value">{answers.tipoCaneta}</p>
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
                  <p className="card-value-small">{answers.objetivo}</p>
                </div>
              </div>
            </div>

            {checkAccess('injectionMap') && <InjectionMap doses={doses} />}

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
              <div className="section">
                <h2>📏 Últimas Medidas</h2>
                <div className="measurements-list">
                  {measurements.slice(-3).reverse().map(m => (
                    <div key={m.id} className="measurement-item">
                      <div className="measurement-date">{formatDate(m.data)}</div>
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
            )}

            {sideEffects.length > 0 && checkAccess('sideEffects') && (
              <div className="section">
                <h2>🩺 Efeitos Colaterais Recentes</h2>
                <div className="effects-list">
                  {sideEffects.slice(-5).reverse().map(e => (
                    <div key={e.id} className="effect-item">
                      <span className="effect-icon">{e.tipoIcon}</span>
                      <span className="effect-name">{e.tipoLabel}</span>
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
            initialWeight={parseFloat(answers.pesoAtual || 0)}
            currentWeight={currentWeight}
            targetWeight={parseFloat(answers.pesoAtual || 0) * 0.85}
            height={parseFloat(answers.altura || 170)}
          />
        )}

        {/* Goals View */}
        {activeView === 'goals' && (
          <GoalsPanel
            goals={goals}
            onAddGoal={addGoal}
            onToggleGoal={toggleGoal}
            onDeleteGoal={deleteGoal}
            currentWeight={currentWeight}
            initialWeight={parseFloat(answers.pesoAtual || 0)}
          />
        )}
      </div>

      {/* Modais */}
      {showDoseModal && (
        <DoseRegistration onSave={handleSaveDose} onClose={() => setShowDoseModal(false)} />
      )}

      {showWeightModal && (
        <WeightRegistration onSave={handleSaveWeight} onClose={() => setShowWeightModal(false)} currentWeight={currentWeight} />
      )}

      {showMeasurementModal && (
        <MeasurementRegistration onSave={handleSaveMeasurement} onClose={() => setShowMeasurementModal(false)} />
      )}

      {showSideEffectModal && (
        <SideEffectRegistration onSave={handleSaveSideEffect} onClose={() => setShowSideEffectModal(false)} />
      )}

      {showNutritionModal && (
        <NutritionTracker onSave={handleSaveNutrition} onClose={() => setShowNutritionModal(false)} dailyData={getTodayNutrition()} />
      )}

      {showPhotosModal && (
        <ProgressPhotos photos={photos} onAddPhoto={handleAddPhoto} maxPhotos={checkAccess('photos') === true ? null : checkAccess('photos')} onClose={() => setShowPhotosModal(false)} />
      )}

      {showHistoryModal && (
        <HistoryPanel doses={doses} weights={weights} sideEffects={sideEffects} measurements={measurements} onClose={() => setShowHistoryModal(false)} />
      )}

      {showExportModal && (
        <ExportData profile={answers} doses={doses} weights={weights} sideEffects={sideEffects} measurements={measurements} onClose={() => setShowExportModal(false)} onSuccess={toast.success} />
      )}

      {showReminderModal && (
        <ReminderSettings reminders={reminders} onUpdate={updateReminders} onClose={() => setShowReminderModal(false)} onSuccess={toast.success} />
      )}

      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </div>
  )
}

export default App

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
import { ToastContainer } from './components/Toast'
import { useToast } from './hooks/useToast'
import { quizQuestions } from './data/quizData'
import {
  useProfile,
  useDoses,
  useWeights,
  useMeasurements,
  useSideEffects,
  useGoals,
  useReminders
} from './hooks/useLocalStorage'
import './App.css'

function App() {
  const [started, setStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
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

  // Toast notifications
  const toast = useToast()

  // Carregar perfil ao iniciar
  useEffect(() => {
    if (profile && !quizCompleted) {
      // Usar função de atualização para evitar cascade
      const timer = setTimeout(() => {
        setAnswers(profile)
        setStarted(true)
        setQuizCompleted(true)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [profile, quizCompleted])

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

    const interval = setInterval(checkReminder, 60000) // Verifica a cada minuto
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
            <span>📈 Análises detalhadas</span>
          </div>
          <button className="btn-primary" onClick={() => setStarted(true)}>
            Começar Agora
          </button>
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

  // Handlers de salvamento
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
    addMeasurement(newMeasurement)
    setShowMeasurementModal(false)
    toast.success('Medidas registradas com sucesso!')
  }

  const handleSaveSideEffect = (newEffect) => {
    addSideEffect(newEffect)
    setShowSideEffectModal(false)
    toast.warning('Efeito colateral registrado. Acompanhe sua saúde!')
  }

  // Formatação
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const recentDoses = doses.slice(-5).reverse()

  // Peso atual
  const currentWeight = weights.length > 0
    ? [...weights].sort((a, b) => new Date(b.data) - new Date(a.data))[0].peso
    : parseFloat(answers.pesoAtual || 0)

  return (
    <div className="app-container">
      <div className="dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Olá, {answers.nome?.split(' ')[0]}! 👋</h1>
            <p>Bem-vindo ao seu painel Emagreci+</p>
          </div>
          <div className="header-actions">
            <button className="btn-icon" onClick={() => setShowReminderModal(true)} title="Lembretes">
              ⏰
            </button>
            <button className="btn-icon" onClick={() => setShowExportModal(true)} title="Exportar">
              📤
            </button>
            <button className="btn-icon" onClick={() => setShowHistoryModal(true)} title="Histórico">
              📚
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-action btn-dose" onClick={() => setShowDoseModal(true)}>
            💉 Registrar Dose
          </button>
          <button className="btn-action btn-weight" onClick={() => setShowWeightModal(true)}>
            ⚖️ Registrar Peso
          </button>
          <button className="btn-action btn-measure" onClick={() => setShowMeasurementModal(true)}>
            📏 Medidas
          </button>
          <button className="btn-action btn-effect" onClick={() => setShowSideEffectModal(true)}>
            🩺 Efeito Colateral
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
            className={`view-tab ${activeView === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveView('goals')}
          >
            🎯 Metas
          </button>
        </div>

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <>
            {/* Stats */}
            <StatsCard
              profile={answers}
              weights={weights}
              doses={doses}
              sideEffects={sideEffects}
            />

            {/* Quick Summary Cards */}
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

            {/* Doses Recentes */}
            <div className="section">
              <h2>📅 Doses Recentes</h2>

              {doses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💉</div>
                  <h3>Nenhuma dose registrada ainda</h3>
                  <p>Clique em &quot;Registrar Dose&quot; para começar o acompanhamento</p>
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
            {/* Weight Chart */}
            <div className="section">
              <h2>📈 Evolução de Peso</h2>
              <WeightChart weights={weights} />
            </div>

            {/* Recent Measurements */}
            {measurements.length > 0 && (
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

            {/* Side Effects Summary */}
            {sideEffects.length > 0 && (
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
        <DoseRegistration
          onSave={handleSaveDose}
          onClose={() => setShowDoseModal(false)}
        />
      )}

      {showWeightModal && (
        <WeightRegistration
          onSave={handleSaveWeight}
          onClose={() => setShowWeightModal(false)}
          currentWeight={currentWeight}
        />
      )}

      {showMeasurementModal && (
        <MeasurementRegistration
          onSave={handleSaveMeasurement}
          onClose={() => setShowMeasurementModal(false)}
        />
      )}

      {showSideEffectModal && (
        <SideEffectRegistration
          onSave={handleSaveSideEffect}
          onClose={() => setShowSideEffectModal(false)}
        />
      )}

      {showHistoryModal && (
        <HistoryPanel
          doses={doses}
          weights={weights}
          sideEffects={sideEffects}
          measurements={measurements}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {showExportModal && (
        <ExportData
          profile={answers}
          doses={doses}
          weights={weights}
          sideEffects={sideEffects}
          measurements={measurements}
          onClose={() => setShowExportModal(false)}
          onSuccess={toast.success}
        />
      )}

      {showReminderModal && (
        <ReminderSettings
          reminders={reminders}
          onUpdate={updateReminders}
          onClose={() => setShowReminderModal(false)}
          onSuccess={toast.success}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </div>
  )
}

export default App

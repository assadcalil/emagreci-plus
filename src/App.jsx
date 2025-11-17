import { useState, useEffect } from 'react'
import QuizQuestion from './components/QuizQuestion'
import DoseRegistration from './components/DoseRegistration'
import { quizQuestions } from './data/quizData'
import './App.css'

function App() {
  const [started, setStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showDoseModal, setShowDoseModal] = useState(false)
  const [doses, setDoses] = useState([])

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile')
    const savedDoses = localStorage.getItem('doses')
    
    if (savedProfile) {
      setAnswers(JSON.parse(savedProfile))
      setStarted(true)
      setQuizCompleted(true)
    }
    
    if (savedDoses) {
      setDoses(JSON.parse(savedDoses))
    }
  }, [])

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
          <button className="btn-primary" onClick={() => setStarted(true)}>
            Começar
          </button>
        </div>
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
        localStorage.setItem('userProfile', JSON.stringify(answers))
        setQuizCompleted(true)
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
      <QuizQuestion
        question={question}
        value={answers[question.id] || ''}
        onChange={handleAnswer}
        onNext={handleNext}
        onBack={handleBack}
        isFirst={currentQuestion === 0}
        isLast={currentQuestion === quizQuestions.length - 1}
      />
    )
  }

  // Painel principal
  const handleSaveDose = (newDose) => {
    setDoses([...doses, newDose])
    setShowDoseModal(false)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const recentDoses = doses.slice(-5).reverse()

  return (
    <div className="app-container">
      <div className="dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Olá, {answers.nome?.split(' ')[0]}! 👋</h1>
            <p>Bem-vindo ao seu painel Emagreci+</p>
          </div>
          <button className="btn-primary" onClick={() => setShowDoseModal(true)}>
            💉 Registrar Dose
          </button>
        </div>

        {/* Cards de Resumo */}
        <div className="cards-grid">
          <div className="info-card">
            <div className="card-icon">⚖️</div>
            <div className="card-content">
              <h3>Peso Atual</h3>
              <p className="card-value">{answers.pesoAtual} kg</p>
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
              <p>Clique em "Registrar Dose" para começar o acompanhamento</p>
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

        {/* Próximos passos */}
        <div className="section">
          <h2>🚀 Em Desenvolvimento</h2>
          <div className="features-grid">
            <div className="feature-item">⏳ Gráfico de evolução de peso</div>
            <div className="feature-item">⏳ Registro de fotos</div>
            <div className="feature-item">⏳ Histórico de medidas</div>
            <div className="feature-item">⏳ Lembretes de doses</div>
          </div>
        </div>
      </div>

      {/* Modal de Registro */}
      {showDoseModal && (
        <DoseRegistration
          onSave={handleSaveDose}
          onClose={() => setShowDoseModal(false)}
        />
      )}
    </div>
  )
}

export default App
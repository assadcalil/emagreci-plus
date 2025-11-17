import './QuizQuestion.css'

function QuizQuestion({ question, value, onChange, onNext, onBack, isFirst, isLast }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (value) onNext()
  }

  return (
    <div className="quiz-question">
      <div className="question-container">
        <div className="question-icon">{question.icon}</div>
        <h2 className="question-text">{question.question}</h2>
        
        <form onSubmit={handleSubmit}>
          {question.type === 'text' && (
            <input
              type="text"
              className="input-field"
              placeholder={question.placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required
            />
          )}

          {question.type === 'number' && (
            <input
              type="number"
              className="input-field"
              placeholder={question.placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required
            />
          )}

          {question.type === 'date' && (
            <input
              type="date"
              className="input-field"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required
            />
          )}

          {question.type === 'select' && (
            <div className="options-container">
              {question.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`option-button ${value === option ? 'selected' : ''}`}
                  onClick={() => onChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          <div className="navigation-buttons">
            {!isFirst && (
              <button type="button" className="btn-secondary" onClick={onBack}>
                Voltar
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={!value}>
              {isLast ? 'Finalizar' : 'Próximo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuizQuestion
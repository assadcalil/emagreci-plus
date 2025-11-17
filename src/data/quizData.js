export const quizQuestions = [
  {
    id: 'nome',
    type: 'text',
    question: 'Qual é o seu nome?',
    placeholder: 'Digite seu nome completo',
    icon: '👤'
  },
  {
    id: 'dataNascimento',
    type: 'date',
    question: 'Qual é a sua data de nascimento?',
    icon: '🎂'
  },
  {
    id: 'objetivo',
    type: 'select',
    question: 'Qual é o seu objetivo com a caneta GLP-1?',
    icon: '🎯',
    options: [
      'Perder peso',
      'Controlar diabetes',
      'Melhorar saúde geral',
      'Outro'
    ]
  },
  {
    id: 'status',
    type: 'select',
    question: 'Você já está usando ou vai começar?',
    icon: '📋',
    options: [
      'Já estou usando',
      'Vou começar em breve',
      'Ainda estou decidindo'
    ]
  },
  {
    id: 'tipoCaneta',
    type: 'select',
    question: 'Qual caneta você está usando?',
    icon: '💉',
    options: [
      'Ozempic',
      'Wegovy',
      'Mounjaro',
      'Saxenda',
      'Victoza',
      'Outra'
    ]
  },
  {
    id: 'pesoAtual',
    type: 'number',
    question: 'Qual é o seu peso atual? (kg)',
    placeholder: 'Ex: 85',
    icon: '⚖️'
  },
  {
    id: 'altura',
    type: 'number',
    question: 'Qual é a sua altura? (cm)',
    placeholder: 'Ex: 170',
    icon: '📏'
  }
]
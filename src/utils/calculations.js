export const calculateIMC = (peso, altura) => {
  const alturaEmMetros = altura / 100
  const imc = peso / (alturaEmMetros * alturaEmMetros)
  return imc.toFixed(1)
}

export const getIMCCategory = (imc) => {
  if (imc < 18.5) return { text: 'Abaixo do peso', color: '#3498db' }
  if (imc < 25) return { text: 'Peso normal', color: '#2ecc71' }
  if (imc < 30) return { text: 'Sobrepeso', color: '#f39c12' }
  if (imc < 35) return { text: 'Obesidade I', color: '#e67e22' }
  if (imc < 40) return { text: 'Obesidade II', color: '#e74c3c' }
  return { text: 'Obesidade III', color: '#c0392b' }
}

export const calculateWeightLoss = (pesoInicial, pesoAtual) => {
  const perda = pesoInicial - pesoAtual
  const percentual = (perda / pesoInicial) * 100
  return {
    kg: perda.toFixed(1),
    percentual: percentual.toFixed(1)
  }
}
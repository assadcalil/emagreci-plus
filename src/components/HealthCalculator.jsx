import { useState, useEffect } from 'react'
import './HealthCalculator.css'

function HealthCalculator({ profile, measurements, weights, onClose }) {
  const [activeCalculator, setActiveCalculator] = useState('imc')

  // IMC Calculator
  const [altura, setAltura] = useState('')
  const [peso, setPeso] = useState('')
  const [imc, setImc] = useState(null)

  // Body Fat Calculator (Navy Method)
  const [sexo, setSexo] = useState('masculino')
  const [alturaBodyFat, setAlturaBodyFat] = useState('')
  const [cintura, setCintura] = useState('')
  const [pescoco, setPescoco] = useState('')
  const [quadril, setQuadril] = useState('')
  const [bodyFat, setBodyFat] = useState(null)

  // Auto-populate from profile and latest measurements
  useEffect(() => {
    if (profile) {
      if (profile.altura) setAltura(profile.altura.toString())
      if (profile.altura) setAlturaBodyFat(profile.altura.toString())
    }

    if (weights && weights.length > 0) {
      const latestWeight = weights[0]
      setPeso(latestWeight.peso.toString())
    }

    if (measurements && measurements.length > 0) {
      const latest = measurements[0]
      if (latest.cintura) setCintura(latest.cintura.toString())
      if (latest.quadril) setQuadril(latest.quadril.toString())
      if (latest.pescoco) setPescoco(latest.pescoco.toString())
    }
  }, [profile, measurements, weights])

  // Calculate IMC
  const calculateIMC = () => {
    const h = parseFloat(altura)
    const p = parseFloat(peso)

    if (!h || !p || h <= 0 || p <= 0) {
      alert('Digite valores válidos para altura e peso')
      return
    }

    const imcValue = p / (h * h)
    setImc(imcValue)
  }

  // Get IMC classification
  const getIMCClassification = (imcValue) => {
    if (!imcValue) return null

    if (imcValue < 18.5) return { label: 'Abaixo do peso', color: '#3498db', risk: 'Baixo' }
    if (imcValue < 25) return { label: 'Peso normal', color: '#2ecc71', risk: 'Normal' }
    if (imcValue < 30) return { label: 'Sobrepeso', color: '#f39c12', risk: 'Elevado' }
    if (imcValue < 35) return { label: 'Obesidade Grau I', color: '#e67e22', risk: 'Moderado' }
    if (imcValue < 40) return { label: 'Obesidade Grau II', color: '#e74c3c', risk: 'Alto' }
    return { label: 'Obesidade Grau III', color: '#c0392b', risk: 'Muito Alto' }
  }

  // Calculate Body Fat (Navy Method)
  const calculateBodyFat = () => {
    const h = parseFloat(alturaBodyFat)
    const c = parseFloat(cintura)
    const n = parseFloat(pescoco)

    if (!h || !c || !n || h <= 0 || c <= 0 || n <= 0) {
      alert('Digite valores válidos para altura, cintura e pescoço')
      return
    }

    let bf

    if (sexo === 'masculino') {
      // Navy formula for men: BF% = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
      const denominator = 1.0324 - 0.19077 * Math.log10(c - n) + 0.15456 * Math.log10(h)
      bf = (495 / denominator) - 450
    } else {
      // Navy formula for women: BF% = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
      const q = parseFloat(quadril)
      if (!q || q <= 0) {
        alert('Digite o valor do quadril para mulheres')
        return
      }
      const denominator = 1.29579 - 0.35004 * Math.log10(c + q - n) + 0.22100 * Math.log10(h)
      bf = (495 / denominator) - 450
    }

    setBodyFat(bf)
  }

  // Get Body Fat classification
  const getBodyFatClassification = (bfValue, gender) => {
    if (!bfValue) return null

    if (gender === 'masculino') {
      if (bfValue < 6) return { label: 'Essencial', color: '#3498db', description: 'Apenas atletas de elite' }
      if (bfValue < 14) return { label: 'Atlético', color: '#2ecc71', description: 'Excelente condição física' }
      if (bfValue < 18) return { label: 'Fitness', color: '#27ae60', description: 'Boa forma física' }
      if (bfValue < 25) return { label: 'Aceitável', color: '#f39c12', description: 'Razoável' }
      return { label: 'Obesidade', color: '#e74c3c', description: 'Alto risco à saúde' }
    } else {
      if (bfValue < 14) return { label: 'Essencial', color: '#3498db', description: 'Apenas atletas de elite' }
      if (bfValue < 21) return { label: 'Atlético', color: '#2ecc71', description: 'Excelente condição física' }
      if (bfValue < 25) return { label: 'Fitness', color: '#27ae60', description: 'Boa forma física' }
      if (bfValue < 32) return { label: 'Aceitável', color: '#f39c12', description: 'Razoável' }
      return { label: 'Obesidade', color: '#e74c3c', description: 'Alto risco à saúde' }
    }
  }

  const imcClassification = getIMCClassification(imc)
  const bfClassification = getBodyFatClassification(bodyFat, sexo)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-health-calculator" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🧮 Calculadoras de Saúde</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {/* Calculator Tabs */}
        <div className="calculator-tabs">
          <button
            className={`calc-tab ${activeCalculator === 'imc' ? 'active' : ''}`}
            onClick={() => setActiveCalculator('imc')}
          >
            📊 IMC
          </button>
          <button
            className={`calc-tab ${activeCalculator === 'bodyfat' ? 'active' : ''}`}
            onClick={() => setActiveCalculator('bodyfat')}
          >
            💪 Gordura Corporal
          </button>
        </div>

        {/* IMC Calculator */}
        {activeCalculator === 'imc' && (
          <div className="calculator-content">
            <div className="calculator-intro">
              <h3>Índice de Massa Corporal (IMC)</h3>
              <p>O IMC é uma medida que relaciona peso e altura para avaliar se você está no peso ideal.</p>
            </div>

            <div className="calculator-inputs">
              <div className="input-group">
                <label>Altura (m):</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 1.75"
                  value={altura}
                  onChange={(e) => setAltura(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Peso (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 70.5"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                />
              </div>
            </div>

            <button className="btn-calculate" onClick={calculateIMC}>
              Calcular IMC
            </button>

            {imc && (
              <div className="calculator-result">
                <div className="result-value">
                  <span className="result-label">Seu IMC:</span>
                  <span className="result-number" style={{ color: imcClassification.color }}>
                    {imc.toFixed(1)}
                  </span>
                </div>
                <div className="result-classification" style={{ borderLeftColor: imcClassification.color }}>
                  <div className="classification-label">{imcClassification.label}</div>
                  <div className="classification-risk">Risco: {imcClassification.risk}</div>
                </div>

                <div className="imc-scale">
                  <div className="scale-item" style={{ backgroundColor: '#3498db' }}>
                    <span>&lt; 18.5</span>
                    <small>Abaixo</small>
                  </div>
                  <div className="scale-item" style={{ backgroundColor: '#2ecc71' }}>
                    <span>18.5 - 25</span>
                    <small>Normal</small>
                  </div>
                  <div className="scale-item" style={{ backgroundColor: '#f39c12' }}>
                    <span>25 - 30</span>
                    <small>Sobrepeso</small>
                  </div>
                  <div className="scale-item" style={{ backgroundColor: '#e67e22' }}>
                    <span>30 - 35</span>
                    <small>Obesidade I</small>
                  </div>
                  <div className="scale-item" style={{ backgroundColor: '#e74c3c' }}>
                    <span>35 - 40</span>
                    <small>Obesidade II</small>
                  </div>
                  <div className="scale-item" style={{ backgroundColor: '#c0392b' }}>
                    <span>&gt; 40</span>
                    <small>Obesidade III</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Body Fat Calculator */}
        {activeCalculator === 'bodyfat' && (
          <div className="calculator-content">
            <div className="calculator-intro">
              <h3>Percentual de Gordura Corporal</h3>
              <p>Cálculo usando o método Navy (Marinha dos EUA), baseado em circunferências corporais.</p>
            </div>

            <div className="calculator-inputs">
              <div className="input-group">
                <label>Sexo:</label>
                <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>
              <div className="input-group">
                <label>Altura (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 175"
                  value={alturaBodyFat}
                  onChange={(e) => setAlturaBodyFat(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Cintura (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 85"
                  value={cintura}
                  onChange={(e) => setCintura(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Pescoço (cm):</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 38"
                  value={pescoco}
                  onChange={(e) => setPescoco(e.target.value)}
                />
              </div>
              {sexo === 'feminino' && (
                <div className="input-group">
                  <label>Quadril (cm):</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 95"
                    value={quadril}
                    onChange={(e) => setQuadril(e.target.value)}
                  />
                </div>
              )}
            </div>

            <button className="btn-calculate" onClick={calculateBodyFat}>
              Calcular Gordura Corporal
            </button>

            {bodyFat && (
              <div className="calculator-result">
                <div className="result-value">
                  <span className="result-label">Percentual de Gordura:</span>
                  <span className="result-number" style={{ color: bfClassification.color }}>
                    {bodyFat.toFixed(1)}%
                  </span>
                </div>
                <div className="result-classification" style={{ borderLeftColor: bfClassification.color }}>
                  <div className="classification-label">{bfClassification.label}</div>
                  <div className="classification-risk">{bfClassification.description}</div>
                </div>

                <div className="bf-info">
                  <h4>Referências ({sexo === 'masculino' ? 'Homens' : 'Mulheres'}):</h4>
                  <ul>
                    {sexo === 'masculino' ? (
                      <>
                        <li><strong>2-5%:</strong> Gordura essencial</li>
                        <li><strong>6-13%:</strong> Atletas</li>
                        <li><strong>14-17%:</strong> Fitness</li>
                        <li><strong>18-24%:</strong> Aceitável</li>
                        <li><strong>25%+:</strong> Obesidade</li>
                      </>
                    ) : (
                      <>
                        <li><strong>10-13%:</strong> Gordura essencial</li>
                        <li><strong>14-20%:</strong> Atletas</li>
                        <li><strong>21-24%:</strong> Fitness</li>
                        <li><strong>25-31%:</strong> Aceitável</li>
                        <li><strong>32%+:</strong> Obesidade</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="calculator-disclaimer">
          ⚠️ <strong>Aviso:</strong> Estas calculadoras fornecem estimativas. Para uma avaliação precisa, consulte um profissional de saúde.
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default HealthCalculator

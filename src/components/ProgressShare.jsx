import { useState, useRef, useEffect } from 'react'
import MeasurementAvatar from './MeasurementAvatar'
import './ProgressShare.css'

function ProgressShare({ measurements, weights, profile, onClose }) {
  const canvasRef = useRef(null)
  const cardRef = useRef(null)
  const [selectedStyle, setSelectedStyle] = useState('gradient')
  const [includeAvatar, setIncludeAvatar] = useState(true)
  const [customMessage, setCustomMessage] = useState('')

  // Calculate stats
  const stats = {
    totalWeightLoss: 0,
    totalCinturaLoss: 0,
    days: 0,
    latest: null,
    initial: null
  }

  if (weights && weights.length >= 2) {
    const sorted = [...weights].sort((a, b) => new Date(a.data) - new Date(b.data))
    stats.initial = sorted[0]
    stats.latest = sorted[sorted.length - 1]
    stats.totalWeightLoss = stats.initial.peso - stats.latest.peso
    const daysDiff = new Date(stats.latest.data) - new Date(stats.initial.data)
    stats.days = Math.floor(daysDiff / (1000 * 60 * 60 * 24))
  }

  if (measurements && measurements.length >= 2) {
    const sorted = [...measurements].sort((a, b) => new Date(a.data) - new Date(b.data))
    const initial = sorted[0]
    const latest = sorted[sorted.length - 1]
    if (initial.cintura && latest.cintura) {
      stats.totalCinturaLoss = initial.cintura - latest.cintura
    }
  }

  const generateCard = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = 1080
    canvas.height = 1080

    // Background
    if (selectedStyle === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#667eea')
      gradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = gradient
    } else if (selectedStyle === 'solid') {
      ctx.fillStyle = '#2c3e50'
    } else {
      ctx.fillStyle = '#ffffff'
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Title
    ctx.fillStyle = selectedStyle === 'light' ? '#2c3e50' : '#ffffff'
    ctx.font = 'bold 72px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Minha Transformação', canvas.width / 2, 150)

    // App branding
    ctx.font = '48px Arial'
    ctx.fillText('Emagreci+', canvas.width / 2, 220)

    // Stats Box
    const boxY = 300
    const boxHeight = 500

    // Semi-transparent box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    ctx.roundRect(100, boxY, canvas.width - 200, boxHeight, 30)
    ctx.fill()

    // Stats
    ctx.fillStyle = selectedStyle === 'light' ? '#2c3e50' : '#ffffff'
    let yPos = boxY + 100

    if (stats.totalWeightLoss > 0) {
      ctx.font = 'bold 96px Arial'
      ctx.fillText(`-${stats.totalWeightLoss.toFixed(1)} kg`, canvas.width / 2, yPos)
      ctx.font = '42px Arial'
      yPos += 80
      ctx.fillText('Peso perdido', canvas.width / 2, yPos)
      yPos += 100
    }

    if (stats.totalCinturaLoss > 0) {
      ctx.font = 'bold 72px Arial'
      ctx.fillText(`-${stats.totalCinturaLoss.toFixed(1)} cm`, canvas.width / 2, yPos)
      ctx.font = '38px Arial'
      yPos += 70
      ctx.fillText('Cintura reduzida', canvas.width / 2, yPos)
      yPos += 90
    }

    if (stats.days > 0) {
      ctx.font = '48px Arial'
      ctx.fillText(`Em ${stats.days} dias`, canvas.width / 2, yPos)
    }

    // Custom message
    if (customMessage) {
      ctx.font = 'italic 40px Arial'
      ctx.fillText(`"${customMessage}"`, canvas.width / 2, 900)
    }

    // Footer
    ctx.font = '32px Arial'
    ctx.fillText('Transforme-se com Emagreci+', canvas.width / 2, 1020)
  }

  useEffect(() => {
    if (stats.totalWeightLoss > 0 || stats.totalCinturaLoss > 0) {
      generateCard()
    }
  }, [selectedStyle, customMessage, includeAvatar])

  const downloadCard = () => {
    generateCard()
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `meu-progresso-${new Date().toISOString().split('T')[0]}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const shareToSocial = async (platform) => {
    generateCard()
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'progresso.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Minha Transformação',
            text: `Perdi ${stats.totalWeightLoss.toFixed(1)}kg com Emagreci+!`,
            files: [file]
          })
        } catch (err) {
          console.error('Error sharing:', err)
        }
      } else {
        // Fallback: just download
        downloadCard()
        alert('Imagem baixada! Compartilhe manualmente nas redes sociais.')
      }
    })
  }

  const hasData = stats.totalWeightLoss > 0 || stats.totalCinturaLoss > 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-progress-share" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📢 Compartilhar Progresso</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {!hasData && (
          <div className="no-progress-data">
            <p>📊 Você ainda não tem dados de progresso suficientes</p>
            <small>Registre pelo menos 2 pesagens ou medidas para compartilhar seu progresso!</small>
          </div>
        )}

        {hasData && (
          <>
            <div className="share-controls">
              <div className="control-group">
                <label>Estilo do Card:</label>
                <div className="style-buttons">
                  <button
                    className={`style-btn ${selectedStyle === 'gradient' ? 'active' : ''}`}
                    onClick={() => setSelectedStyle('gradient')}
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                  >
                    Gradiente
                  </button>
                  <button
                    className={`style-btn ${selectedStyle === 'solid' ? 'active' : ''}`}
                    onClick={() => setSelectedStyle('solid')}
                    style={{ background: '#2c3e50' }}
                  >
                    Sólido
                  </button>
                  <button
                    className={`style-btn ${selectedStyle === 'light' ? 'active' : ''}`}
                    onClick={() => setSelectedStyle('light')}
                    style={{ background: '#ffffff', color: '#2c3e50', border: '2px solid #ddd' }}
                  >
                    Claro
                  </button>
                </div>
              </div>

              <div className="control-group">
                <label>Mensagem Personalizada (opcional):</label>
                <input
                  type="text"
                  placeholder="Ex: Focado e determinado!"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  maxLength={50}
                />
              </div>
            </div>

            <div className="card-preview">
              <h3>Preview:</h3>
              <canvas
                ref={canvasRef}
                className="preview-canvas"
              />
            </div>

            <div className="share-actions">
              <button className="btn-download" onClick={downloadCard}>
                📥 Baixar Imagem
              </button>
              <button className="btn-share" onClick={() => shareToSocial('general')}>
                📱 Compartilhar
              </button>
            </div>

            <div className="share-tips">
              <h4>💡 Dicas para compartilhar:</h4>
              <ul>
                <li>Use hashtags como #Emagreci #Transformação #Ozempic</li>
                <li>Marque amigos que estão na jornada com você</li>
                <li>Inspire outras pessoas com sua história</li>
                <li>Compartilhe nos Stories para mais engajamento</li>
              </ul>
            </div>
          </>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProgressShare

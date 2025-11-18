import { useState, useRef, useEffect } from 'react'
import MeasurementAvatar from './MeasurementAvatar'
import './PhotoComparison.css'

function PhotoComparison({ photos, measurements, onClose }) {
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [showAvatars, setShowAvatars] = useState(true)
  const containerRef = useRef(null)
  const exportRef = useRef(null)

  // Find closest measurement for a photo date
  const findClosestMeasurement = (photoDate) => {
    if (!measurements || measurements.length === 0) return null

    const photoTime = new Date(photoDate).getTime()
    let closest = measurements[0]
    let minDiff = Math.abs(new Date(measurements[0].data).getTime() - photoTime)

    measurements.forEach(m => {
      const diff = Math.abs(new Date(m.data).getTime() - photoTime)
      if (diff < minDiff) {
        minDiff = diff
        closest = m
      }
    })

    // Only return if within 7 days
    if (minDiff <= 7 * 24 * 60 * 60 * 1000) {
      return closest
    }
    return null
  }

  const togglePhotoSelection = (photo) => {
    const photoId = photo.id
    if (selectedPhotos.find(p => p.id === photoId)) {
      setSelectedPhotos(selectedPhotos.filter(p => p.id !== photoId))
    } else if (selectedPhotos.length < 2) {
      setSelectedPhotos([...selectedPhotos, photo])
    } else {
      // Replace oldest selection
      setSelectedPhotos([selectedPhotos[1], photo])
    }
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  const handleTouchMove = (e) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setSliderPosition(Math.max(0, Math.min(100, percentage)))
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  const exportComparison = async () => {
    if (!exportRef.current) return

    try {
      // Use html2canvas or similar library to capture the comparison
      // For now, we'll create a simple canvas export
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = 1200
      canvas.height = 600

      // This is a simplified version - in production you'd use html2canvas
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = '24px Arial'
      ctx.fillStyle = '#333'
      ctx.fillText('Comparação de Progresso - Emagreci+', 50, 50)

      // Download
      const link = document.createElement('a')
      link.download = `comparacao-${new Date().toISOString().split('T')[0]}.png`
      link.href = canvas.toDataURL()
      link.click()

      alert('Comparação exportada com sucesso!')
    } catch (err) {
      console.error('Erro ao exportar:', err)
      alert('Erro ao exportar comparação')
    }
  }

  const sortedPhotos = [...photos].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  // Get photos in chronological order (before, after)
  const [beforePhoto, afterPhoto] = selectedPhotos.length === 2
    ? selectedPhotos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    : [null, null]

  const beforeMeasurement = beforePhoto ? findClosestMeasurement(beforePhoto.data) : null
  const afterMeasurement = afterPhoto ? findClosestMeasurement(afterPhoto.data) : null

  const isComparing = selectedPhotos.length === 2

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-photo-comparison" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔄 Comparação de Fotos com Medidas</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {!isComparing && (
          <div className="photo-selection">
            <p className="selection-instruction">
              Selecione 2 fotos para comparar ({selectedPhotos.length}/2)
            </p>
            <div className="photos-grid-compact">
              {sortedPhotos.map(photo => (
                <div
                  key={photo.id}
                  className={`photo-item-compact ${selectedPhotos.find(p => p.id === photo.id) ? 'selected' : ''}`}
                  onClick={() => togglePhotoSelection(photo)}
                >
                  <img src={photo.image} alt="Progresso" />
                  <div className="photo-date">
                    {new Date(photo.data).toLocaleDateString('pt-BR')}
                  </div>
                  {selectedPhotos.find(p => p.id === photo.id) && (
                    <div className="photo-selected-badge">
                      {selectedPhotos.findIndex(p => p.id === photo.id) === 0 ? 'ANTES' : 'DEPOIS'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isComparing && (
          <div className="comparison-view" ref={exportRef}>
            <div className="comparison-controls">
              <button
                className="btn-control"
                onClick={() => setSelectedPhotos([])}
              >
                ← Escolher outras fotos
              </button>
              <label className="avatar-toggle">
                <input
                  type="checkbox"
                  checked={showAvatars}
                  onChange={(e) => setShowAvatars(e.target.checked)}
                />
                Mostrar avatares de medidas
              </label>
              <button className="btn-export" onClick={exportComparison}>
                📥 Exportar Comparação
              </button>
            </div>

            <div
              className="comparison-container"
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={() => setIsDragging(true)}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => setIsDragging(false)}
            >
              {/* After Photo (Full) */}
              <div className="comparison-photo after-photo">
                <img src={afterPhoto.image} alt="Depois" />
                {showAvatars && afterMeasurement && (
                  <div className="avatar-overlay">
                    <MeasurementAvatar measurement={afterMeasurement} compact />
                  </div>
                )}
                <div className="photo-label after-label">
                  DEPOIS - {new Date(afterPhoto.data).toLocaleDateString('pt-BR')}
                </div>
              </div>

              {/* Before Photo (Clipped) */}
              <div
                className="comparison-photo before-photo"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img src={beforePhoto.image} alt="Antes" />
                {showAvatars && beforeMeasurement && (
                  <div className="avatar-overlay">
                    <MeasurementAvatar measurement={beforeMeasurement} compact />
                  </div>
                )}
                <div className="photo-label before-label">
                  ANTES - {new Date(beforePhoto.data).toLocaleDateString('pt-BR')}
                </div>
              </div>

              {/* Slider Handle */}
              <div
                className="slider-handle"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
              >
                <div className="slider-line" />
                <div className="slider-grip">
                  <span>⟨</span>
                  <span>⟩</span>
                </div>
              </div>
            </div>

            {/* Measurements Comparison */}
            {beforeMeasurement && afterMeasurement && (
              <div className="measurements-diff">
                <h3>Evolução das Medidas</h3>
                <div className="diff-grid">
                  {['cintura', 'quadril', 'braco', 'coxa', 'peito'].map(field => {
                    const before = parseFloat(beforeMeasurement[field]) || 0
                    const after = parseFloat(afterMeasurement[field]) || 0
                    const diff = after - before

                    if (!before && !after) return null

                    return (
                      <div key={field} className="diff-item">
                        <div className="diff-label">
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </div>
                        <div className="diff-values">
                          <span className="value-before">{before}cm</span>
                          <span className={`value-diff ${diff < 0 ? 'positive' : diff > 0 ? 'negative' : 'neutral'}`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}cm
                          </span>
                          <span className="value-after">{after}cm</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {(!beforeMeasurement || !afterMeasurement) && (
              <div className="no-measurements-warning">
                ⚠️ Não foram encontradas medidas próximas às datas das fotos selecionadas.
                Registre medidas para ver a evolução completa!
              </div>
            )}
          </div>
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

export default PhotoComparison

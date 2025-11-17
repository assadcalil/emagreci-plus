import { useState, useRef } from 'react'
import './ProgressPhotos.css'

function ProgressPhotos({ photos, onAddPhoto, maxPhotos, onClose }) {
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [isComparing, setIsComparing] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (maxPhotos && photos.length >= maxPhotos) {
      alert(`Limite de ${maxPhotos} fotos por mês atingido`)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const newPhoto = {
        id: `photo_${Date.now()}`,
        data: new Date().toISOString().split('T')[0],
        image: event.target.result,
        timestamp: new Date().toISOString()
      }
      onAddPhoto(newPhoto)
    }
    reader.readAsDataURL(file)
  }

  const togglePhotoSelection = (photoId) => {
    if (selectedPhotos.includes(photoId)) {
      setSelectedPhotos(selectedPhotos.filter(id => id !== photoId))
    } else if (selectedPhotos.length < 2) {
      setSelectedPhotos([...selectedPhotos, photoId])
    }
  }

  const startComparison = () => {
    if (selectedPhotos.length === 2) {
      setIsComparing(true)
    }
  }

  const sortedPhotos = [...photos].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-photos" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📸 Fotos de Progresso</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {/* Comparison View */}
        {isComparing && selectedPhotos.length === 2 && (
          <div className="comparison-view">
            <button className="btn-close-compare" onClick={() => setIsComparing(false)}>
              ← Voltar
            </button>
            <h3>Comparação de Progresso</h3>
            <div className="comparison-container">
              {selectedPhotos.map(photoId => {
                const photo = photos.find(p => p.id === photoId)
                return (
                  <div key={photoId} className="comparison-photo">
                    <img src={photo.image} alt="Progresso" />
                    <div className="comparison-date">
                      {new Date(photo.data).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="comparison-slider">
              <input type="range" min="0" max="100" defaultValue="50" />
              <small>Arraste para comparar</small>
            </div>
          </div>
        )}

        {/* Normal View */}
        {!isComparing && (
          <>
            <div className="photos-actions">
              <button
                className="btn-add-photo"
                onClick={() => fileInputRef.current?.click()}
                disabled={maxPhotos && photos.length >= maxPhotos}
              >
                📷 Adicionar Foto
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {selectedPhotos.length === 2 && (
                <button className="btn-compare" onClick={startComparison}>
                  🔄 Comparar Selecionadas
                </button>
              )}
            </div>

            {maxPhotos && (
              <div className="photos-limit">
                {photos.length}/{maxPhotos} fotos este mês
              </div>
            )}

            {selectedPhotos.length > 0 && (
              <div className="selection-info">
                {selectedPhotos.length}/2 selecionadas para comparação
              </div>
            )}

            <div className="photos-grid">
              {sortedPhotos.length === 0 ? (
                <div className="empty-photos">
                  <span className="empty-icon">📷</span>
                  <p>Nenhuma foto de progresso ainda</p>
                  <small>Tire fotos regularmente para acompanhar sua transformação</small>
                </div>
              ) : (
                sortedPhotos.map(photo => (
                  <div
                    key={photo.id}
                    className={`photo-item ${selectedPhotos.includes(photo.id) ? 'selected' : ''}`}
                    onClick={() => togglePhotoSelection(photo.id)}
                  >
                    <img src={photo.image} alt="Progresso" />
                    <div className="photo-date">
                      {new Date(photo.data).toLocaleDateString('pt-BR')}
                    </div>
                    {selectedPhotos.includes(photo.id) && (
                      <div className="photo-selected-badge">✓</div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="photos-tips">
              <h4>💡 Dicas para melhores fotos:</h4>
              <ul>
                <li>Tire sempre no mesmo local e horário</li>
                <li>Use a mesma roupa (ou roupas similares)</li>
                <li>Mantenha a mesma iluminação</li>
                <li>Fotografe de frente, lado e costas</li>
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

export default ProgressPhotos

import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import './CommunityChat.css'

function CommunityChat({
  messages,
  onSendMessage,
  onShareResult,
  onLikeMessage,
  currentUserId,
  userName,
  weightLoss,
  loading
}) {
  const [newMessage, setNewMessage] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    onSendMessage(newMessage.trim())
    setNewMessage('')
  }

  const handleShareResult = () => {
    const message = shareMessage.trim() || `Perdi ${weightLoss.toFixed(1)} kg no meu tratamento!`
    onShareResult(message, weightLoss)
    setShowShareModal(false)
    setShareMessage('')
  }

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'agora'
    if (diffMins < 60) return `${diffMins}min`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return format(date, 'dd/MM', { locale: ptBR })
  }

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  const getAvatarColor = (name) => {
    const colors = [
      '#38b2ac', '#ed8936', '#48bb78', '#f56565',
      '#667eea', '#805ad5', '#d69e2e', '#3182ce'
    ]
    const index = name ? name.length % colors.length : 0
    return colors[index]
  }

  if (loading) {
    return (
      <div className="community-loading">
        <div className="loading-spinner"></div>
        <p>Carregando comunidade...</p>
      </div>
    )
  }

  return (
    <div className="community-chat">
      <div className="chat-header">
        <div className="header-info">
          <h2>💬 Comunidade Emagreci+</h2>
          <p>{messages.length} mensagens</p>
        </div>
        {weightLoss > 0 && (
          <button
            className="share-result-btn"
            onClick={() => setShowShareModal(true)}
          >
            🎉 Compartilhar Resultado
          </button>
        )}
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-icon">💬</div>
            <h3>Seja o primeiro a compartilhar!</h3>
            <p>Compartilhe seus resultados e motive outras pessoas</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isOwnMessage = msg.user_id === currentUserId
              const hasLiked = msg.likes?.includes(currentUserId)

              return (
                <div
                  key={msg.id}
                  className={`message ${isOwnMessage ? 'own-message' : ''} ${msg.type === 'result' ? 'result-message' : ''}`}
                >
                  <div
                    className="message-avatar"
                    style={{ backgroundColor: getAvatarColor(msg.user_name) }}
                  >
                    {getInitials(msg.user_name)}
                  </div>

                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-author">
                        {isOwnMessage ? 'Você' : msg.user_name}
                      </span>
                      <span className="message-time">
                        {formatMessageTime(msg.created_at)}
                      </span>
                    </div>

                    {msg.type === 'result' && msg.weight_loss && (
                      <div className="result-badge">
                        <span className="result-icon">🏆</span>
                        <span className="result-value">
                          -{msg.weight_loss.toFixed(1)} kg
                        </span>
                      </div>
                    )}

                    <div className="message-text">
                      {msg.content}
                    </div>

                    <div className="message-actions">
                      <button
                        className={`like-btn ${hasLiked ? 'liked' : ''}`}
                        onClick={() => onLikeMessage(msg.id)}
                      >
                        {hasLiked ? '❤️' : '🤍'} {msg.likes?.length || 0}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          maxLength={500}
        />
        <button type="submit" disabled={!newMessage.trim()}>
          Enviar
        </button>
      </form>

      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎉 Compartilhar Resultado</h3>
              <button
                className="close-button"
                onClick={() => setShowShareModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="share-preview">
              <div className="result-card">
                <div className="result-icon-large">🏆</div>
                <div className="result-stats">
                  <span className="weight-lost">-{weightLoss.toFixed(1)} kg</span>
                  <span className="result-label">perdidos</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Adicione uma mensagem (opcional)</label>
              <textarea
                rows="3"
                placeholder="Conte como foi sua jornada..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                maxLength={300}
              />
              <span className="char-count">{shareMessage.length}/300</span>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowShareModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleShareResult}
              >
                🚀 Compartilhar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityChat

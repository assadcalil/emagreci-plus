import { useState, useEffect } from 'react'
import './ReminderSettings.css'

function ReminderSettings({ reminders, onUpdate, onClose, onSuccess }) {
  const [settings, setSettings] = useState(reminders)

  const diasSemana = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ]

  // Verificar se tem suporte a notificações
  const [notificationSupport, setNotificationSupport] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState('default')

  useEffect(() => {
    if ('Notification' in window) {
      // Usar timeout para evitar cascade render
      const timer = setTimeout(() => {
        setNotificationSupport(true)
        setPermissionStatus(Notification.permission)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [])

  const requestPermission = async () => {
    if (!notificationSupport) return

    try {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)
      if (permission === 'granted') {
        onSuccess('Notificações ativadas com sucesso!')
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }

  const handleSave = () => {
    onUpdate(settings)
    onSuccess('Configurações de lembrete salvas!')
    onClose()
  }

  const testNotification = () => {
    if (permissionStatus === 'granted') {
      new Notification('Emagreci+ - Lembrete', {
        body: 'Hora de aplicar sua dose! 💉',
        icon: '💉',
        badge: '💉'
      })
      onSuccess('Notificação de teste enviada!')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⏰ Lembretes de Dose</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="reminder-form">
          {!notificationSupport && (
            <div className="warning-banner">
              ⚠️ Seu navegador não suporta notificações
            </div>
          )}

          {notificationSupport && permissionStatus === 'denied' && (
            <div className="error-banner">
              ❌ Notificações bloqueadas. Altere nas configurações do navegador.
            </div>
          )}

          {notificationSupport && permissionStatus === 'default' && (
            <div className="info-banner">
              <p>Para receber lembretes, ative as notificações:</p>
              <button className="btn-primary btn-small" onClick={requestPermission}>
                🔔 Ativar Notificações
              </button>
            </div>
          )}

          <div className="form-group">
            <label className="switch-label">
              <span>Ativar lembretes</span>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="switch-input"
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          {settings.enabled && (
            <>
              <div className="form-group">
                <label>📅 Dia da semana</label>
                <select
                  value={settings.dayOfWeek}
                  onChange={(e) => setSettings({ ...settings, dayOfWeek: parseInt(e.target.value) })}
                >
                  {diasSemana.map(dia => (
                    <option key={dia.value} value={dia.value}>{dia.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>🕐 Horário</label>
                <input
                  type="time"
                  value={settings.time}
                  onChange={(e) => setSettings({ ...settings, time: e.target.value })}
                />
              </div>

              <div className="reminder-preview">
                <h4>📌 Resumo</h4>
                <p>
                  Você receberá um lembrete toda <strong>{diasSemana.find(d => d.value === settings.dayOfWeek)?.label}</strong> às <strong>{settings.time}</strong>.
                </p>
              </div>

              {permissionStatus === 'granted' && (
                <button
                  type="button"
                  className="btn-test"
                  onClick={testNotification}
                >
                  🔔 Testar Notificação
                </button>
              )}
            </>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReminderSettings

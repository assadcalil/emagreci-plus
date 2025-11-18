import { useState, useEffect } from 'react'
import './MeasurementReminder.css'

const FREQUENCIES = {
  '7': { label: 'Semanal (7 dias)', days: 7 },
  '14': { label: 'Quinzenal (14 dias)', days: 14 },
  '30': { label: 'Mensal (30 dias)', days: 30 },
  'custom': { label: 'Personalizado', days: null }
}

function MeasurementReminder({ measurements, onClose }) {
  const [remindersEnabled, setRemindersEnabled] = useState(false)
  const [frequency, setFrequency] = useState('7')
  const [customDays, setCustomDays] = useState(7)
  const [notificationsPermission, setNotificationsPermission] = useState('default')
  const [lastMeasurementDate, setLastMeasurementDate] = useState(null)
  const [nextReminderDate, setNextReminderDate] = useState(null)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('measurementReminderSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setRemindersEnabled(settings.enabled || false)
      setFrequency(settings.frequency || '7')
      setCustomDays(settings.customDays || 7)
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsPermission(Notification.permission)
    }
  }, [])

  // Calculate last measurement and next reminder
  useEffect(() => {
    if (!measurements || measurements.length === 0) {
      setLastMeasurementDate(null)
      setNextReminderDate(null)
      return
    }

    const sorted = [...measurements].sort((a, b) => new Date(b.data) - new Date(a.data))
    const last = new Date(sorted[0].data)
    setLastMeasurementDate(last)

    const days = frequency === 'custom' ? customDays : FREQUENCIES[frequency].days
    const next = new Date(last.getTime() + days * 24 * 60 * 60 * 1000)
    setNextReminderDate(next)
  }, [measurements, frequency, customDays])

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      setNotificationsPermission(permission)
      return permission === 'granted'
    }
    return Notification.permission === 'granted'
  }

  const saveSettings = () => {
    const settings = {
      enabled: remindersEnabled,
      frequency,
      customDays
    }
    localStorage.setItem('measurementReminderSettings', JSON.stringify(settings))

    // Set up reminder check
    if (remindersEnabled && nextReminderDate) {
      localStorage.setItem('nextMeasurementReminder', nextReminderDate.toISOString())
    } else {
      localStorage.removeItem('nextMeasurementReminder')
    }
  }

  const handleToggleReminders = async (enabled) => {
    if (enabled) {
      const hasPermission = await requestNotificationPermission()
      if (!hasPermission) {
        alert('Permissão de notificações negada. Ative nas configurações do navegador para receber lembretes.')
        return
      }
    }
    setRemindersEnabled(enabled)
  }

  const handleSave = () => {
    saveSettings()
    onClose()
  }

  const testNotification = () => {
    if (notificationsPermission === 'granted') {
      new Notification('Emagreci+ Lembrete', {
        body: 'Hora de registrar suas medidas corporais! 📏',
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      })
    } else {
      alert('Permissão de notificações não concedida')
    }
  }

  const getDaysSinceLastMeasurement = () => {
    if (!lastMeasurementDate) return null
    const now = new Date()
    const diff = now.getTime() - lastMeasurementDate.getTime()
    return Math.floor(diff / (24 * 60 * 60 * 1000))
  }

  const getDaysUntilNextReminder = () => {
    if (!nextReminderDate) return null
    const now = new Date()
    const diff = nextReminderDate.getTime() - now.getTime()
    return Math.ceil(diff / (24 * 60 * 60 * 1000))
  }

  const daysSinceLast = getDaysSinceLastMeasurement()
  const daysUntilNext = getDaysUntilNextReminder()
  const isOverdue = daysUntilNext !== null && daysUntilNext < 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-measurement-reminder" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔔 Lembretes de Medição</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="reminder-intro">
          <p>Configure lembretes para não esquecer de registrar suas medidas!</p>
        </div>

        {/* Status */}
        {lastMeasurementDate && (
          <div className={`measurement-status ${isOverdue ? 'overdue' : 'on-track'}`}>
            <div className="status-item">
              <span className="status-label">Última medição:</span>
              <span className="status-value">
                {lastMeasurementDate.toLocaleDateString('pt-BR')}
                {daysSinceLast !== null && ` (há ${daysSinceLast} dia${daysSinceLast !== 1 ? 's' : ''})`}
              </span>
            </div>
            {nextReminderDate && (
              <div className="status-item">
                <span className="status-label">Próximo lembrete:</span>
                <span className="status-value">
                  {nextReminderDate.toLocaleDateString('pt-BR')}
                  {daysUntilNext !== null && (
                    isOverdue
                      ? ` (atrasado ${Math.abs(daysUntilNext)} dia${Math.abs(daysUntilNext) !== 1 ? 's' : ''}!)`
                      : ` (em ${daysUntilNext} dia${daysUntilNext !== 1 ? 's' : ''})`
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {!lastMeasurementDate && (
          <div className="no-measurements-warning">
            ⚠️ Você ainda não registrou nenhuma medida. Registre a primeira para ativar lembretes!
          </div>
        )}

        {/* Enable/Disable Toggle */}
        <div className="reminder-setting">
          <div className="setting-header">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={remindersEnabled}
                onChange={(e) => handleToggleReminders(e.target.checked)}
                disabled={!lastMeasurementDate}
              />
              <span className="toggle-text">Ativar Lembretes</span>
            </label>
          </div>
        </div>

        {/* Frequency Selection */}
        {remindersEnabled && (
          <div className="reminder-setting">
            <label className="setting-label">Frequência dos Lembretes:</label>
            <div className="frequency-options">
              {Object.entries(FREQUENCIES).map(([key, config]) => (
                <button
                  key={key}
                  className={`frequency-btn ${frequency === key ? 'active' : ''}`}
                  onClick={() => setFrequency(key)}
                >
                  {config.label}
                </button>
              ))}
            </div>

            {frequency === 'custom' && (
              <div className="custom-days-input">
                <label>A cada quantos dias?</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value) || 7)}
                />
                <span>dias</span>
              </div>
            )}
          </div>
        )}

        {/* Notification Permission Status */}
        <div className="permission-status">
          <div className="permission-info">
            <span className="permission-label">Status das Notificações:</span>
            <span className={`permission-badge ${notificationsPermission}`}>
              {notificationsPermission === 'granted' && '✅ Permitidas'}
              {notificationsPermission === 'denied' && '❌ Bloqueadas'}
              {notificationsPermission === 'default' && '⚠️ Não configuradas'}
            </span>
          </div>
          {notificationsPermission === 'denied' && (
            <p className="permission-help">
              Para ativar notificações, acesse as configurações do navegador e permita notificações para este site.
            </p>
          )}
          {notificationsPermission === 'granted' && (
            <button className="btn-test-notification" onClick={testNotification}>
              🔔 Testar Notificação
            </button>
          )}
        </div>

        {/* How it Works */}
        <div className="reminder-info">
          <h3>Como funciona?</h3>
          <ul>
            <li>Os lembretes são baseados na data da sua última medição</li>
            <li>Você receberá uma notificação quando chegar o dia de medir</li>
            <li>As notificações aparecem mesmo quando o app estiver fechado</li>
            <li>Você pode alterar a frequência a qualquer momento</li>
          </ul>
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

export default MeasurementReminder

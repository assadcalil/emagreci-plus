import './ThemeToggle.css'

function ThemeToggle({ darkMode, onToggle }) {
  return (
    <button
      className={`theme-toggle ${darkMode ? 'dark' : 'light'}`}
      onClick={onToggle}
      title={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  )
}

export default ThemeToggle

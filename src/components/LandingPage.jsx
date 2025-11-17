import React, { useState } from 'react'
import './LandingPage.css'

const LandingPage = ({ onStart }) => {
  const [showPrivacy, setShowPrivacy] = useState(false)

  const testimonials = [
    {
      name: 'Maria S.',
      age: 42,
      location: 'São Paulo, SP',
      weightLost: '18kg',
      time: '4 meses',
      text: 'O app me ajudou a manter o controle das doses e acompanhar minha evolução. Perdi 18kg com segurança!',
      rating: 5
    },
    {
      name: 'Carlos R.',
      age: 38,
      location: 'Rio de Janeiro, RJ',
      weightLost: '12kg',
      time: '3 meses',
      text: 'Excelente para registrar efeitos colaterais e mostrar para meu médico. O relatório PDF é perfeito!',
      rating: 5
    },
    {
      name: 'Ana L.',
      age: 35,
      location: 'Belo Horizonte, MG',
      weightLost: '22kg',
      time: '5 meses',
      text: 'A comunidade é incrível! Ver outros relatos me motivou muito na minha jornada.',
      rating: 5
    },
    {
      name: 'Roberto M.',
      age: 45,
      location: 'Curitiba, PR',
      weightLost: '15kg',
      time: '3.5 meses',
      text: 'Adorei o mapa de injeção que ajuda a alternar os locais. Muito profissional!',
      rating: 5
    }
  ]

  const features = [
    {
      icon: '💉',
      title: 'Registro de Doses',
      description: 'Controle completo de dosagens, locais de aplicação e horários'
    },
    {
      icon: '📊',
      title: 'Gráficos de Evolução',
      description: 'Acompanhe seu progresso com gráficos detalhados de peso'
    },
    {
      icon: '📄',
      title: 'Relatório para Médico',
      description: 'Exporte PDF profissional com todos os dados para seu médico'
    },
    {
      icon: '🎯',
      title: 'Metas Personalizadas',
      description: 'Defina e acompanhe suas metas de emagrecimento'
    },
    {
      icon: '⚠️',
      title: 'Efeitos Colaterais',
      description: 'Registre e monitore qualquer efeito colateral'
    },
    {
      icon: '📏',
      title: 'Medidas Corporais',
      description: 'Acompanhe cintura, quadril, braços e mais'
    }
  ]

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-content">
          <div className="hero-badge">✨ Aplicativo #1 para GLP-1</div>
          <h1 className="hero-title">
            Controle sua jornada com
            <span className="hero-highlight"> Emagreci+</span>
          </h1>
          <p className="hero-subtitle">
            O aplicativo mais completo para acompanhamento de medicamentos GLP-1.
            Registre doses, monitore seu progresso e alcance seus objetivos com segurança.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10.000+</span>
              <span className="stat-label">Usuários Ativos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50.000kg</span>
              <span className="stat-label">Peso Perdido</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">4.9★</span>
              <span className="stat-label">Avaliação</span>
            </div>
          </div>
          <button className="hero-cta" onClick={onStart}>
            Começar Agora - Grátis por 3 Dias
          </button>
          <p className="hero-note">Sem cartão de crédito. Cancele quando quiser.</p>
        </div>
        <div className="hero-visual">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="mockup-header">Emagreci+</div>
              <div className="mockup-chart">📈</div>
              <div className="mockup-stats">
                <div className="mockup-stat">-12kg</div>
                <div className="mockup-stat">85%</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="landing-features">
        <h2 className="section-title">Tudo que você precisa em um só lugar</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="landing-testimonials">
        <h2 className="section-title">Histórias de Sucesso</h2>
        <p className="section-subtitle">
          Veja o que nossos usuários estão dizendo sobre sua jornada com Emagreci+
        </p>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.age} anos • {testimonial.location}</p>
                </div>
              </div>
              <div className="testimonial-results">
                <span className="result-badge">-{testimonial.weightLost}</span>
                <span className="result-time">em {testimonial.time}</span>
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-rating">
                {'★'.repeat(testimonial.rating)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Section */}
      <section className="landing-community">
        <div className="community-content">
          <h2 className="section-title">Comunidade de Apoio</h2>
          <p className="community-description">
            Junte-se a milhares de pessoas que estão transformando suas vidas.
            Compartilhe experiências, tire dúvidas e inspire outros na jornada.
          </p>
          <div className="community-features">
            <div className="community-feature">
              <span className="community-icon">💬</span>
              <span>Relatos Reais</span>
            </div>
            <div className="community-feature">
              <span className="community-icon">📸</span>
              <span>Fotos de Progresso</span>
            </div>
            <div className="community-feature">
              <span className="community-icon">🤝</span>
              <span>Suporte Mútuo</span>
            </div>
            <div className="community-feature">
              <span className="community-icon">📚</span>
              <span>Dicas e Experiências</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="landing-pricing">
        <h2 className="section-title">Planos Acessíveis</h2>
        <div className="pricing-cards">
          <div className="pricing-card">
            <h3>Básico</h3>
            <div className="price">R$ 19,90<span>/mês</span></div>
            <ul>
              <li>✓ Registro de doses</li>
              <li>✓ Controle de peso</li>
              <li>✓ Lembretes</li>
            </ul>
          </div>
          <div className="pricing-card featured">
            <div className="popular-badge">Mais Popular</div>
            <h3>Pro</h3>
            <div className="price">R$ 39,90<span>/mês</span></div>
            <ul>
              <li>✓ Tudo do Básico</li>
              <li>✓ Medidas corporais</li>
              <li>✓ Efeitos colaterais</li>
              <li>✓ Mapa de injeção</li>
              <li>✓ Exportar PDF</li>
            </ul>
          </div>
          <div className="pricing-card">
            <h3>Premium</h3>
            <div className="price">R$ 69,90<span>/mês</span></div>
            <ul>
              <li>✓ Tudo do Pro</li>
              <li>✓ Avatar de transformação</li>
              <li>✓ Nutrição avançada</li>
              <li>✓ Fotos de progresso</li>
              <li>✓ Suporte prioritário</li>
            </ul>
          </div>
        </div>
        <button className="hero-cta" onClick={onStart}>
          Experimentar Grátis por 3 Dias
        </button>
      </section>

      {/* LGPD Section */}
      <section className="landing-lgpd">
        <div className="lgpd-content">
          <div className="lgpd-icon">🔒</div>
          <h3>Seus Dados Estão Seguros</h3>
          <p>
            O Emagreci+ está em total conformidade com a{' '}
            <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
          </p>
          <ul className="lgpd-list">
            <li>✓ Seus dados são armazenados localmente no seu dispositivo</li>
            <li>✓ Não compartilhamos informações com terceiros</li>
            <li>✓ Você tem controle total sobre seus dados</li>
            <li>✓ Pode exportar ou excluir seus dados a qualquer momento</li>
            <li>✓ Criptografia de ponta a ponta</li>
          </ul>
          <button
            className="lgpd-button"
            onClick={() => setShowPrivacy(true)}
          >
            Ler Política de Privacidade Completa
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>💊 Emagreci+</h3>
            <p>Seu parceiro na jornada de emagrecimento saudável</p>
          </div>
          <div className="footer-links">
            <button onClick={() => setShowPrivacy(true)}>Privacidade</button>
            <button onClick={() => setShowPrivacy(true)}>Termos de Uso</button>
            <button onClick={() => setShowPrivacy(true)}>LGPD</button>
          </div>
          <div className="footer-compliance">
            <p>© 2024 Emagreci+. Todos os direitos reservados.</p>
            <p>Em conformidade com a LGPD (Lei nº 13.709/2018)</p>
          </div>
        </div>
      </footer>

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="privacy-modal-overlay" onClick={() => setShowPrivacy(false)}>
          <div className="privacy-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowPrivacy(false)}>✕</button>
            <h2>Política de Privacidade e LGPD</h2>
            <div className="privacy-content">
              <h3>1. Coleta de Dados</h3>
              <p>
                O Emagreci+ coleta apenas os dados que você fornece voluntariamente,
                incluindo: peso, medidas corporais, registros de doses, e informações
                de saúde relacionadas ao uso de medicamentos GLP-1.
              </p>

              <h3>2. Armazenamento</h3>
              <p>
                Todos os seus dados são armazenados <strong>localmente no seu dispositivo</strong>
                usando a tecnologia localStorage do navegador. Não utilizamos servidores externos
                para armazenar suas informações pessoais de saúde.
              </p>

              <h3>3. Seus Direitos (LGPD)</h3>
              <p>Conforme a Lei nº 13.709/2018, você tem direito a:</p>
              <ul>
                <li>Acessar seus dados a qualquer momento</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Exportar seus dados em formato PDF ou JSON</li>
                <li>Excluir permanentemente seus dados</li>
                <li>Revogar consentimento</li>
              </ul>

              <h3>4. Compartilhamento</h3>
              <p>
                <strong>Não compartilhamos</strong> seus dados com terceiros, empresas de marketing,
                ou qualquer outra entidade. A única forma de compartilhar dados é através
                da função de exportação, que você controla completamente.
              </p>

              <h3>5. Segurança</h3>
              <p>
                Implementamos medidas técnicas para proteger seus dados, incluindo
                armazenamento local seguro e sem transmissão de dados pela internet.
              </p>

              <h3>6. Contato</h3>
              <p>
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade,
                entre em contato conosco através do aplicativo.
              </p>

              <div className="privacy-footer">
                <p><strong>Última atualização:</strong> Novembro de 2024</p>
                <p><strong>Versão:</strong> 1.0</p>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setShowPrivacy(false)}>
              Li e Concordo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage

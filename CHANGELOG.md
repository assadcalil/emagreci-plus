# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Adicionado (2025-11-18)

#### 🎯 Sistema de Visualização do Plano
- **PlanDropdown Component**: Novo componente dropdown para visualização detalhada do plano contratado
  - Exibição de informações do plano (nome, ícone, valor, período)
  - Contador de dias restantes até renovação
  - Lista dos 5 principais recursos inclusos
  - Badges visuais de status (Trial/Ativo)
  - Botão de upgrade para próximo tier
  - Acesso rápido ao suporte (baseado no plano)
  - Link para gerenciamento de assinatura
  - Localização: Header do dashboard, ao lado do botão de sair
  - Arquivos: `src/components/PlanDropdown.jsx`, `src/components/PlanDropdown.css`

#### 📐 Sistema de Avatar de Medidas Corporais
- **MeasurementAvatar Component**: Visualização gráfica das medidas corporais
  - Avatar SVG anatomicamente correto representando o corpo humano
  - 5 pontos de medição: Pescoço, Braço, Cintura, Quadril, Coxa
  - Badges interativos mostrando valores das medidas
  - Modo de progresso com comparação automática:
    - Primeira medição vs. Última medição
    - Cálculo de diferença em centímetros
    - Cálculo de percentual de mudança
  - Indicadores visuais coloridos:
    - Verde (▼) para redução (progresso positivo)
    - Vermelho (▲) para aumento
  - Design totalmente responsivo (mobile, tablet, desktop)
  - Estado vazio amigável quando não há medidas
  - Arquivos: `src/components/MeasurementAvatar.jsx`, `src/components/MeasurementAvatar.css`

#### 📊 Integrações no Dashboard
- Avatar de medidas integrado na **aba principal do Dashboard**
  - Seção "Suas Medidas Corporais"
  - Aparece após o mapa de injeção
  - Visível apenas para planos Pro+ com medidas registradas
  - Localização: `src/App.jsx:621-626`

- Avatar de medidas integrado na **aba Progresso**
  - Seção dedicada "Avatar de Medidas Corporais"
  - Exibição completa com modo de progresso ativado
  - Complementada por lista das últimas 3 medições
  - Localização: `src/App.jsx:664-684`

#### 📄 Integração no Relatório PDF
- **generateMeasurementAvatar()**: Nova função para renderização do avatar em PDF
  - Avatar SVG completo com corpo humano
  - Badges posicionados absolutamente em cada parte do corpo
  - Comparação visual entre primeira e última medição
  - Indicadores de progresso com cores
  - Legenda explicativa no rodapé
  - Quebra de página inteligente (`page-break-inside: avoid`)
  - Localização: `src/components/ExportData.jsx:406-542`
  - Integrado em: `src/components/ExportData.jsx:744`

#### 📚 Documentação
- `PULL_REQUEST.md`: Descrição completa da PR para review
- `docs/GUIA_USUARIO_MEDIDAS.md`: Guia completo para usuários finais
  - Como visualizar o plano contratado
  - Como registrar medidas corporais
  - Como interpretar o avatar de medidas
  - Como gerar relatório PDF
  - Dicas de uso e melhores práticas
  - FAQ

### Modificado

#### src/App.jsx
- Importação dos novos componentes `PlanDropdown` e `MeasurementAvatar`
- Substituição do texto do plano por componente dropdown interativo
- Adição do avatar de medidas na aba principal do dashboard
- Adição do avatar de medidas na aba de progresso
- Linhas modificadas: 20-22, 454-497, 619-626, 662-686

#### src/components/ExportData.jsx
- Adição da função `generateMeasurementAvatar()` para PDF
- Integração do avatar no fluxo de geração do PDF
- Linhas adicionadas: 406-542
- Linhas modificadas: 744

### Melhorias de UX/UI
- ✅ Design responsivo em todos os componentes
- ✅ Animações suaves com transições CSS
- ✅ Cores contrastantes para melhor acessibilidade
- ✅ Estados vazios informativos
- ✅ Feedback visual imediato nas interações
- ✅ Tooltips e labels descritivos

### Performance
- ✅ Uso de `useMemo` para otimização de cálculos
- ✅ Renderização condicional para evitar processamento desnecessário
- ✅ CSS separado em arquivos individuais
- ✅ SVG inline para evitar requisições adicionais

### Técnico
- ✅ Build compilado com sucesso (862 KB)
- ✅ 0 vulnerabilidades detectadas
- ✅ Compatibilidade com React 18+
- ✅ Compatibilidade com Vite 7+
- ✅ Suporte a navegadores modernos

---

## [1.0.0] - 2025-11-XX (Versão anterior)

### Funcionalidades Existentes
- Sistema de autenticação com Supabase
- Registro de doses
- Registro de peso
- Gráficos de evolução
- Sistema de metas
- Efeitos colaterais
- Fotos de progresso
- Comunidade exclusiva
- Integração com Stripe
- Sistema de planos (Básico, Pro, Premium)
- Exportação de dados (CSV, JSON, TXT, PDF)

---

## Notas de Versão

### Compatibilidade
- **Navegadores suportados**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Dispositivos**: Desktop, Tablet, Mobile
- **Node.js**: 16.x ou superior
- **React**: 18.x
- **Vite**: 7.x

### Dependências Principais
- React 18.3.1
- Supabase Client 2.49.1
- date-fns 4.1.0
- react-toastify 11.0.2
- Stripe.js 4.11.0

### Breaking Changes
Nenhuma mudança breaking nesta versão.

### Avisos
- Bundle size aumentou para 862 KB (considerar code-splitting em versões futuras)

---

## Roadmap Futuro

Veja `MELHORIAS_FUTURAS.md` para lista completa de melhorias planejadas.

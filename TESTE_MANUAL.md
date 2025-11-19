# 🧪 Guia de Teste Manual - Emagreci+

## ✅ Status do Servidor
- **Dev Server**: http://localhost:5173/
- **Status**: ✅ Rodando
- **Build**: ✅ Funcionando (870KB JS + 88KB CSS)

---

## 🔍 Análise Completa Realizada

### ✅ Configuração do Supabase
- **URL**: https://bpsefvzzpabxivehsepd.supabase.co
- **Anon Key**: ✅ Configurado
- **Auto Refresh Token**: ✅ Ativado
- **Persist Session**: ✅ Ativado

### ✅ Estrutura do Banco de Dados
Todas as tabelas criadas:
- ✅ `profiles` - Perfis dos usuários
- ✅ `subscriptions` - Assinaturas (Stripe)
- ✅ `doses` - Registro de doses
- ✅ `weights` - Registro de peso
- ✅ `measurements` - Medidas corporais
- ✅ `side_effects` - Efeitos colaterais
- ✅ `goals` - Metas
- ✅ `progress_photos` - Fotos de progresso
- ✅ `nutrition_entries` - Nutrição
- ✅ `reminders` - Lembretes
- ✅ `community_messages` - Comunidade

### ✅ RLS (Row Level Security)
- ✅ RLS ativado em TODAS as tabelas
- ✅ Políticas de SELECT implementadas
- ✅ Políticas de INSERT implementadas
- ⚠️ **Faltam políticas UPDATE** em:
  - `weights` - Não permite atualizar peso
  - `measurements` - ATUALIZAÇÃO JÁ IMPLEMENTADA no código! ✅
  - `side_effects` - Não permite atualizar efeitos
- ⚠️ **Faltam políticas DELETE** em:
  - `nutrition_entries` - Não permite deletar entradas
  - `reminders` - Não permite deletar lembretes

### ✅ Triggers e Funções
- ✅ `handle_new_user()` - Cria perfil automaticamente no signup
- ✅ `update_updated_at_column()` - Atualiza timestamp automaticamente
- ⚠️ **Vulnerabilidade de Segurança Menor**: Funções sem `search_path` definido

---

## 🧪 Roteiro de Teste Manual

### 1️⃣ Teste de Cadastro (Signup)

**Passos:**
1. Acesse http://localhost:5173/
2. Clique em "Começar" ou "Cadastre-se grátis"
3. Preencha o formulário:
   - **Nome**: Seu nome completo
   - **Email**: teste@exemplo.com
   - **Senha**: Teste123 (mínimo 8 caracteres, maiúsculas, minúsculas e números)
   - **Confirmar Senha**: Teste123

**✅ Verificações:**
- [ ] Indicador de força da senha aparece (cores: vermelha → amarela → verde)
- [ ] Senha "Teste123" deve mostrar "Boa" ou "Excelente"
- [ ] Senha fraca (ex: "teste123") mostra erro "Senha deve conter letras maiúsculas"
- [ ] Senha muito curta (ex: "Test12") mostra erro "Senha deve ter no mínimo 8 caracteres"
- [ ] Senhas não coincidem mostra erro "As senhas não coincidem"
- [ ] Após sucesso, redireciona para o quiz de perfil

**🐛 Problemas Esperados:**
- ✅ Nenhum problema esperado no cadastro

---

### 2️⃣ Teste de Login

**Passos:**
1. Faça logout (se estiver logado)
2. Na tela de auth, clique em "Faça login"
3. Entre com:
   - **Email**: teste@exemplo.com
   - **Senha**: Teste123

**✅ Verificações:**
- [ ] Login bem-sucedido redireciona para dashboard ou quiz
- [ ] Senha incorreta mostra erro "Email ou senha incorretos"
- [ ] Email não cadastrado mostra erro apropriado
- [ ] Loading spinner aparece durante login

**🐛 Problemas Esperados:**
- ✅ Nenhum problema esperado no login

---

### 3️⃣ Teste do Quiz de Perfil

**Passos:**
1. Após primeiro login, o quiz aparece automaticamente
2. Preencha cada pergunta:
   - Nome
   - Idade (ex: 30)
   - Altura (ex: 175 cm)
   - Peso Atual (ex: 85 kg)
   - Tipo de Caneta (Ozempic/Saxenda/Wegovy)
   - Objetivo
   - Experiência

**✅ Verificações:**
- [ ] Barra de progresso aumenta a cada pergunta
- [ ] Botão "Voltar" funciona
- [ ] Validações de idade, altura e peso funcionam
- [ ] Após completar, salva no banco e redireciona para paywall

**🐛 Problemas Esperados:**
- ✅ Validações robustas implementadas

---

### 4️⃣ Teste de Paywall/Trial

**Passos:**
1. Na tela de paywall, clique em "Iniciar Trial de 3 dias"
2. Ou escolha um plano (Basic/Pro/Premium)

**✅ Verificações:**
- [ ] Trial ativa e redireciona para dashboard
- [ ] Banner mostra "Teste grátis: X dias restantes"
- [ ] Após trial, recursos locked aparecem com 🔒

**🐛 Problemas Esperados:**
- ⚠️ Pagamento Stripe não está totalmente configurado (modo demo)

---

### 5️⃣ Teste de Registro de Dose 💉

**Passos:**
1. No dashboard, clique em "Dose"
2. Preencha:
   - Data: Hoje
   - Horário: Hora atual
   - Dosagem: 0.5 mg
   - Local: Abdômen
   - Observações (opcional)
3. Clique em "Salvar Dose"

**✅ Verificações:**
- [ ] Dose aparece na lista "Doses Recentes"
- [ ] Validação impede dosagem <= 0 ou > 15mg
- [ ] Validação impede data futura
- [ ] Toast de sucesso aparece
- [ ] Mapa de injeção atualiza (se ativado)

**🐛 Problemas Esperados:**
- ✅ Funcionando perfeitamente

---

### 6️⃣ Teste de Registro de Peso ⚖️

**Passos:**
1. Clique em "Peso"
2. Preencha:
   - Data: Hoje
   - Peso: 84.5 kg
   - Observações (opcional)
3. Salvar

**✅ Verificações:**
- [ ] Peso salva com sucesso
- [ ] Gráfico de evolução atualiza
- [ ] Card "Peso Atual" no dashboard atualiza
- [ ] Validação impede peso < 20kg ou > 400kg
- [ ] Validação impede mais de 1 casa decimal

**⚠️ PROBLEMA CONHECIDO:**
- **Não é possível EDITAR peso depois de salvar** (falta UPDATE policy no banco)

---

### 7️⃣ Teste de Medidas Corporais 📏

**Passos:**
1. Clique em "Medidas" (requer plano Pro+)
2. Preencha:
   - Data: Hoje
   - Cintura: 90 cm
   - Quadril: 100 cm
   - Braço: 35 cm
   - Coxa: 55 cm
   - Peito: 100 cm
3. Salvar

**✅ Verificações:**
- [ ] Medidas salvam com sucesso
- [ ] Avatar de medidas aparece
- [ ] Possível EDITAR medida clicando no ✏️
- [ ] Possível DELETAR medida clicando no 🗑️
- [ ] Validações de range funcionam

**✅ STATUS:**
- ✅ **UPDATE e DELETE JÁ IMPLEMENTADOS!**

---

### 8️⃣ Teste de Efeitos Colaterais 🩺

**Passos:**
1. Clique em "Efeitos" (requer plano Pro+)
2. Preencha:
   - Data: Hoje
   - Tipo: Náusea
   - Intensidade: 3/5
   - Duração: 2 horas
3. Salvar

**✅ Verificações:**
- [ ] Efeito salva com sucesso
- [ ] Aparece na lista de efeitos recentes
- [ ] Ícone do tipo aparece corretamente

**⚠️ PROBLEMA CONHECIDO:**
- **Não é possível EDITAR ou DELETAR efeito** (falta UPDATE/DELETE policy)

---

### 9️⃣ Teste de Nutrição 🥗

**Passos:**
1. Clique em "Nutrição" (requer plano Pro+)
2. Preencha macros e água
3. Salvar

**✅ Verificações:**
- [ ] Dados salvam (se implementado no backend)

**⚠️ STATUS:**
- ⚠️ Backend de nutrição pode não estar completo

---

### 🔟 Teste de Logout

**Passos:**
1. Clique no botão 🚪 no header
2. Confirme "Tem certeza que deseja sair?"

**✅ Verificações:**
- [ ] Redireciona para landing page
- [ ] Session limpa (não volta automaticamente)
- [ ] Dados não ficam em cache

---

## 🐛 Resumo de Problemas Conhecidos

### 🔴 CRÍTICO
- Nenhum problema crítico identificado

### 🟡 MÉDIO
1. **Falta UPDATE policy em `weights`** - Usuários não podem editar peso
2. **Falta UPDATE policy em `side_effects`** - Usuários não podem editar efeitos
3. **Falta DELETE policy em `nutrition_entries`** - Usuários não podem deletar entradas
4. **Falta DELETE policy em `reminders`** - Usuários não podem deletar lembretes

### 🟢 BAIXO
1. **Funções sem `search_path`** - Risco teórico de search path manipulation
2. **Pagamento Stripe em modo demo** - Funcional, mas não processa pagamentos reais

---

## 🔧 Como Corrigir Políticas RLS Faltantes

Execute no **Supabase SQL Editor**:

```sql
-- Adicionar UPDATE policy para weights
CREATE POLICY "Users can update own weights" ON weights
  FOR UPDATE USING (auth.uid() = user_id);

-- Adicionar UPDATE policy para side_effects
CREATE POLICY "Users can update own side_effects" ON side_effects
  FOR UPDATE USING (auth.uid() = user_id);

-- Adicionar DELETE policy para nutrition_entries
CREATE POLICY "Users can delete own nutrition" ON nutrition_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Adicionar DELETE policy para reminders
CREATE POLICY "Users can delete own reminders" ON reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Corrigir search_path nas funções (segurança)
ALTER FUNCTION update_updated_at_column() SET search_path = public;
ALTER FUNCTION handle_new_user() SET search_path = public, auth;
```

---

## ✅ Checklist Final de Testes

### Autenticação
- [ ] Cadastro com senha forte funciona
- [ ] Cadastro rejeita senha fraca
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Indicador de força da senha aparece

### Perfil
- [ ] Quiz de perfil salva dados
- [ ] Perfil criado automaticamente no signup

### Funcionalidades Básicas
- [ ] Registrar dose funciona
- [ ] Registrar peso funciona
- [ ] Gráfico de peso atualiza
- [ ] Dashboard mostra dados corretos

### Funcionalidades Pro+
- [ ] Medidas corporais salvam
- [ ] Medidas podem ser editadas ✅
- [ ] Medidas podem ser deletadas ✅
- [ ] Efeitos colaterais salvam

### UX/Design
- [ ] Cores modernas aplicadas (Teal/Turquoise)
- [ ] Animações suaves funcionam
- [ ] Hover effects funcionam
- [ ] Gradientes nos botões aparecem
- [ ] Toast notifications funcionam

---

## 🚀 Próximos Passos Recomendados

1. **Execute os SQLs de correção** das políticas RLS faltantes
2. **Teste manualmente** cada funcionalidade com este guia
3. **Habilite Leaked Password Protection** no Supabase
4. **Configure Stripe** para pagamentos reais (se necessário)
5. **Adicione testes automatizados** (opcional, mas recomendado)

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Verifique logs do Supabase
3. Confirme que todas as tabelas foram criadas
4. Confirme que RLS está ativado

**Ambiente Testado:**
- Node: v20+
- Vite: 7.2.2
- React: 19.2.0
- Supabase: v2.81.1
- Build: ✅ Funcionando
- Dev Server: ✅ Rodando em http://localhost:5173/

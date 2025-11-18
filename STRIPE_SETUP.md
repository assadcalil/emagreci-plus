# Configuração do Stripe - Emagreci+

## Passo 1: Configurar Variáveis de Ambiente

### Backend (server/.env)

1. Copie o arquivo de exemplo:
```bash
cd server
cp .env.example .env
```

2. Preencha as variáveis:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_FROM_STRIPE_DASHBOARD
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Supabase Configuration
SUPABASE_URL=https://bpsefvzzpabxivehsepd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY

# Server Configuration
PORT=4242
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (.env)

Adicione ao arquivo `.env` na raiz do projeto:
```env
VITE_API_URL=http://localhost:4242
```

## Passo 2: Configurar Produtos no Stripe Dashboard

1. Acesse https://dashboard.stripe.com/test/products

2. Crie 3 produtos com assinaturas recorrentes:

### Produto 1: Básico
- Nome: Emagreci+ Básico
- Preço Mensal: R$ 19,90
- Preço Anual: R$ 199,00
- Copie os IDs dos preços e atualize em `src/config/stripe.js`:
  - `basic.monthly`: `price_xxxxx`
  - `basic.yearly`: `price_xxxxx`

### Produto 2: Profissional (POPULAR)
- Nome: Emagreci+ Profissional
- Preço Mensal: R$ 39,90
- Preço Anual: R$ 399,00
- Copie os IDs dos preços e atualize em `src/config/stripe.js`:
  - `pro.monthly`: `price_xxxxx`
  - `pro.yearly`: `price_xxxxx`

### Produto 3: Premium
- Nome: Emagreci+ Premium
- Preço Mensal: R$ 69,90
- Preço Anual: R$ 699,00
- Copie os IDs dos preços e atualize em `src/config/stripe.js`:
  - `premium.monthly`: `price_xxxxx`
  - `premium.yearly`: `price_xxxxx`

## Passo 3: Configurar Webhooks

1. Instale o Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_X.X.X_linux_x86_64.tar.gz
tar -xvf stripe_X.X.X_linux_x86_64.tar.gz
```

2. Faça login no Stripe CLI:
```bash
stripe login
```

3. **DESENVOLVIMENTO**: Encaminhe webhooks localmente:
```bash
stripe listen --forward-to localhost:4242/webhook
```

Copie o webhook secret que aparece (começa com `whsec_`) e adicione ao `server/.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_seu_secret_aqui
```

4. **PRODUÇÃO**: Configure webhook no dashboard:
   - Acesse: https://dashboard.stripe.com/test/webhooks
   - Clique em "Add endpoint"
   - URL: `https://seu-dominio.com/webhook`
   - Eventos para escutar:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `customer.subscription.trial_will_end`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copie o webhook secret e adicione ao `.env` de produção

## Passo 4: Executar o Banco de Dados

Execute a migração do Supabase (se ainda não executou):
```sql
-- No Supabase SQL Editor: https://bpsefvzzpabxivehsepd.supabase.co/project/default/sql
-- Execute o arquivo: supabase/migrations/add_community_chat.sql
```

## Passo 5: Iniciar os Servidores

### Terminal 1 - Backend:
```bash
cd server
npm install
npm run dev
```

Você verá:
```
🚀 Stripe server running on port 4242
📍 Webhook endpoint: http://localhost:4242/webhook
```

### Terminal 2 - Frontend:
```bash
npm run dev
```

### Terminal 3 - Stripe CLI (apenas dev):
```bash
stripe listen --forward-to localhost:4242/webhook
```

## Passo 6: Testar a Integração

1. Acesse: http://localhost:5173
2. Crie uma conta ou faça login
3. Tente assinar um plano
4. Use os cartões de teste do Stripe:
   - Sucesso: `4242 4242 4242 4242`
   - Falha: `4000 0000 0000 0002`
   - Requer 3D Secure: `4000 0025 0000 3155`
   - Qualquer CVC (ex: 123)
   - Qualquer data futura

5. Verifique os logs:
   - Backend: Terminal 1
   - Webhooks: Terminal 3
   - Supabase: Verifique a tabela `subscriptions`

## Fluxo de Pagamento

```
1. Usuário clica em "Assinar Plano"
   ↓
2. Frontend chama POST /create-checkout-session
   ↓
3. Backend cria sessão no Stripe
   ↓
4. Frontend redireciona para Stripe Checkout
   ↓
5. Usuário paga com cartão
   ↓
6. Stripe envia webhook "customer.subscription.created"
   ↓
7. Backend recebe webhook e atualiza Supabase
   ↓
8. Stripe redireciona usuário para success_url
   ↓
9. Frontend detecta sucesso e atualiza UI
```

## Troubleshooting

### Erro: "Webhook signature verification failed"
- Certifique-se que o `STRIPE_WEBHOOK_SECRET` está correto
- Use `stripe listen` para pegar o secret em desenvolvimento

### Erro: "Supabase connection failed"
- Verifique se `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão corretos
- Service role key é diferente da anon key!

### Checkout não abre
- Verifique se o backend está rodando na porta 4242
- Confira os logs do console do navegador
- Verifique se os Price IDs estão corretos em `src/config/stripe.js`

### Assinatura não atualiza no app
- Verifique os logs do webhook (Terminal 3)
- Confira a tabela `subscriptions` no Supabase
- Certifique-se que o webhook está recebendo os eventos

## Produção

### Deploy do Backend

1. Configure as variáveis de ambiente no servidor:
```env
STRIPE_SECRET_KEY=sk_live_seu_secret_key
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_prod
SUPABASE_URL=https://bpsefvzzpabxivehsepd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key
PORT=4242
FRONTEND_URL=https://seu-dominio.com
NODE_ENV=production
```

2. Configure o webhook no Stripe Dashboard (modo live)

3. Atualize os Price IDs para os de produção

4. Deploy recomendado:
   - Vercel Functions
   - Railway
   - Heroku
   - DigitalOcean App Platform

### Deploy do Frontend

Adicione ao `.env.production`:
```env
VITE_API_URL=https://api.seu-dominio.com
```

## Segurança

⚠️ **IMPORTANTE**:
- NUNCA commite arquivos `.env` com secrets reais
- Use diferentes chaves para teste e produção
- Sempre valide webhooks com assinatura
- Use HTTPS em produção
- Service role key do Supabase deve ficar APENAS no backend

## Suporte

- Stripe Docs: https://stripe.com/docs
- Supabase Docs: https://supabase.com/docs
- Stripe CLI: https://stripe.com/docs/stripe-cli

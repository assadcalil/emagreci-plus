# 🔧 Correção: Erro na Criação de Novos Usuários

## Problema Identificado

A criação de novos usuários estava falhando porque a trigger `handle_new_user()` no Supabase tentava inserir um perfil sem o campo `nome`, que é obrigatório (`NOT NULL`) na tabela `profiles`.

## Solução

### Passo 1: Aplicar Migração no Supabase

1. Acesse o Supabase SQL Editor:
   - URL: https://bpsefvzzpabxivehsepd.supabase.co/project/default/sql

2. Execute a migração:
   - Abra o arquivo: `supabase/migrations/fix_user_creation.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor
   - Clique em "Run"

Ou execute este SQL diretamente:

```sql
-- Fix user creation trigger to include nome field
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update existing profiles that might be missing nome
UPDATE profiles
SET nome = split_part(email, '@', 1)
WHERE nome IS NULL OR nome = '';
```

### O que a Correção Faz

1. **Pega o nome do metadata**: Quando o usuário se cadastra, tentamos pegar o nome do `raw_user_meta_data`
2. **Fallback para email**: Se não houver nome, usa a parte antes do @ do email
3. **Tratamento de erros**: Adiciona exception handling para não quebrar a criação do usuário
4. **Atualiza perfis existentes**: Corrige perfis que possam estar sem nome

### Passo 2: Verificar Usuários Existentes

Se você já tem usuários no sistema que falharam na criação do perfil:

```sql
-- Verificar usuários sem perfil
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Criar perfis para usuários existentes sem perfil
INSERT INTO public.profiles (id, email, nome)
SELECT
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'nome',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  )
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

## Testando a Correção

1. **Limpe o localStorage do navegador**:
```javascript
// No console do navegador (F12):
localStorage.clear()
location.reload()
```

2. **Tente criar uma nova conta**:
   - Acesse http://localhost:5173
   - Clique em "Cadastre-se grátis"
   - Preencha:
     - Nome: "Teste da Silva"
     - Email: "teste@exemplo.com"
     - Senha: "senha123"
   - Clique em "Criar Conta"

3. **Verifique no Supabase**:
   - Authentication > Users: Deve mostrar o novo usuário
   - Table Editor > profiles: Deve ter um perfil com nome preenchido

## Debug: Verificar Erros

Se ainda houver problemas:

### 1. Console do Navegador (F12)
```javascript
// Verifique erros de autenticação
// Procure por mensagens de erro em vermelho
```

### 2. Logs do Supabase
- Acesse: Logs > Auth Logs
- Procure por erros recentes

### 3. Verificar RLS (Row Level Security)
```sql
-- Verificar se as policies permitem INSERT
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Testar insert manual
INSERT INTO profiles (id, email, nome)
VALUES (
  'test-user-id',
  'teste@exemplo.com',
  'Teste'
);
```

## Problemas Comuns

### Erro: "new row violates row-level security policy"
**Solução**: A policy de INSERT no profiles precisa ser ajustada:
```sql
-- Verificar policy atual
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');
```

### Erro: "duplicate key value violates unique constraint"
**Solução**: O usuário já existe. Delete e tente novamente:
```sql
-- No Supabase SQL Editor:
DELETE FROM auth.users WHERE email = 'seu-email@exemplo.com';
```

### Erro: "nome cannot be null"
**Solução**: A migração fix_user_creation.sql já resolve isso. Certifique-se de executá-la.

## Fluxo de Signup Atualizado

```
1. Usuário preenche formulário
   ↓
2. Frontend chama signUp(email, password, { nome })
   ↓
3. Supabase Auth cria usuário em auth.users
   ↓
4. Trigger handle_new_user() é disparada
   ↓
5. Função insere perfil em profiles com:
   - id: mesmo do auth.users
   - email: do auth.users
   - nome: do metadata ou fallback para parte do email
   ↓
6. Usuário é autenticado automaticamente
   ↓
7. Frontend detecta autenticação e mostra Quiz
```

## Validação Final

Execute no SQL Editor para validar que tudo está OK:

```sql
-- 1. Verificar que a function existe
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 2. Verificar que a trigger existe
SELECT trigger_name
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 3. Verificar policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 4. Contar usuários e perfis (devem ser iguais)
SELECT
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles;
```

## Contato

Se o problema persistir, forneça:
1. Screenshot do erro no console (F12)
2. Logs do Supabase (Auth Logs)
3. Resultado da query de validação acima

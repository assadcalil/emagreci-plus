-- ========================================
-- CORREÇÃO COMPLETA DO BANCO DE DADOS
-- Emagreci+ - Script de correção de todos os problemas encontrados
-- Execute este script no Supabase SQL Editor
-- ========================================

-- ========================================
-- PROBLEMA 1: WEIGHTS - Adicionar coluna observacoes
-- ========================================
-- Frontend coleta mas backend não salva!
ALTER TABLE weights ADD COLUMN IF NOT EXISTS observacoes TEXT;

COMMENT ON COLUMN weights.observacoes IS 'Observações do usuário sobre o peso (opcional, máx 500 chars)';


-- ========================================
-- PROBLEMA 2: MEASUREMENTS - Adicionar colunas pescoco e observacoes
-- ========================================
-- Frontend coleta mas backend não salva!
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS pescoco DECIMAL(5,2);
ALTER TABLE measurements ADD COLUMN IF NOT EXISTS observacoes TEXT;

COMMENT ON COLUMN measurements.pescoco IS 'Medida do pescoço em cm (range: 20-60cm)';
COMMENT ON COLUMN measurements.observacoes IS 'Observações sobre as medidas (opcional)';


-- ========================================
-- PROBLEMA 3: MEASUREMENTS - Adicionar UPDATE policy (CRÍTICO!)
-- ========================================
-- Código usa updateMeasurement() mas policy não existe!
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'measurements'
        AND policyname = 'Users can update own measurements'
    ) THEN
        CREATE POLICY "Users can update own measurements" ON measurements
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;


-- ========================================
-- PROBLEMA 4: WEIGHTS - Adicionar UPDATE policy
-- ========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'weights'
        AND policyname = 'Users can update own weights'
    ) THEN
        CREATE POLICY "Users can update own weights" ON weights
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;


-- ========================================
-- PROBLEMA 5: SIDE_EFFECTS - Adicionar UPDATE policy
-- ========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'side_effects'
        AND policyname = 'Users can update own side_effects'
    ) THEN
        CREATE POLICY "Users can update own side_effects" ON side_effects
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;


-- ========================================
-- PROBLEMA 6: NUTRITION_ENTRIES - Adicionar DELETE policy
-- ========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'nutrition_entries'
        AND policyname = 'Users can delete own nutrition'
    ) THEN
        CREATE POLICY "Users can delete own nutrition" ON nutrition_entries
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;


-- ========================================
-- PROBLEMA 7: REMINDERS - Adicionar DELETE policy
-- ========================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'reminders'
        AND policyname = 'Users can delete own reminders'
    ) THEN
        CREATE POLICY "Users can delete own reminders" ON reminders
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;


-- ========================================
-- PROBLEMA 8: FUNÇÕES - Adicionar search_path para segurança
-- ========================================

-- Corrigir update_updated_at_column
ALTER FUNCTION update_updated_at_column() SET search_path = public;

-- Corrigir handle_new_user
ALTER FUNCTION handle_new_user() SET search_path = public, auth;


-- ========================================
-- VERIFICAÇÕES FINAIS
-- ========================================

-- Verificar se as colunas foram adicionadas
DO $$
DECLARE
    weights_has_observacoes BOOLEAN;
    measurements_has_pescoco BOOLEAN;
    measurements_has_observacoes BOOLEAN;
BEGIN
    -- Verificar weights.observacoes
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'weights' AND column_name = 'observacoes'
    ) INTO weights_has_observacoes;

    -- Verificar measurements.pescoco
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'measurements' AND column_name = 'pescoco'
    ) INTO measurements_has_pescoco;

    -- Verificar measurements.observacoes
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'measurements' AND column_name = 'observacoes'
    ) INTO measurements_has_observacoes;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICAÇÃO DE COLUNAS ADICIONADAS:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'weights.observacoes: %', CASE WHEN weights_has_observacoes THEN '✅ OK' ELSE '❌ FALHOU' END;
    RAISE NOTICE 'measurements.pescoco: %', CASE WHEN measurements_has_pescoco THEN '✅ OK' ELSE '❌ FALHOU' END;
    RAISE NOTICE 'measurements.observacoes: %', CASE WHEN measurements_has_observacoes THEN '✅ OK' ELSE '❌ FALHOU' END;
    RAISE NOTICE '========================================';
END $$;

-- Verificar políticas RLS
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename IN ('measurements', 'weights', 'side_effects', 'nutrition_entries', 'reminders')
    AND policyname LIKE '%update%' OR policyname LIKE '%delete%';

    RAISE NOTICE 'Total de políticas UPDATE/DELETE criadas: %', policy_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CORREÇÃO COMPLETA!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '1. Atualizar código para salvar observacoes e pescoco';
    RAISE NOTICE '2. Testar cadastro de peso com observações';
    RAISE NOTICE '3. Testar cadastro de medidas com pescoço';
    RAISE NOTICE '4. Testar edição de medidas';
    RAISE NOTICE '========================================';
END $$;

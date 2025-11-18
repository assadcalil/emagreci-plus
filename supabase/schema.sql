-- Emagreci+ Database Schema for Supabase
-- Execute this in Supabase SQL Editor: https://bpsefvzzpabxivehsepd.supabase.co/project/default/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  idade INTEGER,
  altura DECIMAL(5,2),
  peso_atual DECIMAL(5,2),
  peso_inicial DECIMAL(5,2),
  tipo_caneta TEXT,
  objetivo TEXT,
  experiencia TEXT,
  condicoes_medicas TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions Table (Stripe integration)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL, -- basic, pro, premium
  status TEXT NOT NULL DEFAULT 'none', -- none, active, expired, trial, cancelled
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  billing_period TEXT DEFAULT 'monthly', -- monthly, yearly
  start_date TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Doses Table
CREATE TABLE IF NOT EXISTS doses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  dosagem DECIMAL(6,2) NOT NULL,
  local TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weights Table
CREATE TABLE IF NOT EXISTS weights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  peso DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Measurements Table
CREATE TABLE IF NOT EXISTS measurements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  cintura DECIMAL(5,2),
  quadril DECIMAL(5,2),
  braco DECIMAL(5,2),
  coxa DECIMAL(5,2),
  peito DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Side Effects Table
CREATE TABLE IF NOT EXISTS side_effects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  horario TIME,
  tipo TEXT NOT NULL,
  tipo_label TEXT NOT NULL,
  tipo_icon TEXT,
  intensidade INTEGER CHECK (intensidade >= 1 AND intensidade <= 5),
  duracao TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,
  valor_alvo DECIMAL(10,2),
  valor_atual DECIMAL(10,2),
  concluida BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_conclusao TIMESTAMP WITH TIME ZONE
);

-- Progress Photos Table
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  tipo TEXT NOT NULL, -- frente, lado, costas
  url TEXT NOT NULL,
  peso DECIMAL(5,2),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition Entries Table
CREATE TABLE IF NOT EXISTS nutrition_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL,
  calorias INTEGER,
  proteinas DECIMAL(6,2),
  carboidratos DECIMAL(6,2),
  gorduras DECIMAL(6,2),
  agua_ml INTEGER,
  refeicoes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders Table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  day_of_week INTEGER, -- 0-6 (Sunday-Saturday)
  time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Community Messages Table (for Premium users)
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  weight_loss DECIMAL(5,2),
  type TEXT DEFAULT 'message', -- message, result
  likes UUID[] DEFAULT '{}', -- Array of user IDs who liked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE side_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Doses policies
CREATE POLICY "Users can view own doses" ON doses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own doses" ON doses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own doses" ON doses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own doses" ON doses
  FOR DELETE USING (auth.uid() = user_id);

-- Weights policies
CREATE POLICY "Users can view own weights" ON weights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weights" ON weights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weights" ON weights
  FOR DELETE USING (auth.uid() = user_id);

-- Measurements policies
CREATE POLICY "Users can view own measurements" ON measurements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements" ON measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own measurements" ON measurements
  FOR DELETE USING (auth.uid() = user_id);

-- Side effects policies
CREATE POLICY "Users can view own side_effects" ON side_effects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own side_effects" ON side_effects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own side_effects" ON side_effects
  FOR DELETE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Progress photos policies
CREATE POLICY "Users can view own photos" ON progress_photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON progress_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON progress_photos
  FOR DELETE USING (auth.uid() = user_id);

-- Nutrition entries policies
CREATE POLICY "Users can view own nutrition" ON nutrition_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition" ON nutrition_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition" ON nutrition_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Reminders policies
CREATE POLICY "Users can view own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

-- Community messages policies (all authenticated users can read)
CREATE POLICY "Authenticated users can view all messages" ON community_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own messages" ON community_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON community_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON community_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doses_user_id ON doses(user_id);
CREATE INDEX IF NOT EXISTS idx_doses_data ON doses(data);
CREATE INDEX IF NOT EXISTS idx_weights_user_id ON weights(user_id);
CREATE INDEX IF NOT EXISTS idx_weights_data ON weights(data);
CREATE INDEX IF NOT EXISTS idx_measurements_user_id ON measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_side_effects_user_id ON side_effects(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
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

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  currency TEXT NOT NULL DEFAULT 'BRL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Bets table
CREATE TABLE public.bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bet_date DATE NOT NULL DEFAULT CURRENT_DATE,
  bookmaker TEXT NOT NULL,
  bet_type TEXT NOT NULL CHECK (bet_type IN ('esporte','cassino')),
  category TEXT NOT NULL,
  event TEXT NOT NULL,
  odd NUMERIC(10,3) NOT NULL DEFAULT 1,
  stake NUMERIC(12,2) NOT NULL DEFAULT 0,
  expected_return NUMERIC(12,2) NOT NULL DEFAULT 0,
  result TEXT NOT NULL DEFAULT 'pendente' CHECK (result IN ('pendente','green','red','meio_green','duplo_green','cashout','cancelado')),
  received NUMERIC(12,2) NOT NULL DEFAULT 0,
  profit NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bets" ON public.bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bets" ON public.bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bets" ON public.bets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own bets" ON public.bets FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_bets_user_date ON public.bets(user_id, bet_date DESC);

-- Bankroll settings
CREATE TABLE public.bankroll_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_balance NUMERIC(12,2) NOT NULL DEFAULT 1000,
  goal NUMERIC(12,2) NOT NULL DEFAULT 0,
  daily_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  weekly_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  monthly_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  stop_loss NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bankroll_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bankroll" ON public.bankroll_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own bankroll insert" ON public.bankroll_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users upsert own bankroll update" ON public.bankroll_settings FOR UPDATE USING (auth.uid() = user_id);

-- User settings
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'dark',
  notifications BOOLEAN NOT NULL DEFAULT true,
  paused_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to auto-create profile and settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));

  INSERT INTO public.bankroll_settings (user_id) VALUES (NEW.id);
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER bets_updated_at BEFORE UPDATE ON public.bets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER bankroll_updated_at BEFORE UPDATE ON public.bankroll_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'standard', 'pro')),
  preferred_accents TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  goals TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  current_level TEXT DEFAULT 'beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practice_sessions table
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  sentence_text TEXT NOT NULL,
  target_accent TEXT NOT NULL,
  session_type TEXT DEFAULT 'pronunciation',
  accuracy_score INTEGER,
  duration_seconds INTEGER,
  audio_url TEXT,
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress_tracking table
CREATE TABLE IF NOT EXISTS public.progress_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  accent_type TEXT NOT NULL,
  weekly_streak INTEGER DEFAULT 0,
  monthly_streak INTEGER DEFAULT 0,
  total_practice_time INTEGER DEFAULT 0,
  mastered_phonemes TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'beginner',
  average_accuracy DECIMAL(5,2) DEFAULT 0.00,
  last_practice_date DATE,
  streak_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, accent_type)
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  achievement_icon TEXT,
  points_earned INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  subscription_tier TEXT NOT NULL,
  status TEXT DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('free', 'standard', 'pro')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT TRUE,
  payment_id UUID REFERENCES public.payments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON public.practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_created_at ON public.practice_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_id ON public.progress_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_tracking_updated_at BEFORE UPDATE ON public.progress_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Practice sessions policies
CREATE POLICY "Users can view own practice sessions" ON public.practice_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own practice sessions" ON public.practice_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own practice sessions" ON public.practice_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Progress tracking policies
CREATE POLICY "Users can view own progress" ON public.progress_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.progress_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.progress_tracking FOR UPDATE USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payments" ON public.payments FOR UPDATE USING (auth.uid() = user_id);

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Function to calculate streak
CREATE OR REPLACE FUNCTION calculate_user_streak(user_uuid UUID, accent TEXT)
RETURNS INTEGER AS $$
DECLARE
    current_streak INTEGER := 0;
    last_date DATE;
    check_date DATE;
BEGIN
    -- Get the most recent practice date
    SELECT MAX(DATE(created_at)) INTO last_date
    FROM public.practice_sessions
    WHERE user_id = user_uuid AND target_accent = accent;
    
    IF last_date IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Check if last practice was today or yesterday
    IF last_date < CURRENT_DATE - INTERVAL '1 day' THEN
        RETURN 0;
    END IF;
    
    -- Count consecutive days
    check_date := last_date;
    WHILE check_date IS NOT NULL LOOP
        -- Check if there's a practice session on this date
        IF EXISTS (
            SELECT 1 FROM public.practice_sessions
            WHERE user_id = user_uuid 
            AND target_accent = accent 
            AND DATE(created_at) = check_date
        ) THEN
            current_streak := current_streak + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;
    
    RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- Function to update user achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements()
RETURNS TRIGGER AS $$
DECLARE
    user_streak INTEGER;
    user_accuracy DECIMAL;
    achievement_exists BOOLEAN;
BEGIN
    -- Calculate current streak
    user_streak := calculate_user_streak(NEW.user_id, NEW.accent_type);
    
    -- Update streak in progress_tracking
    UPDATE public.progress_tracking 
    SET weekly_streak = user_streak,
        streak_updated_at = NOW()
    WHERE user_id = NEW.user_id AND accent_type = NEW.accent_type;
    
    -- Check for Weekly Warrior achievement (7-day streak)
    IF user_streak >= 7 THEN
        SELECT EXISTS(
            SELECT 1 FROM public.user_achievements 
            WHERE user_id = NEW.user_id AND achievement_id = 'weekly_warrior'
        ) INTO achievement_exists;
        
        IF NOT achievement_exists THEN
            INSERT INTO public.user_achievements (user_id, achievement_id, achievement_name, achievement_description, achievement_icon, points_earned, rarity)
            VALUES (NEW.user_id, 'weekly_warrior', 'Weekly Warrior', 'Maintained a 7-day practice streak', '🔥', 100, 'rare');
        END IF;
    END IF;
    
    -- Check for Monthly Master achievement (30-day streak)
    IF user_streak >= 30 THEN
        SELECT EXISTS(
            SELECT 1 FROM public.user_achievements 
            WHERE user_id = NEW.user_id AND achievement_id = 'monthly_master'
        ) INTO achievement_exists;
        
        IF NOT achievement_exists THEN
            INSERT INTO public.user_achievements (user_id, achievement_id, achievement_name, achievement_description, achievement_icon, points_earned, rarity)
            VALUES (NEW.user_id, 'monthly_master', 'Monthly Master', 'Maintained a 30-day practice streak', '👑', 500, 'epic');
        END IF;
    END IF;
    
    -- Calculate average accuracy
    SELECT AVG(accuracy_score) INTO user_accuracy
    FROM public.practice_sessions
    WHERE user_id = NEW.user_id AND accuracy_score IS NOT NULL;
    
    -- Check for Accuracy Expert achievement (90%+ average)
    IF user_accuracy >= 90 THEN
        SELECT EXISTS(
            SELECT 1 FROM public.user_achievements 
            WHERE user_id = NEW.user_id AND achievement_id = 'accuracy_expert'
        ) INTO achievement_exists;
        
        IF NOT achievement_exists THEN
            INSERT INTO public.user_achievements (user_id, achievement_id, achievement_name, achievement_description, achievement_icon, points_earned, rarity)
            VALUES (NEW.user_id, 'accuracy_expert', 'Accuracy Expert', 'Achieved 90%+ average accuracy', '🎯', 200, 'rare');
        END IF;
    END IF;
    
    -- Check for Pronunciation Perfectionist achievement (95%+ average)
    IF user_accuracy >= 95 THEN
        SELECT EXISTS(
            SELECT 1 FROM public.user_achievements 
            WHERE user_id = NEW.user_id AND achievement_id = 'pronunciation_perfectionist'
        ) INTO achievement_exists;
        
        IF NOT achievement_exists THEN
            INSERT INTO public.user_achievements (user_id, achievement_id, achievement_name, achievement_description, achievement_icon, points_earned, rarity)
            VALUES (NEW.user_id, 'pronunciation_perfectionist', 'Pronunciation Perfectionist', 'Achieved 95%+ average accuracy', '🏆', 1000, 'legendary');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for achievement checking
CREATE TRIGGER check_achievements_trigger
    AFTER INSERT OR UPDATE ON public.practice_sessions
    FOR EACH ROW
    EXECUTE FUNCTION check_and_award_achievements();

-- Insert default achievement definitions
INSERT INTO public.user_achievements (user_id, achievement_id, achievement_name, achievement_description, achievement_icon, points_earned, rarity)
SELECT 
    '00000000-0000-0000-0000-000000000000'::UUID,
    'first_session',
    'First Steps',
    'Complete your first practice session',
    '👶',
    10,
    'common'
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_achievements 
    WHERE achievement_id = 'first_session' AND user_id = '00000000-0000-0000-0000-000000000000'::UUID
);

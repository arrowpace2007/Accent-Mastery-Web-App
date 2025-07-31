-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_practice_time INTEGER DEFAULT 0, -- in minutes
    profile_image_url TEXT
);

-- Create user_accents table for tracking accent preferences and progress
CREATE TABLE IF NOT EXISTS user_accents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_accent VARCHAR(50) NOT NULL, -- 'american', 'british', 'australian', etc.
    current_level VARCHAR(50) NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'native-like'
    goals TEXT[], -- array of goals like 'professional', 'travel', etc.
    interests TEXT[], -- array of interests like 'business', 'technology', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_primary BOOLEAN DEFAULT TRUE
);

-- Create practice_sessions table
CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL, -- 'pronunciation', 'conversation', 'rhythm', etc.
    content_type VARCHAR(50) NOT NULL, -- 'sentence', 'paragraph', 'dialogue', etc.
    content_text TEXT NOT NULL,
    phonetic_breakdown JSONB, -- phonetic transcription and breakdown
    duration_minutes INTEGER NOT NULL,
    accuracy_score INTEGER, -- 0-100
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    difficulty_level VARCHAR(50) NOT NULL,
    topic VARCHAR(100), -- business, technology, etc.
    target_sounds TEXT[] -- specific sounds practiced
);

-- Create recordings table for storing user audio recordings
CREATE TABLE IF NOT EXISTS recordings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    practice_session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL, -- URL to stored audio file
    transcript TEXT, -- what the user actually said
    feedback JSONB, -- detailed AI feedback including sound-by-sound analysis
    overall_score INTEGER, -- 0-100
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_size_bytes INTEGER,
    duration_seconds DECIMAL(5,2)
);

-- Create progress_tracking table for detailed progress analytics
CREATE TABLE IF NOT EXISTS progress_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    sessions_completed INTEGER DEFAULT 0,
    total_practice_time INTEGER DEFAULT 0, -- in minutes
    average_accuracy DECIMAL(5,2),
    sounds_practiced TEXT[],
    topics_covered TEXT[],
    streak_day INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create badges table for gamification
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon VARCHAR(10) NOT NULL, -- emoji or icon identifier
    category VARCHAR(50) NOT NULL, -- 'streak', 'accuracy', 'practice', 'social', etc.
    requirement_type VARCHAR(50) NOT NULL, -- 'streak_days', 'accuracy_score', 'sessions_count', etc.
    requirement_value INTEGER NOT NULL,
    rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table for tracking earned badges
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_value INTEGER, -- current progress towards badge if not yet earned
    UNIQUE(user_id, badge_id)
);

-- Create community_challenges table
CREATE TABLE IF NOT EXISTS community_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    challenge_type VARCHAR(50) NOT NULL, -- 'weekly', 'monthly', 'special_event'
    target_accent VARCHAR(50),
    difficulty_level VARCHAR(50) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER,
    prize_description TEXT,
    content_requirements JSONB, -- specific requirements for the challenge
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create challenge_participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_id UUID REFERENCES community_challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submission_url TEXT, -- URL to their challenge submission
    score INTEGER, -- their score in the challenge
    rank INTEGER, -- their rank in the challenge
    completed BOOLEAN DEFAULT FALSE,
    UNIQUE(challenge_id, user_id)
);

-- Insert sample badges
INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value, rarity) VALUES
('First Steps', 'Complete your first practice session', '👶', 'practice', 'sessions_count', 1, 'common'),
('Week Warrior', 'Maintain a 7-day practice streak', '🔥', 'streak', 'streak_days', 7, 'common'),
('Month Master', 'Maintain a 30-day practice streak', '🏆', 'streak', 'streak_days', 30, 'rare'),
('Perfectionist', 'Achieve 95% accuracy in a session', '🎯', 'accuracy', 'accuracy_score', 95, 'rare'),
('Vowel Master', 'Complete 50 vowel sound exercises', '🅰️', 'practice', 'vowel_sessions', 50, 'common'),
('Conversation Pro', 'Complete 25 conversation practice sessions', '💬', 'practice', 'conversation_sessions', 25, 'common'),
('Early Bird', 'Practice before 8 AM for 5 days', '🌅', 'habit', 'early_sessions', 5, 'rare'),
('Night Owl', 'Practice after 10 PM for 5 days', '🦉', 'habit', 'late_sessions', 5, 'rare'),
('Social Butterfly', 'Participate in 3 community challenges', '🦋', 'social', 'challenges_joined', 3, 'common'),
('Champion', 'Win a community challenge', '👑', 'social', 'challenges_won', 1, 'epic');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_completed_at ON practice_sessions(completed_at);
CREATE INDEX IF NOT EXISTS idx_recordings_user_id ON recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_practice_session_id ON recordings(practice_session_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracking_user_date ON progress_tracking(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accents ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own accents" ON user_accents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own sessions" ON practice_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own recordings" ON recordings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own progress" ON progress_tracking FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own badges" ON user_badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own challenge participation" ON challenge_participants FOR ALL USING (auth.uid() = user_id);

-- Public read access for badges and challenges
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Anyone can view active challenges" ON community_challenges FOR SELECT USING (is_active = true);

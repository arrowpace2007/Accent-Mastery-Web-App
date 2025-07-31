import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  subscription_tier: "free" | "standard" | "pro"
  created_at: string
  updated_at: string
  onboarding_completed: boolean
  preferred_accents: string[]
}

export interface UserAccent {
  id: string
  user_id: string
  target_accent: string
  current_level: string
  goals: string[]
  interests: string[]
  created_at: string
  updated_at: string
  is_primary: boolean
}

export interface PracticeSession {
  id: string
  user_id: string
  target_accent: string
  sentence_text: string
  recording_url?: string
  accuracy_score?: number
  phoneme_feedback?: any
  created_at: string
}

export interface Recording {
  id: string
  user_id: string
  practice_session_id: string
  audio_url: string
  transcript?: string
  feedback?: any
  overall_score?: number
  created_at: string
  file_size_bytes?: number
  duration_seconds?: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement_type: string
  requirement_value: number
  rarity: "common" | "rare" | "epic" | "legendary"
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  progress_value?: number
  badge?: Badge
}

export interface CommunityChallenge {
  id: string
  title: string
  description: string
  challenge_type: string
  target_accent?: string
  difficulty_level: string
  start_date: string
  end_date: string
  max_participants?: number
  prize_description?: string
  content_requirements?: any
  created_at: string
  is_active: boolean
}

export interface ProgressTracking {
  id: string
  user_id: string
  accent_type: string
  weekly_streak: number
  total_practice_time: number
  mastered_phonemes: string[]
  difficulty_level: string
}

// Supabase client with real-time enabled
export const createRealtimeClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

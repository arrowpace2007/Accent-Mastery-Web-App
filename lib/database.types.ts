export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          subscription_tier: "free" | "standard" | "pro"
          created_at: string
          updated_at: string
          onboarding_completed: boolean
          preferred_accents: string[]
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          subscription_tier?: "free" | "standard" | "pro"
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean
          preferred_accents?: string[]
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          subscription_tier?: "free" | "standard" | "pro"
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean
          preferred_accents?: string[]
        }
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          target_accent: string
          sentence_text: string
          recording_url: string | null
          accuracy_score: number | null
          phoneme_feedback: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_accent: string
          sentence_text: string
          recording_url?: string | null
          accuracy_score?: number | null
          phoneme_feedback?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_accent?: string
          sentence_text?: string
          recording_url?: string | null
          accuracy_score?: number | null
          phoneme_feedback?: Json | null
          created_at?: string
        }
      }
      progress_tracking: {
        Row: {
          id: string
          user_id: string
          accent_type: string
          weekly_streak: number
          total_practice_time: number
          mastered_phonemes: string[]
          difficulty_level: string
        }
        Insert: {
          id?: string
          user_id: string
          accent_type: string
          weekly_streak?: number
          total_practice_time?: number
          mastered_phonemes?: string[]
          difficulty_level?: string
        }
        Update: {
          id?: string
          user_id?: string
          accent_type?: string
          weekly_streak?: number
          total_practice_time?: number
          mastered_phonemes?: string[]
          difficulty_level?: string
        }
      }
    }
  }
}

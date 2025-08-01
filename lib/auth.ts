import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./database.types"

// Client-side auth helper
export const createClient = () => createClientComponentClient<Database>()

// Auth state management
export interface AuthUser {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  subscription_tier: "free" | "standard" | "pro"
  onboarding_completed: boolean
  preferred_accents: string[]
}

// Subscription tier permissions
export const SUBSCRIPTION_FEATURES = {
  free: {
    maxPracticeSessions: 5,
    maxAccents: 1,
    hasAdvancedFeedback: false,
    hasCoaching: false,
    hasCommunityFeatures: true,
    hasOfflineMode: false,
  },
  standard: {
    maxPracticeSessions: 50,
    maxAccents: 3,
    hasAdvancedFeedback: true,
    hasCoaching: false,
    hasCommunityFeatures: true,
    hasOfflineMode: true,
  },
  pro: {
    maxPracticeSessions: -1, // unlimited
    maxAccents: -1, // unlimited
    hasAdvancedFeedback: true,
    hasCoaching: true,
    hasCommunityFeatures: true,
    hasOfflineMode: true,
  },
} as const

export const getSubscriptionFeatures = (tier: "free" | "standard" | "pro") => {
  return SUBSCRIPTION_FEATURES[tier]
}

// Check if user can access feature
export const canAccessFeature = (
  userTier: "free" | "standard" | "pro",
  feature: keyof typeof SUBSCRIPTION_FEATURES.free,
) => {
  return SUBSCRIPTION_FEATURES[userTier][feature]
}

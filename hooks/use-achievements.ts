"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/auth"
import { useAuth } from "@/components/auth/auth-provider"

interface Achievement {
  id: string
  name: string
  display_name: string
  description: string
  icon: string
  category: string
  requirement_type: string
  requirement_value: number
  points: number
  rarity: string
}

interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  progress_value: number
  is_earned: boolean
  notified: boolean
  achievements?: Achievement
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from("user_achievements")
          .select(`
            *,
            achievements (*)
          `)
          .eq("user_id", user.id)
          .order("earned_at", { ascending: false })

        if (error) throw error
        setAchievements(data || [])
      } catch (err) {
        console.error("Achievements fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch achievements")
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()

    // Set up real-time subscription
    const subscription = supabase
      .channel("user_achievements_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_achievements",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            // Refetch to get the joined achievement data
            fetchAchievements()
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, supabase])

  const markAsNotified = async (achievementId: string) => {
    try {
      const { error } = await supabase
        .from("user_achievements")
        .update({ notified: true })
        .eq("user_id", user?.id)
        .eq("achievement_id", achievementId)

      if (error) throw error

      setAchievements((prev) =>
        prev.map((achievement) =>
          achievement.achievement_id === achievementId ? { ...achievement, notified: true } : achievement,
        ),
      )
    } catch (err) {
      console.error("Mark as notified error:", err)
    }
  }

  const newAchievements = achievements.filter((a) => a.is_earned && !a.notified)

  return {
    achievements,
    newAchievements,
    loading,
    error,
    markAsNotified,
  }
}

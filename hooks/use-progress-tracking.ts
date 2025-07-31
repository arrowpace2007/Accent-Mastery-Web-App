"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/auth"
import { useAuth } from "@/components/auth/auth-provider"

interface ProgressData {
  id: string
  user_id: string
  date: string
  accent_type: string
  sessions_completed: number
  total_practice_time: number
  average_accuracy: number | null
  sounds_practiced: string[]
  topics_covered: string[]
  streak_count: number
  is_streak_active: boolean
  last_practice_at: string | null
  created_at: string
  updated_at: string
}

export function useProgressTracking() {
  const [progress, setProgress] = useState<ProgressData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from("progress_tracking")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })

        if (error) throw error
        setProgress(data || [])
      } catch (err) {
        console.error("Progress fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch progress")
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()

    // Set up real-time subscription
    const subscription = supabase
      .channel("progress_tracking_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "progress_tracking",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setProgress((prev) => [payload.new as ProgressData, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setProgress((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as ProgressData) : item)),
            )
          } else if (payload.eventType === "DELETE") {
            setProgress((prev) => prev.filter((item) => item.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, supabase])

  const updateProgress = async (
    accentType: string,
    sessionData: {
      sessionsCompleted?: number
      practiceTime?: number
      accuracy?: number
      soundsPracticed?: string[]
      topicsCovered?: string[]
    },
  ) => {
    if (!user) return

    try {
      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("progress_tracking")
        .upsert({
          user_id: user.id,
          date: today,
          accent_type: accentType,
          sessions_completed: sessionData.sessionsCompleted || 1,
          total_practice_time: sessionData.practiceTime || 0,
          average_accuracy: sessionData.accuracy || null,
          sounds_practiced: sessionData.soundsPracticed || [],
          topics_covered: sessionData.topicsCovered || [],
          last_practice_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error("Progress update error:", err)
      throw err
    }
  }

  return {
    progress,
    loading,
    error,
    updateProgress,
  }
}

"use client"

import { useEffect, useState } from "react"
import { supabase, createRealtimeClient, type User, type PracticeSession, type ProgressTracking } from "./supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

// Hook for user data with real-time updates
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let channel: RealtimeChannel

    const fetchUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser) {
          const { data, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

          if (error) throw error
          setUser(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    const setupRealtimeSubscription = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const realtimeClient = createRealtimeClient()
        channel = realtimeClient
          .channel("user-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "users",
              filter: `id=eq.${authUser.id}`,
            },
            (payload) => {
              if (payload.eventType === "UPDATE") {
                setUser(payload.new as User)
              }
            },
          )
          .subscribe()
      }
    }

    fetchUser()
    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return { user, loading, error, setUser }
}

// Hook for practice sessions with real-time updates
export function usePracticeSessions() {
  const [sessions, setSessions] = useState<PracticeSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let channel: RealtimeChannel

    const fetchSessions = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data, error } = await supabase
            .from("practice_sessions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          if (error) throw error
          setSessions(data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    const setupRealtimeSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const realtimeClient = createRealtimeClient()
        channel = realtimeClient
          .channel("practice-sessions-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "practice_sessions",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (payload.eventType === "INSERT") {
                setSessions((prev) => [payload.new as PracticeSession, ...prev])
              } else if (payload.eventType === "UPDATE") {
                setSessions((prev) =>
                  prev.map((session) => (session.id === payload.new.id ? (payload.new as PracticeSession) : session)),
                )
              } else if (payload.eventType === "DELETE") {
                setSessions((prev) => prev.filter((session) => session.id !== payload.old.id))
              }
            },
          )
          .subscribe()
      }
    }

    fetchSessions()
    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return { sessions, loading, error, setSessions }
}

// Hook for progress tracking with real-time updates
export function useProgressTracking() {
  const [progress, setProgress] = useState<ProgressTracking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let channel: RealtimeChannel

    const fetchProgress = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data, error } = await supabase.from("progress_tracking").select("*").eq("user_id", user.id)

          if (error) throw error
          setProgress(data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    const setupRealtimeSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const realtimeClient = createRealtimeClient()
        channel = realtimeClient
          .channel("progress-changes")
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
                setProgress((prev) => [...prev, payload.new as ProgressTracking])
              } else if (payload.eventType === "UPDATE") {
                setProgress((prev) =>
                  prev.map((p) => (p.id === payload.new.id ? (payload.new as ProgressTracking) : p)),
                )
              } else if (payload.eventType === "DELETE") {
                setProgress((prev) => prev.filter((p) => p.id !== payload.old.id))
              }
            },
          )
          .subscribe()
      }
    }

    fetchProgress()
    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return { progress, loading, error, setProgress }
}

// Utility functions for database operations
export const createPracticeSession = async (sessionData: Omit<PracticeSession, "id" | "created_at" | "user_id">) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("practice_sessions")
    .insert({
      ...sessionData,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateProgressTracking = async (accentType: string, updates: Partial<ProgressTracking>) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("progress_tracking")
    .upsert({
      user_id: user.id,
      accent_type: accentType,
      ...updates,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateUserProfile = async (updates: Partial<User>) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase.from("users").update(updates).eq("id", user.id).select().single()

  if (error) throw error
  return data
}

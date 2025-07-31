"use client"

import { createClient } from "@/lib/auth"

interface SpeechAnalysisRequest {
  audioFile: string
  targetSentence: string
  accentType: string
  sessionId?: string
  difficulty?: string
}

interface UserActionRequest {
  actionType: "signup" | "upgrade" | "progress_update" | "subscription_change" | "achievement_unlock"
  userData?: any
  progressData?: any
  achievementData?: any
  metadata?: any
}

class WebhookClient {
  private baseUrl: string
  private supabase = createClient()

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  }

  private async getAuthHeaders() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession()

    return {
      "Content-Type": "application/json",
      ...(session && { Authorization: `Bearer ${session.access_token}` }),
    }
  }

  async processSpeech(data: SpeechAnalysisRequest, onProgress?: (progress: number) => void) {
    try {
      const headers = await this.getAuthHeaders()

      // Simulate progress updates during processing
      const progressInterval = setInterval(() => {
        if (onProgress) {
          const progress = Math.min(90, Math.random() * 80 + 10)
          onProgress(progress)
        }
      }, 500)

      const response = await fetch(`${this.baseUrl}/api/process-speech`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      })

      clearInterval(progressInterval)

      if (onProgress) {
        onProgress(100)
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Speech processing error:", error)
      throw error
    }
  }

  async userAction(data: UserActionRequest) {
    try {
      const headers = await this.getAuthHeaders()

      const response = await fetch(`${this.baseUrl}/api/user-action`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("User action error:", error)
      throw error
    }
  }

  // Utility method to convert audio blob to base64
  async audioToBase64(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix to get just the base64 data
        const base64 = result.split(",")[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(audioBlob)
    })
  }

  // Check user subscription status
  async checkSubscriptionAccess(feature: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser()

      if (!user) return false

      const { data: userData } = await this.supabase
        .from("users")
        .select("subscription_tier")
        .eq("id", user.id)
        .single()

      if (!userData) return false

      const features = {
        free: ["basic_practice", "community"],
        standard: ["basic_practice", "community", "advanced_feedback", "offline_mode"],
        pro: ["basic_practice", "community", "advanced_feedback", "offline_mode", "coaching", "unlimited_sessions"],
      }

      const userFeatures = features[userData.subscription_tier as keyof typeof features] || features.free
      return userFeatures.includes(feature)
    } catch (error) {
      console.error("Subscription check error:", error)
      return false
    }
  }
}

export const webhookClient = new WebhookClient()

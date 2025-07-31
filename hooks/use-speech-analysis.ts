"use client"

import { useState, useCallback } from "react"
import { webhookClient } from "@/lib/webhook-client"
import { useAuth } from "@/components/auth/auth-provider"

interface SpeechAnalysisState {
  isProcessing: boolean
  progress: number
  result: any | null
  error: string | null
}

export function useSpeechAnalysis() {
  const [state, setState] = useState<SpeechAnalysisState>({
    isProcessing: false,
    progress: 0,
    result: null,
    error: null,
  })

  const { user } = useAuth()

  const processSpeech = useCallback(
    async (audioBlob: Blob, targetSentence: string, accentType: string, difficulty?: string) => {
      if (!user) {
        setState((prev) => ({ ...prev, error: "User not authenticated" }))
        return
      }

      // Check subscription access for advanced features
      if (difficulty === "advanced") {
        const hasAccess = await webhookClient.checkSubscriptionAccess("advanced_feedback")
        if (!hasAccess) {
          setState((prev) => ({
            ...prev,
            error: "Advanced speech analysis requires a premium subscription",
          }))
          return
        }
      }

      setState({
        isProcessing: true,
        progress: 0,
        result: null,
        error: null,
      })

      try {
        // Convert audio to base64
        const audioBase64 = await webhookClient.audioToBase64(audioBlob)

        // Process speech with progress updates
        const result = await webhookClient.processSpeech(
          {
            audioFile: audioBase64,
            targetSentence,
            accentType,
            difficulty,
            sessionId: `session_${Date.now()}_${user.id}`,
          },
          (progress) => {
            setState((prev) => ({ ...prev, progress }))
          },
        )

        if (result.success) {
          setState({
            isProcessing: false,
            progress: 100,
            result: result.data,
            error: null,
          })

          // Update user progress
          await webhookClient.userAction({
            actionType: "progress_update",
            progressData: {
              accentType,
              accuracyScore: result.data.overallAccuracy,
              practiceTime: Math.ceil(result.data.processingTime / 60),
            },
          })
        } else {
          setState({
            isProcessing: false,
            progress: 0,
            result: null,
            error: result.error || "Speech analysis failed",
          })
        }
      } catch (error) {
        console.error("Speech analysis error:", error)
        setState({
          isProcessing: false,
          progress: 0,
          result: null,
          error: error instanceof Error ? error.message : "An unexpected error occurred",
        })
      }
    },
    [user],
  )

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      progress: 0,
      result: null,
      error: null,
    })
  }, [])

  return {
    ...state,
    processSpeech,
    reset,
  }
}

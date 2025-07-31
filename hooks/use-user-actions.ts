"use client"

import { useState, useCallback } from "react"
import { webhookClient } from "@/lib/webhook-client"
import { useAuth } from "@/components/auth/auth-provider"

interface UserActionState {
  isLoading: boolean
  error: string | null
  lastAction: string | null
}

export function useUserActions() {
  const [state, setState] = useState<UserActionState>({
    isLoading: false,
    error: null,
    lastAction: null,
  })

  const { user, refreshUser } = useAuth()

  const executeAction = useCallback(
    async (actionType: string, data: any) => {
      setState({
        isLoading: true,
        error: null,
        lastAction: actionType,
      })

      try {
        const result = await webhookClient.userAction({
          actionType: actionType as any,
          ...data,
        })

        if (result.success) {
          setState({
            isLoading: false,
            error: null,
            lastAction: actionType,
          })

          // Refresh user data if needed
          if (actionType === "upgrade" || actionType === "subscription_change") {
            await refreshUser()
          }

          return result.data
        } else {
          setState({
            isLoading: false,
            error: result.error || "Action failed",
            lastAction: actionType,
          })
          return null
        }
      } catch (error) {
        console.error("User action error:", error)
        setState({
          isLoading: false,
          error: error instanceof Error ? error.message : "An unexpected error occurred",
          lastAction: actionType,
        })
        return null
      }
    },
    [refreshUser],
  )

  const upgradeSubscription = useCallback(
    async (tier: "standard" | "pro") => {
      return executeAction("upgrade", {
        userData: { subscriptionTier: tier },
      })
    },
    [executeAction],
  )

  const updateProgress = useCallback(
    async (progressData: any) => {
      return executeAction("progress_update", { progressData })
    },
    [executeAction],
  )

  const unlockAchievement = useCallback(
    async (badgeId: string, progress?: number) => {
      return executeAction("achievement_unlock", {
        achievementData: { badgeId, progress },
      })
    },
    [executeAction],
  )

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastAction: null,
    })
  }, [])

  return {
    ...state,
    executeAction,
    upgradeSubscription,
    updateProgress,
    unlockAchievement,
    reset,
  }
}

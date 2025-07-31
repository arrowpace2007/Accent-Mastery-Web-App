import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface UserActionRequest {
  actionType: "signup" | "upgrade" | "progress_update" | "subscription_change" | "achievement_unlock"
  userData?: {
    email?: string
    fullName?: string
    subscriptionTier?: "free" | "standard" | "pro"
    preferences?: Record<string, any>
  }
  progressData?: {
    accentType?: string
    accuracyScore?: number
    practiceTime?: number
    streak?: number
    masteredPhonemes?: string[]
  }
  achievementData?: {
    badgeId?: string
    progress?: number
  }
  metadata?: Record<string, any>
}

interface UserActionResponse {
  success: boolean
  data?: {
    user?: {
      id: string
      email: string
      fullName: string
      subscriptionTier: string
      onboardingCompleted: boolean
      preferredAccents: string[]
    }
    subscription?: {
      tier: string
      features: Record<string, any>
      expiresAt?: string
      status: string
    }
    progress?: {
      totalSessions: number
      averageAccuracy: number
      currentStreak: number
      totalPracticeTime: number
      masteredPhonemes: string[]
    }
    achievements?: Array<{
      id: string
      name: string
      earned: boolean
      progress?: number
    }>
  }
  error?: string
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const body: UserActionRequest = await request.json()

    if (!body.actionType) {
      return NextResponse.json({ success: false, error: "Missing actionType" }, { status: 400 })
    }

    // For signup actions, we might not have a session yet
    let session = null
    let userId = null

    if (body.actionType !== "signup") {
      const {
        data: { session: currentSession },
        error: authError,
      } = await supabase.auth.getSession()

      if (authError || !currentSession) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
      }

      session = currentSession
      userId = currentSession.user.id
    }

    // Prepare payload for Make.com webhook
    const makePayload = {
      actionType: body.actionType,
      userId: userId,
      userData: body.userData,
      progressData: body.progressData,
      achievementData: body.achievementData,
      metadata: body.metadata,
      timestamp: new Date().toISOString(),
    }

    // Call Make.com webhook
    const makeWebhookUrl = process.env.MAKE_USER_ACTION_WEBHOOK_URL
    if (!makeWebhookUrl) {
      return NextResponse.json({ success: false, error: "User action service unavailable" }, { status: 503 })
    }

    const makeResponse = await fetch(makeWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAKE_API_KEY}`,
        ...(userId && { "X-User-ID": userId }),
      },
      body: JSON.stringify(makePayload),
    })

    if (!makeResponse.ok) {
      console.error("Make.com user action webhook failed:", makeResponse.status, makeResponse.statusText)
      return NextResponse.json({ success: false, error: "User action processing failed" }, { status: 500 })
    }

    const actionResult = await makeResponse.json()

    // Handle different action types
    const responseData: any = {}

    switch (body.actionType) {
      case "signup":
        // Handle signup completion
        if (body.userData?.email && userId) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .update({
              full_name: body.userData.fullName,
              subscription_tier: body.userData.subscriptionTier || "free",
            })
            .eq("id", userId)
            .select()
            .single()

          if (!userError && userData) {
            responseData.user = userData
          }
        }
        break

      case "upgrade":
        // Handle subscription upgrade
        if (userId && body.userData?.subscriptionTier) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .update({
              subscription_tier: body.userData.subscriptionTier,
            })
            .eq("id", userId)
            .select()
            .single()

          if (!userError && userData) {
            responseData.user = userData
            responseData.subscription = {
              tier: userData.subscription_tier,
              features: getSubscriptionFeatures(userData.subscription_tier),
              status: "active",
            }
          }
        }
        break

      case "progress_update":
        // Handle progress update
        if (userId && body.progressData) {
          const { data: progressData, error: progressError } = await supabase
            .from("progress_tracking")
            .upsert({
              user_id: userId,
              accent_type: body.progressData.accentType || "american",
              weekly_streak: body.progressData.streak || 0,
              total_practice_time: body.progressData.practiceTime || 0,
              mastered_phonemes: body.progressData.masteredPhonemes || [],
            })
            .select()
            .single()

          if (!progressError && progressData) {
            // Get aggregated progress stats
            const { data: sessions } = await supabase
              .from("practice_sessions")
              .select("accuracy_score")
              .eq("user_id", userId)

            const averageAccuracy =
              sessions && sessions.length > 0
                ? sessions.reduce((sum, s) => sum + (s.accuracy_score || 0), 0) / sessions.length
                : 0

            responseData.progress = {
              totalSessions: sessions?.length || 0,
              averageAccuracy: Math.round(averageAccuracy),
              currentStreak: progressData.weekly_streak,
              totalPracticeTime: progressData.total_practice_time,
              masteredPhonemes: progressData.mastered_phonemes,
            }
          }
        }
        break

      case "achievement_unlock":
        // Handle achievement unlock
        if (userId && body.achievementData?.badgeId) {
          const { error: badgeError } = await supabase.from("user_badges").upsert({
            user_id: userId,
            badge_id: body.achievementData.badgeId,
            progress_value: body.achievementData.progress,
          })

          if (!badgeError) {
            // Get user's achievements
            const { data: achievements } = await supabase
              .from("user_badges")
              .select("*, badges(*)")
              .eq("user_id", userId)

            responseData.achievements = achievements?.map((a) => ({
              id: a.badge_id,
              name: a.badges?.name,
              earned: true,
              progress: a.progress_value,
            }))
          }
        }
        break
    }

    // Merge Make.com response with our database updates
    const response: UserActionResponse = {
      success: true,
      data: {
        ...responseData,
        ...actionResult.data,
      },
      message: actionResult.message || `${body.actionType} completed successfully`,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("User action error:", error)
    return NextResponse.json({ success: false, error: "Internal server error during user action" }, { status: 500 })
  }
}

function getSubscriptionFeatures(tier: string) {
  const features = {
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
      maxPracticeSessions: -1,
      maxAccents: -1,
      hasAdvancedFeedback: true,
      hasCoaching: true,
      hasCommunityFeatures: true,
      hasOfflineMode: true,
    },
  }

  return features[tier as keyof typeof features] || features.free
}

export async function GET() {
  return NextResponse.json({ message: "User action endpoint. Use POST method." }, { status: 405 })
}

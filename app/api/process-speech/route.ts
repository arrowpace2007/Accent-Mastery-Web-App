import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface SpeechAnalysisRequest {
  audioFile: string // Base64 encoded audio
  targetSentence: string
  accentType: string
  userId: string
  sessionId?: string
  difficulty?: string
}

interface PhonemeAnalysis {
  symbol: string
  accuracy: number
  feedback: string
  tips: string[]
}

interface SpeechAnalysisResponse {
  success: boolean
  data?: {
    overallAccuracy: number
    phonemeAnalysis: PhonemeAnalysis[]
    wordFeedback: Array<{
      word: string
      accuracy: number
      status: "excellent" | "good" | "needs-work"
      phonemes: PhonemeAnalysis[]
    }>
    improvementTips: string[]
    recommendedExercises: Array<{
      title: string
      description: string
      difficulty: string
    }>
    processingTime: number
    audioQuality: "excellent" | "good" | "poor"
  }
  error?: string
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verify authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get user data to check subscription tier
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("subscription_tier, id")
      .eq("id", session.user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const body: SpeechAnalysisRequest = await request.json()

    // Validate request data
    if (!body.audioFile || !body.targetSentence || !body.accentType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: audioFile, targetSentence, accentType" },
        { status: 400 },
      )
    }

    // Check if user has access to advanced analysis (premium feature)
    const isAdvancedAnalysis = body.difficulty === "advanced"
    if (isAdvancedAnalysis && userData.subscription_tier === "free") {
      return NextResponse.json(
        {
          success: false,
          error: "Advanced speech analysis requires a premium subscription",
          upgradeRequired: true,
        },
        { status: 403 },
      )
    }

    // Prepare payload for Make.com webhook
    const makePayload = {
      audioFile: body.audioFile,
      targetSentence: body.targetSentence,
      accentType: body.accentType,
      userId: session.user.id,
      userTier: userData.subscription_tier,
      sessionId: body.sessionId || `session_${Date.now()}`,
      difficulty: body.difficulty || "intermediate",
      timestamp: new Date().toISOString(),
      analysisType: isAdvancedAnalysis ? "advanced" : "standard",
    }

    // Call Make.com webhook
    const makeWebhookUrl = process.env.MAKE_SPEECH_ANALYSIS_WEBHOOK_URL
    if (!makeWebhookUrl) {
      return NextResponse.json({ success: false, error: "Speech analysis service unavailable" }, { status: 503 })
    }

    const makeResponse = await fetch(makeWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAKE_API_KEY}`,
        "X-User-ID": session.user.id,
        "X-User-Tier": userData.subscription_tier,
      },
      body: JSON.stringify(makePayload),
    })

    if (!makeResponse.ok) {
      console.error("Make.com webhook failed:", makeResponse.status, makeResponse.statusText)
      return NextResponse.json({ success: false, error: "Speech analysis processing failed" }, { status: 500 })
    }

    const analysisResult = await makeResponse.json()

    // Store practice session in database
    const { error: sessionError } = await supabase.from("practice_sessions").insert({
      user_id: session.user.id,
      target_accent: body.accentType,
      sentence_text: body.targetSentence,
      accuracy_score: analysisResult.overallAccuracy,
      phoneme_feedback: analysisResult.phonemeAnalysis,
      session_type: "pronunciation",
      content_type: "sentence",
      duration_minutes: Math.ceil(analysisResult.processingTime / 60),
      difficulty_level: body.difficulty || "intermediate",
    })

    if (sessionError) {
      console.error("Failed to store practice session:", sessionError)
    }

    // Update user progress
    const { error: progressError } = await supabase
      .from("progress_tracking")
      .upsert({
        user_id: session.user.id,
        accent_type: body.accentType,
        total_practice_time: supabase.raw("total_practice_time + ?", [Math.ceil(analysisResult.processingTime / 60)]),
        mastered_phonemes: analysisResult.phonemeAnalysis
          .filter((p: PhonemeAnalysis) => p.accuracy >= 90)
          .map((p: PhonemeAnalysis) => p.symbol),
      })
      .select()

    if (progressError) {
      console.error("Failed to update progress:", progressError)
    }

    const response: SpeechAnalysisResponse = {
      success: true,
      data: {
        overallAccuracy: analysisResult.overallAccuracy,
        phonemeAnalysis: analysisResult.phonemeAnalysis,
        wordFeedback: analysisResult.wordFeedback,
        improvementTips: analysisResult.improvementTips,
        recommendedExercises: analysisResult.recommendedExercises,
        processingTime: analysisResult.processingTime,
        audioQuality: analysisResult.audioQuality,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Speech analysis error:", error)
    return NextResponse.json({ success: false, error: "Internal server error during speech analysis" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Speech analysis endpoint. Use POST method." }, { status: 405 })
}

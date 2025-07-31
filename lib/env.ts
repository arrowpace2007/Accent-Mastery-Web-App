// Environment variables for Make.com integration
export const makeConfig = {
  speechAnalysisWebhookUrl: process.env.MAKE_SPEECH_ANALYSIS_WEBHOOK_URL,
  userActionWebhookUrl: process.env.MAKE_USER_ACTION_WEBHOOK_URL,
  apiKey: process.env.MAKE_API_KEY,
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
}

// Validate required environment variables
export function validateMakeConfig() {
  const required = ["MAKE_SPEECH_ANALYSIS_WEBHOOK_URL", "MAKE_USER_ACTION_WEBHOOK_URL", "MAKE_API_KEY"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.warn(`Missing Make.com environment variables: ${missing.join(", ")}`)
    return false
  }

  return true
}

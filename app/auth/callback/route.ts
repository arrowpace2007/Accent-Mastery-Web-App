import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/dashboard"

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) throw error

      if (data.user) {
        // Check if user profile exists, create if not
        const { data: existingUser } = await supabase.from("users").select("*").eq("id", data.user.id).single()

        if (!existingUser) {
          await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "",
            avatar_url: data.user.user_metadata?.avatar_url,
            subscription_tier: "free",
            onboarding_completed: false,
            preferred_accents: [],
          })
        }

        // Redirect based on onboarding status
        const finalRedirect = existingUser?.onboarding_completed ? redirectTo : "/onboarding"
        return NextResponse.redirect(new URL(finalRedirect, request.url))
      }
    } catch (error) {
      console.error("Auth callback error:", error)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL("/auth/auth-code-error", request.url))
}

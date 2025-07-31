import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import crypto from "crypto"

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

    const body = await request.json()
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
      amount,
      currency,
      planId,
      billingPeriod,
    } = body

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 })
    }

    // Update payment transaction
    const { error: updateError } = await supabase
      .from("payment_transactions")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "completed",
        completed_at: new Date().toISOString(),
        net_amount: amount,
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .eq("user_id", session.user.id)

    if (updateError) {
      console.error("Payment update error:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update payment" }, { status: 500 })
    }

    // Get subscription plan details
    const { data: planData, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("name", planId)
      .single()

    if (planError || !planData) {
      console.error("Plan fetch error:", planError)
      return NextResponse.json({ success: false, error: "Invalid plan" }, { status: 400 })
    }

    // Calculate subscription expiry
    const now = new Date()
    const expiryDate = new Date(now)
    if (billingPeriod === "yearly") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1)
    }

    // Update user subscription
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        subscription_plan_id: planData.id,
        subscription_status: "active",
        subscription_expires_at: expiryDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)

    if (userUpdateError) {
      console.error("User update error:", userUpdateError)
      return NextResponse.json({ success: false, error: "Failed to update subscription" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and subscription activated",
      subscription: {
        plan: planData.display_name,
        expiresAt: expiryDate.toISOString(),
        status: "active",
      },
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 500 })
  }
}

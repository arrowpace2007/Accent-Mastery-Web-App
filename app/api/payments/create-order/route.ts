import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Razorpay from "razorpay"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

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
    const { amount, currency, planId, planName, billingPeriod, userId, userEmail, userName } = body

    // Validate required fields
    if (!amount || !currency || !planId || !billingPeriod || !userId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create Razorpay order
    const orderOptions = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency,
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        planId,
        planName,
        billingPeriod,
        userId,
        userEmail,
      },
    }

    const order = await razorpay.orders.create(orderOptions)

    // Store order in database
    const { error: dbError } = await supabase.from("payment_transactions").insert({
      user_id: userId,
      razorpay_order_id: order.id,
      amount: amount,
      currency: currency,
      status: "pending",
      billing_period: billingPeriod,
      metadata: {
        planId,
        planName,
        razorpayOrderData: order,
      },
    })

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ success: false, error: "Failed to store order" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      planId,
      billingPeriod,
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
  }
}

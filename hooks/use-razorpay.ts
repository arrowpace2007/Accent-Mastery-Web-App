"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/auth"

interface PaymentData {
  amount: number
  currency: string
  planId: string
  planName: string
  billingPeriod: "monthly" | "yearly"
  userId: string
  userEmail: string
  userName: string
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { refreshUser } = useAuth()
  const supabase = createClient()

  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }, [])

  const createOrder = useCallback(async (paymentData: PaymentData) => {
    const response = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create order")
    }

    return response.json()
  }, [])

  const verifyPayment = useCallback(async (paymentResponse: RazorpayResponse, orderData: any) => {
    const response = await fetch("/api/payments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...paymentResponse,
        orderId: orderData.id,
        amount: orderData.amount,
        currency: orderData.currency,
        planId: orderData.planId,
        billingPeriod: orderData.billingPeriod,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Payment verification failed")
    }

    return response.json()
  }, [])

  const initiatePayment = useCallback(
    async (paymentData: PaymentData) => {
      setLoading(true)
      setError(null)

      try {
        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded) {
          throw new Error("Failed to load Razorpay SDK")
        }

        // Create order
        const orderData = await createOrder(paymentData)

        // Configure Razorpay options
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Accent Mastery",
          description: `${paymentData.planName} - ${paymentData.billingPeriod}`,
          order_id: orderData.id,
          prefill: {
            name: paymentData.userName,
            email: paymentData.userEmail,
          },
          theme: {
            color: "#3B82F6",
          },
          handler: async (response: RazorpayResponse) => {
            try {
              // Verify payment
              const verificationResult = await verifyPayment(response, orderData)

              if (verificationResult.success) {
                // Update user subscription
                await refreshUser()

                // Show success message
                alert("Payment successful! Your subscription has been activated.")

                // Redirect to dashboard
                window.location.href = "/dashboard"
              } else {
                throw new Error("Payment verification failed")
              }
            } catch (verifyError) {
              console.error("Payment verification error:", verifyError)
              setError("Payment verification failed. Please contact support.")
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false)
            },
          },
        }

        // Open Razorpay checkout
        const razorpay = new window.Razorpay(options)
        razorpay.open()
      } catch (err) {
        console.error("Payment initiation error:", err)
        setError(err instanceof Error ? err.message : "Payment initiation failed")
        setLoading(false)
      }
    },
    [loadRazorpayScript, createOrder, verifyPayment, refreshUser],
  )

  return {
    initiatePayment,
    loading,
    error,
  }
}

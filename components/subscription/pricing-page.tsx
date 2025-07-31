"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, Crown, Zap, Star, ArrowRight, Globe } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { useRazorpay } from "@/hooks/use-razorpay"

interface PricingTier {
  id: string
  name: string
  displayName: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  currency: string
  popular: boolean
  features: string[]
  limitations?: string[]
  buttonText: string
  buttonVariant: "default" | "outline"
  icon: React.ReactNode
  color: string
}

const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "free",
    displayName: "Free",
    description: "Perfect for getting started with accent training",
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: "INR",
    popular: false,
    features: [
      "5 practice sessions per month",
      "1 accent choice (American English)",
      "Basic pronunciation feedback",
      "Progress tracking",
      "Mobile app access",
      "Community support",
    ],
    limitations: ["Limited practice sessions", "Basic feedback only", "No offline mode"],
    buttonText: "Get Started Free",
    buttonVariant: "outline",
    icon: <Star className="h-6 w-6" />,
    color: "gray",
  },
  {
    id: "standard",
    name: "standard",
    displayName: "Standard",
    description: "Most popular for serious accent learners",
    monthlyPrice: 499,
    yearlyPrice: 4990,
    currency: "INR",
    popular: true,
    features: [
      "100 practice sessions per month",
      "3 accent choices",
      "Advanced AI feedback with phonetic analysis",
      "Detailed progress analytics",
      "Offline practice mode",
      "Community challenges",
      "Email support",
      "Export progress reports",
    ],
    buttonText: "Start Standard Plan",
    buttonVariant: "default",
    icon: <Zap className="h-6 w-6" />,
    color: "blue",
  },
  {
    id: "pro",
    name: "pro",
    displayName: "Pro",
    description: "For accent mastery professionals and serious learners",
    monthlyPrice: 1199,
    yearlyPrice: 11990,
    currency: "INR",
    popular: false,
    features: [
      "Unlimited practice sessions",
      "All accent options (6+ accents)",
      "Advanced AI feedback with detailed phonetic analysis",
      "1-on-1 coaching sessions (2 per month)",
      "Custom practice plans",
      "Priority support",
      "Advanced speech analysis",
      "API access for developers",
      "White-label options",
    ],
    buttonText: "Go Pro",
    buttonVariant: "default",
    icon: <Crown className="h-6 w-6" />,
    color: "purple",
  },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const { user } = useAuth()
  const { initiatePayment, loading } = useRazorpay()

  const handleSubscribe = async (tier: PricingTier) => {
    if (!user) {
      // Redirect to signup
      window.location.href = "/auth/signup"
      return
    }

    if (tier.name === "free") {
      // Handle free plan selection
      window.location.href = "/dashboard"
      return
    }

    const amount = isYearly ? tier.yearlyPrice : tier.monthlyPrice
    const billingPeriod = isYearly ? "yearly" : "monthly"

    try {
      await initiatePayment({
        amount,
        currency: tier.currency,
        planId: tier.id,
        planName: tier.displayName,
        billingPeriod,
        userId: user.id,
        userEmail: user.email,
        userName: user.full_name,
      })
    } catch (error) {
      console.error("Payment initiation failed:", error)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Free"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price)
  }

  const calculateSavings = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0
    const monthlyCost = monthly * 12
    const savings = monthlyCost - yearly
    return Math.round((savings / monthlyCost) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Accent Mastery
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-blue-600 font-medium">
              Pricing
            </Link>
            <Link href="/#community" className="text-gray-600 hover:text-gray-900 transition-colors">
              Community
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start free and upgrade as you progress in your accent mastery journey. All plans include our core features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${!isYearly ? "text-gray-900" : "text-gray-500"}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm font-medium ${isYearly ? "text-gray-900" : "text-gray-500"}`}>Yearly</span>
            <Badge className="bg-green-100 text-green-800 ml-2">Save up to 17%</Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {pricingTiers.map((tier) => {
            const price = isYearly ? tier.yearlyPrice : tier.monthlyPrice
            const savings = calculateSavings(tier.monthlyPrice, tier.yearlyPrice)

            return (
              <Card
                key={tier.id}
                className={`relative ${
                  tier.popular
                    ? "border-2 border-blue-500 shadow-xl scale-105 bg-gradient-to-b from-blue-50 to-white"
                    : "border shadow-md hover:shadow-lg transition-shadow"
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div
                      className={`p-3 rounded-full ${
                        tier.color === "blue"
                          ? "bg-blue-100 text-blue-600"
                          : tier.color === "purple"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tier.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{tier.displayName}</CardTitle>
                  <CardDescription className="text-base">{tier.description}</CardDescription>

                  <div className="mt-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {formatPrice(price, tier.currency)}
                      {price > 0 && (
                        <span className="text-lg font-normal text-gray-600">/{isYearly ? "year" : "month"}</span>
                      )}
                    </div>
                    {isYearly && savings > 0 && (
                      <div className="text-sm text-green-600 font-medium mt-1">Save {savings}% annually</div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {tier.limitations && (
                    <div className="mb-6">
                      <p className="text-xs text-gray-500 mb-2">Limitations:</p>
                      <ul className="space-y-1">
                        {tier.limitations.map((limitation, index) => (
                          <li key={index} className="text-xs text-gray-500">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handleSubscribe(tier)}
                    disabled={loading}
                    className={`w-full ${
                      tier.popular
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : tier.name === "pro"
                          ? "bg-purple-500 hover:bg-purple-600 text-white"
                          : ""
                    }`}
                    variant={tier.buttonVariant}
                  >
                    {loading ? "Processing..." : tier.buttonText}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  {user?.subscription_tier === tier.name && (
                    <div className="text-center mt-3">
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll
                  prorate the billing accordingly.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-gray-600 text-sm">
                  Our Free plan gives you access to core features. Paid plans come with a 7-day money-back guarantee.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600 text-sm">
                  We accept all major credit/debit cards, UPI, net banking, and digital wallets through Razorpay.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">How does the AI feedback work?</h3>
                <p className="text-gray-600 text-sm">
                  Our AI analyzes your pronunciation in real-time, providing detailed feedback on individual sounds,
                  rhythm, and intonation patterns.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can I use the app offline?</h3>
                <p className="text-gray-600 text-sm">
                  Standard and Pro plans include offline mode, allowing you to practice without an internet connection.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-gray-600 text-sm">
                  Yes, we offer a 7-day money-back guarantee for all paid plans. Contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Master Your Accent?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of learners who have transformed their pronunciation with our AI-powered platform.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
            <Link href="/auth/signup">
              Start Your Journey Today
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}

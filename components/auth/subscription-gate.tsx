"use client"

import type React from "react"

import { useAuth } from "./auth-provider"
import { canAccessFeature, type SUBSCRIPTION_FEATURES } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Lock, Zap } from "lucide-react"
import Link from "next/link"

interface SubscriptionGateProps {
  feature: keyof typeof SUBSCRIPTION_FEATURES.free
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredTier?: "standard" | "pro"
}

export function SubscriptionGate({ feature, children, fallback, requiredTier = "standard" }: SubscriptionGateProps) {
  const { user } = useAuth()

  if (!user) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6 text-center">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Please sign in to access this feature</p>
          <Button asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const hasAccess = canAccessFeature(user.subscription_tier, feature)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <Card className="border-2 border-dashed border-orange-300 bg-orange-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {requiredTier === "pro" ? (
            <Crown className="h-12 w-12 text-yellow-500" />
          ) : (
            <Zap className="h-12 w-12 text-blue-500" />
          )}
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          Upgrade to {requiredTier === "pro" ? "Pro" : "Standard"}
          <Badge variant={requiredTier === "pro" ? "default" : "secondary"}>
            {requiredTier === "pro" ? "PRO" : "STANDARD"}
          </Badge>
        </CardTitle>
        <CardDescription>This feature requires a {requiredTier} subscription to access</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          Current plan: <Badge variant="outline">{user.subscription_tier.toUpperCase()}</Badge>
        </p>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          Upgrade Now
        </Button>
      </CardContent>
    </Card>
  )
}

// Usage examples for different features
export function PremiumFeature({ children }: { children: React.ReactNode }) {
  return (
    <SubscriptionGate feature="hasAdvancedFeedback" requiredTier="standard">
      {children}
    </SubscriptionGate>
  )
}

export function ProFeature({ children }: { children: React.ReactNode }) {
  return (
    <SubscriptionGate feature="hasCoaching" requiredTier="pro">
      {children}
    </SubscriptionGate>
  )
}

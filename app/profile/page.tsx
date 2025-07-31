"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { User, Crown, Settings, LogOut, Camera, Save, AlertCircle, CheckCircle, Target, Globe } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/auth"
import { getSubscriptionFeatures } from "@/lib/auth"

export default function ProfilePage() {
  const { user, signOut, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fullName, setFullName] = useState(user?.full_name || "")
  const router = useRouter()
  const supabase = createClient()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const subscriptionFeatures = getSubscriptionFeatures(user.subscription_tier)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { error } = await supabase.from("users").update({ full_name: fullName }).eq("id", user.id)

      if (error) throw error

      await refreshUser()
      setSuccess("Profile updated successfully!")
    } catch (err: any) {
      setError(err.message || "An error occurred while updating your profile")
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case "pro":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
      case "standard":
        return "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Accent Mastery
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/practice" className="text-gray-600 hover:text-gray-900 transition-colors">
              Practice
            </Link>
            <Link href="/community" className="text-gray-600 hover:text-gray-900 transition-colors">
              Community
            </Link>
            <Link href="/profile" className="text-blue-600 font-medium">
              Profile
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Badge className={getSubscriptionBadgeColor(user.subscription_tier)}>
              {user.subscription_tier.toUpperCase()}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile & Settings</h1>
            <p className="text-gray-600">Manage your account and subscription preferences</p>
          </div>

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-500" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-transparent"
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="font-medium">{user.full_name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <Badge className={`mt-1 ${getSubscriptionBadgeColor(user.subscription_tier)}`}>
                        {user.subscription_tier.toUpperCase()} Plan
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Form */}
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={saving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user.email} disabled className="bg-gray-50" />
                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Accents</Label>
                      <div className="flex flex-wrap gap-2">
                        {user.preferred_accents.map((accent) => (
                          <Badge key={accent} variant="secondary" className="capitalize">
                            <Globe className="h-3 w-3 mr-1" />
                            {accent}
                          </Badge>
                        ))}
                        {user.preferred_accents.length === 0 && (
                          <p className="text-sm text-gray-500">No accents selected</p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={saving || fullName === user.full_name}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                      <Save className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-gray-500" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/auth/forgot-password">Change</Link>
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <h4 className="font-medium text-red-800">Sign Out</h4>
                      <p className="text-sm text-red-600">Sign out of your account</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      disabled={loading}
                      className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                    >
                      {loading ? "Signing out..." : "Sign Out"}
                      <LogOut className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                    Subscription
                  </CardTitle>
                  <CardDescription>Your current plan and features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <Badge className={`text-lg px-4 py-2 ${getSubscriptionBadgeColor(user.subscription_tier)}`}>
                      {user.subscription_tier.toUpperCase()} PLAN
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Plan Features:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {subscriptionFeatures.maxPracticeSessions === -1
                          ? "Unlimited practice sessions"
                          : `${subscriptionFeatures.maxPracticeSessions} practice sessions`}
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {subscriptionFeatures.maxAccents === -1
                          ? "All accent options"
                          : `${subscriptionFeatures.maxAccents} accent${subscriptionFeatures.maxAccents > 1 ? "s" : ""}`}
                      </li>
                      <li className="flex items-center">
                        {subscriptionFeatures.hasAdvancedFeedback ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-2" />
                        )}
                        Advanced AI feedback
                      </li>
                      <li className="flex items-center">
                        {subscriptionFeatures.hasCoaching ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-2" />
                        )}
                        1-on-1 coaching sessions
                      </li>
                      <li className="flex items-center">
                        {subscriptionFeatures.hasOfflineMode ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-2" />
                        )}
                        Offline practice mode
                      </li>
                    </ul>
                  </div>

                  {user.subscription_tier === "free" && (
                    <div className="pt-4 border-t">
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                        Upgrade to Standard
                      </Button>
                    </div>
                  )}

                  {user.subscription_tier === "standard" && (
                    <div className="pt-4 border-t">
                      <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Member since</span>
                    <span className="text-sm font-medium">{new Date(user.id).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Onboarding</span>
                    <Badge variant={user.onboarding_completed ? "default" : "secondary"}>
                      {user.onboarding_completed ? "Complete" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Preferred Accents</span>
                    <span className="text-sm font-medium">{user.preferred_accents.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

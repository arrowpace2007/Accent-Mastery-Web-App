"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Flame,
  Target,
  Clock,
  Mic,
  Users,
  TrendingUp,
  Star,
  Trophy,
  Calendar,
  BarChart3,
  Crown,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { useProgressTracking } from "@/hooks/use-progress-tracking"
import { useAchievements } from "@/hooks/use-achievements"
import { AchievementNotification } from "@/components/achievements/achievement-notification"

interface DashboardStats {
  currentStreak: number
  longestStreak: number
  totalSessions: number
  totalPracticeTime: number
  averageAccuracy: number
  masteredPhonemes: number
  weeklyGoal: number
  weeklyProgress: number
}

export default function UserDashboard() {
  const { user } = useAuth()
  const { progress, loading: progressLoading } = useProgressTracking()
  const { achievements, newAchievements, markAsNotified } = useAchievements()
  const [stats, setStats] = useState<DashboardStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    totalPracticeTime: 0,
    averageAccuracy: 0,
    masteredPhonemes: 0,
    weeklyGoal: 5,
    weeklyProgress: 0,
  })

  useEffect(() => {
    if (progress.length > 0) {
      const totalSessions = progress.reduce((sum, p) => sum + p.sessions_completed, 0)
      const totalTime = progress.reduce((sum, p) => sum + p.total_practice_time, 0)
      const avgAccuracy = progress.reduce((sum, p) => sum + (p.average_accuracy || 0), 0) / progress.length
      const currentStreak = Math.max(...progress.map((p) => p.streak_count))
      const masteredPhonemes = new Set(progress.flatMap((p) => p.sounds_practiced || [])).size

      // Calculate weekly progress
      const thisWeek = new Date()
      thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay())
      const weeklyProgress = progress
        .filter((p) => new Date(p.date) >= thisWeek)
        .reduce((sum, p) => sum + p.sessions_completed, 0)

      setStats({
        currentStreak,
        longestStreak: currentStreak, // Simplified for demo
        totalSessions,
        totalPracticeTime: totalTime,
        averageAccuracy: Math.round(avgAccuracy),
        masteredPhonemes,
        weeklyGoal: 5,
        weeklyProgress,
      })
    }
  }, [progress])

  const getSubscriptionBadge = () => {
    if (!user?.subscription_tier) return null

    const badges = {
      free: { label: "Free", color: "bg-gray-100 text-gray-800", icon: <Star className="h-3 w-3" /> },
      standard: { label: "Standard", color: "bg-blue-100 text-blue-800", icon: <Zap className="h-3 w-3" /> },
      pro: { label: "Pro", color: "bg-purple-100 text-purple-800", icon: <Crown className="h-3 w-3" /> },
    }

    const badge = badges[user.subscription_tier as keyof typeof badges]
    if (!badge) return null

    return (
      <Badge className={`${badge.color} flex items-center gap-1`}>
        {badge.icon}
        {badge.label}
      </Badge>
    )
  }

  const recentAchievements = achievements.filter((a) => a.is_earned).slice(0, 3)
  const weeklyProgressPercentage = Math.min((stats.weeklyProgress / stats.weeklyGoal) * 100, 100)

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Achievement Notifications */}
      {newAchievements.map((achievement) => (
        <AchievementNotification
          key={achievement.id}
          achievement={achievement}
          onClose={() => markAsNotified(achievement.id)}
        />
      ))}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                    {user.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Welcome back, {user.full_name}! 👋</h1>
                  <p className="text-gray-600">Ready to continue your accent journey?</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getSubscriptionBadge()}
                    <Badge variant="outline" className="text-xs">
                      Level: {user.current_level}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 bg-orange-100 px-3 py-1 rounded-full mb-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">{stats.currentStreak} day streak</span>
                </div>
                <p className="text-sm text-gray-600">Keep it up!</p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Current Streak</p>
                    <p className="text-3xl font-bold">{stats.currentStreak} days</p>
                  </div>
                  <Flame className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Sessions</p>
                    <p className="text-3xl font-bold">{stats.totalSessions}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Avg Accuracy</p>
                    <p className="text-3xl font-bold">{stats.averageAccuracy}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100">Practice Time</p>
                    <p className="text-3xl font-bold">{stats.totalPracticeTime}m</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Weekly Goal Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Weekly Goal Progress
                  </CardTitle>
                  <CardDescription>Complete {stats.weeklyGoal} practice sessions this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sessions This Week</span>
                      <span className="font-medium">
                        {stats.weeklyProgress} of {stats.weeklyGoal}
                      </span>
                    </div>
                    <Progress value={weeklyProgressPercentage} className="h-3" />
                    {weeklyProgressPercentage >= 100 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <Trophy className="h-6 w-6 text-green-500 mx-auto mb-1" />
                        <p className="text-sm font-medium text-green-800">Weekly goal completed! 🎉</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Practice */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mic className="h-5 w-5 mr-2 text-blue-500" />
                    Quick Practice
                  </CardTitle>
                  <CardDescription>Jump into a practice session based on your preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="h-20 flex-col space-y-2" asChild>
                      <Link href="/practice">
                        <Mic className="h-6 w-6" />
                        <span>Standard Practice</span>
                      </Link>
                    </Button>
                    <Button className="h-20 flex-col space-y-2 bg-transparent" variant="outline" asChild>
                      <Link href="/practice/advanced">
                        <BarChart3 className="h-6 w-6" />
                        <span>Advanced Analysis</span>
                      </Link>
                    </Button>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Recommended for you:</p>
                    <Badge variant="outline">American English - Vowel Sounds</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    Recent Achievements
                  </CardTitle>
                  <CardDescription>Your latest accomplishments</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentAchievements.length > 0 ? (
                    <div className="space-y-3">
                      {recentAchievements.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                        >
                          <div className="text-2xl">{achievement.achievements?.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-yellow-800">{achievement.achievements?.display_name}</h4>
                            <p className="text-sm text-yellow-700">{achievement.achievements?.description}</p>
                          </div>
                          <Badge className="bg-yellow-500 text-white">+{achievement.achievements?.points} pts</Badge>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                        <Link href="/achievements">View All Achievements</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Complete practice sessions to earn achievements!</p>
                      <Button className="mt-4" asChild>
                        <Link href="/practice">Start Practicing</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mastered Sounds</span>
                      <span className="font-medium">{stats.masteredPhonemes}/44</span>
                    </div>
                    <Progress value={(stats.masteredPhonemes / 44) * 100} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Accuracy Goal</span>
                      <span className="font-medium">{stats.averageAccuracy}/90%</span>
                    </div>
                    <Progress value={(stats.averageAccuracy / 90) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                    <Link href="/practice">
                      <Mic className="h-4 w-4 mr-2" />
                      Start Practice Session
                    </Link>
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                    <Link href="/community">
                      <Users className="h-4 w-4 mr-2" />
                      Join Community Challenge
                    </Link>
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                    <Link href="/profile">
                      <Star className="h-4 w-4 mr-2" />
                      Update Goals
                    </Link>
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                    <Link href="/analytics">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Subscription Status */}
              {user.subscription_tier === "free" && (
                <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-2">Unlock Premium Features</h3>
                    <p className="text-sm text-purple-100 mb-4">
                      Get advanced AI feedback, unlimited sessions, and 1-on-1 coaching.
                    </p>
                    <Button size="sm" className="bg-white text-purple-600 hover:bg-gray-100" asChild>
                      <Link href="/pricing">Upgrade Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Practice Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    Practice Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-2">This Week</p>
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                        <div
                          key={index}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                            index < stats.weeklyProgress
                              ? "bg-green-500 text-white"
                              : index === new Date().getDay()
                                ? "bg-blue-100 text-blue-600 border-2 border-blue-500"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Green = Practice completed</p>
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

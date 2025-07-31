"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Trophy, Target, Flame, Clock, Star, TrendingUp, Award, CheckCircle } from "lucide-react"

interface ProgressSectionProps {
  currentSession: number
  totalSessions: number
  dailyGoal: number
  dailyProgress: number
  currentAccuracy: number
  averageAccuracy: number
  streak: number
  practiceTime: number
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: string
    earned: boolean
    progress?: number
    target?: number
  }>
  onNewAchievement?: (achievement: any) => void
}

export function ProgressSection({
  currentSession,
  totalSessions,
  dailyGoal,
  dailyProgress,
  currentAccuracy,
  averageAccuracy,
  streak,
  practiceTime,
  achievements,
  onNewAchievement,
}: ProgressSectionProps) {
  const [showAchievement, setShowAchievement] = useState<any>(null)

  useEffect(() => {
    // Check for new achievements
    const newAchievement = achievements.find((a) => a.earned && a.id === "session_complete")
    if (newAchievement && onNewAchievement) {
      setShowAchievement(newAchievement)
      setTimeout(() => setShowAchievement(null), 5000)
    }
  }, [achievements, onNewAchievement])

  const dailyProgressPercentage = Math.min((dailyProgress / dailyGoal) * 100, 100)
  const sessionProgressPercentage = Math.min((currentSession / totalSessions) * 100, 100)

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="space-y-4">
      {/* Achievement Notification */}
      {showAchievement && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-500">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg border-0 max-w-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{showAchievement.icon}</div>
                <div>
                  <h4 className="font-bold">Achievement Unlocked!</h4>
                  <p className="text-sm opacity-90">{showAchievement.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Session Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Target className="h-5 w-5 mr-2 text-blue-500" />
            Session Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Session</span>
              <span className="font-medium">
                {currentSession} of {totalSessions}
              </span>
            </div>
            <Progress value={sessionProgressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{currentAccuracy}%</div>
              <div className="text-xs text-blue-700">Current Accuracy</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{averageAccuracy}%</div>
              <div className="text-xs text-green-700">Average Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Goal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Daily Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sessions Today</span>
              <span className="font-medium">
                {dailyProgress} of {dailyGoal}
              </span>
            </div>
            <Progress value={dailyProgressPercentage} className="h-2" />
          </div>

          {dailyProgressPercentage >= 100 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-800">Daily goal completed! 🎉</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Flame className="h-5 w-5 text-orange-500 mr-1" />
                <span className="text-2xl font-bold text-orange-600">{streak}</span>
              </div>
              <div className="text-xs text-orange-700">Day Streak</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-5 w-5 text-purple-500 mr-1" />
                <span className="text-2xl font-bold text-purple-600">{formatTime(practiceTime)}</span>
              </div>
              <div className="text-xs text-purple-700">Practice Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Award className="h-5 w-5 mr-2 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.slice(0, 3).map((achievement) => (
            <div
              key={achievement.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                achievement.earned ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200 opacity-60"
              }`}
            >
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <h4 className={`font-medium text-sm ${achievement.earned ? "text-yellow-800" : "text-gray-600"}`}>
                  {achievement.title}
                </h4>
                <p className={`text-xs ${achievement.earned ? "text-yellow-700" : "text-gray-500"}`}>
                  {achievement.description}
                </p>
                {!achievement.earned && achievement.progress !== undefined && achievement.target && (
                  <div className="mt-2">
                    <Progress value={(achievement.progress / achievement.target) * 100} className="h-1" />
                    <p className="text-xs text-gray-500 mt-1">
                      {achievement.progress}/{achievement.target}
                    </p>
                  </div>
                )}
              </div>
              {achievement.earned && <Star className="h-4 w-4 text-yellow-500" />}
            </div>
          ))}

          <Button variant="outline" size="sm" className="w-full mt-3 bg-transparent">
            View All Achievements
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

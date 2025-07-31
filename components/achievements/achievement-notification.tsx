"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Trophy, Star } from "lucide-react"

interface AchievementNotificationProps {
  achievement: {
    id: string
    achievement_id: string
    achievements?: {
      display_name: string
      description: string
      icon: string
      points: number
      rarity: string
    }
  }
  onClose: () => void
}

export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 100)

    // Auto-close after 5 seconds
    const autoClose = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearTimeout(autoClose)
    }
  }, [onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "from-yellow-400 to-orange-500"
      case "epic":
        return "from-purple-400 to-pink-500"
      case "rare":
        return "from-blue-400 to-indigo-500"
      default:
        return "from-green-400 to-emerald-500"
    }
  }

  const achievementData = achievement.achievements
  if (!achievementData) return null

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <Card
        className={`bg-gradient-to-r ${getRarityColor(achievementData.rarity)} text-white shadow-2xl border-0 max-w-sm animate-bounce`}
      >
        <CardContent className="p-6 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-2 right-2 text-white hover:bg-white/20 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-4">
            <div className="text-4xl animate-pulse">{achievementData.icon}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium opacity-90">Achievement Unlocked!</span>
              </div>
              <h3 className="font-bold text-lg mb-1">{achievementData.display_name}</h3>
              <p className="text-sm opacity-90 mb-2">{achievementData.description}</p>
              <div className="flex items-center space-x-2">
                <Badge className="bg-white/20 text-white border-white/30">+{achievementData.points} points</Badge>
                <Badge className="bg-white/20 text-white border-white/30 capitalize">{achievementData.rarity}</Badge>
              </div>
            </div>
          </div>

          {/* Celebration particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <Star
                key={i}
                className={`absolute h-3 w-3 text-white animate-ping`}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

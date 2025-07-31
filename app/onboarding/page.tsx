"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Target, BarChart3, Globe, Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { updateUserProfile, updateProgressTracking } from "@/lib/supabase-hooks"
import { useUser } from "@/lib/supabase-hooks"

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    goals: [] as string[],
    currentLevel: "",
    targetAccent: "",
    interests: [] as string[],
  })
  const [saving, setSaving] = useState(false)
  const { user } = useUser()
  const router = useRouter()

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const goals = [
    { id: "professional", label: "Professional Development", icon: "💼" },
    { id: "travel", label: "Travel & Communication", icon: "✈️" },
    { id: "academic", label: "Academic Success", icon: "🎓" },
    { id: "personal", label: "Personal Growth", icon: "🌟" },
    { id: "entertainment", label: "Media & Entertainment", icon: "🎬" },
    { id: "social", label: "Social Confidence", icon: "👥" },
  ]

  const levels = [
    { id: "beginner", label: "Beginner", description: "Just starting my accent journey" },
    { id: "intermediate", label: "Intermediate", description: "Some experience with accent training" },
    { id: "advanced", label: "Advanced", description: "Looking to perfect specific sounds" },
    { id: "native-like", label: "Near-Native", description: "Fine-tuning for native-like fluency" },
  ]

  const accents = [
    { id: "american", label: "American English", flag: "🇺🇸", description: "General American accent" },
    { id: "british", label: "British English", flag: "🇬🇧", description: "Received Pronunciation (RP)" },
    { id: "australian", label: "Australian English", flag: "🇦🇺", description: "General Australian accent" },
    { id: "canadian", label: "Canadian English", flag: "🇨🇦", description: "Standard Canadian accent" },
    { id: "irish", label: "Irish English", flag: "🇮🇪", description: "Dublin Irish accent" },
    { id: "scottish", label: "Scottish English", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", description: "Edinburgh Scottish accent" },
  ]

  const interests = [
    { id: "business", label: "Business & Finance", icon: "💼" },
    { id: "technology", label: "Technology", icon: "💻" },
    { id: "healthcare", label: "Healthcare", icon: "🏥" },
    { id: "education", label: "Education", icon: "📚" },
    { id: "entertainment", label: "Entertainment", icon: "🎭" },
    { id: "sports", label: "Sports", icon: "⚽" },
    { id: "travel", label: "Travel", icon: "🌍" },
    { id: "food", label: "Food & Cooking", icon: "🍳" },
    { id: "science", label: "Science", icon: "🔬" },
    { id: "arts", label: "Arts & Culture", icon: "🎨" },
  ]

  const handleGoalToggle = (goalId: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goalId) ? prev.goals.filter((g) => g !== goalId) : [...prev.goals, goalId],
    }))
  }

  const handleInterestToggle = (interestId: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((i) => i !== interestId)
        : [...prev.interests, interestId],
    }))
  }

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    } else {
      // Complete onboarding and save to database
      setSaving(true)
      try {
        // Update user profile with onboarding completion and preferred accents
        await updateUserProfile({
          onboarding_completed: true,
          preferred_accents: [formData.targetAccent],
        })

        // Create initial progress tracking record
        await updateProgressTracking(formData.targetAccent, {
          accent_type: formData.targetAccent,
          weekly_streak: 0,
          total_practice_time: 0,
          mastered_phonemes: [],
          difficulty_level: formData.currentLevel,
        })

        router.push("/dashboard")
      } catch (error) {
        console.error("Error completing onboarding:", error)
        setSaving(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.goals.length > 0
      case 2:
        return formData.currentLevel !== ""
      case 3:
        return formData.targetAccent !== ""
      case 4:
        return formData.interests.length > 0
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">What are your goals?</h2>
              <p className="text-gray-600">Select all that apply to personalize your learning experience</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <Card
                  key={goal.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.goals.includes(goal.id) ? "ring-2 ring-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <CardContent className="p-4 flex items-center space-x-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{goal.label}</div>
                    </div>
                    <Checkbox checked={formData.goals.includes(goal.id)} onChange={() => {}} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">What's your current level?</h2>
              <p className="text-gray-600">Help us understand your starting point</p>
            </div>
            <RadioGroup
              value={formData.currentLevel}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, currentLevel: value }))}
              className="space-y-4"
            >
              {levels.map((level) => (
                <Card key={level.id} className="cursor-pointer hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={level.id} id={level.id} />
                      <Label htmlFor={level.id} className="flex-1 cursor-pointer">
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm text-gray-600">{level.description}</div>
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Choose your target accent</h2>
              <p className="text-gray-600">Which accent would you like to master?</p>
            </div>
            <RadioGroup
              value={formData.targetAccent}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, targetAccent: value }))}
              className="space-y-4"
            >
              {accents.map((accent) => (
                <Card key={accent.id} className="cursor-pointer hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={accent.id} id={accent.id} />
                      <span className="text-2xl">{accent.flag}</span>
                      <Label htmlFor={accent.id} className="flex-1 cursor-pointer">
                        <div className="font-medium">{accent.label}</div>
                        <div className="text-sm text-gray-600">{accent.description}</div>
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">What interests you?</h2>
              <p className="text-gray-600">We'll customize practice content based on your interests</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {interests.map((interest) => (
                <Card
                  key={interest.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    formData.interests.includes(interest.id) ? "ring-2 ring-blue-500 bg-blue-50" : ""
                  }`}
                  onClick={() => handleInterestToggle(interest.id)}
                >
                  <CardContent className="p-4 flex items-center space-x-3">
                    <span className="text-2xl">{interest.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{interest.label}</div>
                    </div>
                    <Checkbox checked={formData.interests.includes(interest.id)} onChange={() => {}} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Accent Mastery
            </span>
          </Link>
          <Badge variant="outline">
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-8">{renderStep()}</CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || saving}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {saving ? "Saving..." : currentStep === totalSteps ? "Complete Setup" : "Next"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

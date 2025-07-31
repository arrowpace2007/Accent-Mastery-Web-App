"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  User,
  Globe,
  Target,
  Heart,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/auth"
import { sendWelcomeEmail } from "@/lib/email-service"

interface SignupData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  goals: string[]
  currentLevel: string
  targetAccent: string
  interests: string[]
}

export default function MultiStepSignup() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState<SignupData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    goals: [],
    currentLevel: "",
    targetAccent: "",
    interests: [],
  })

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const goals = [
    {
      id: "professional",
      label: "Professional Development",
      icon: "💼",
      description: "Improve accent for career growth",
    },
    { id: "travel", label: "Travel & Communication", icon: "✈️", description: "Better communication while traveling" },
    { id: "academic", label: "Academic Success", icon: "🎓", description: "Excel in academic presentations" },
    { id: "personal", label: "Personal Growth", icon: "🌟", description: "Build confidence in speaking" },
    {
      id: "entertainment",
      label: "Media & Entertainment",
      icon: "🎬",
      description: "Understand movies and shows better",
    },
    { id: "social", label: "Social Confidence", icon: "👥", description: "Feel confident in social situations" },
  ]

  const levels = [
    {
      id: "beginner",
      label: "Beginner",
      description: "Just starting my accent journey",
      color: "from-green-400 to-green-500",
    },
    {
      id: "intermediate",
      label: "Intermediate",
      description: "Some experience with accent training",
      color: "from-yellow-400 to-yellow-500",
    },
    {
      id: "advanced",
      label: "Advanced",
      description: "Looking to perfect specific sounds",
      color: "from-orange-400 to-orange-500",
    },
    {
      id: "native-like",
      label: "Near-Native",
      description: "Fine-tuning for native-like fluency",
      color: "from-red-400 to-red-500",
    },
  ]

  const accents = [
    {
      id: "american",
      label: "American English",
      flag: "🇺🇸",
      description: "General American accent",
      color: "from-red-400 to-blue-400",
    },
    {
      id: "british",
      label: "British English",
      flag: "🇬🇧",
      description: "Received Pronunciation (RP)",
      color: "from-blue-400 to-red-400",
    },
    {
      id: "australian",
      label: "Australian English",
      flag: "🇦🇺",
      description: "General Australian accent",
      color: "from-green-400 to-yellow-400",
    },
    {
      id: "canadian",
      label: "Canadian English",
      flag: "🇨🇦",
      description: "Standard Canadian accent",
      color: "from-red-400 to-white",
    },
    {
      id: "irish",
      label: "Irish English",
      flag: "🇮🇪",
      description: "Dublin Irish accent",
      color: "from-green-400 to-orange-400",
    },
    {
      id: "scottish",
      label: "Scottish English",
      flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
      description: "Edinburgh Scottish accent",
      color: "from-blue-400 to-white",
    },
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

  const handleInputChange = (field: keyof SignupData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleArrayToggle = (field: "goals" | "interests", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value],
    }))
  }

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError("Please fill in all fields")
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match")
          return false
        }
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters")
          return false
        }
        break
      case 2:
        if (!formData.fullName.trim()) {
          setError("Please enter your full name")
          return false
        }
        break
      case 3:
        if (formData.goals.length === 0) {
          setError("Please select at least one goal")
          return false
        }
        break
      case 4:
        if (!formData.currentLevel) {
          setError("Please select your current level")
          return false
        }
        if (!formData.targetAccent) {
          setError("Please select your target accent")
          return false
        }
        break
      case 5:
        if (formData.interests.length === 0) {
          setError("Please select at least one interest")
          return false
        }
        break
    }
    return true
  }

  const handleNext = async () => {
    if (!validateStep()) return

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    } else {
      await handleSignup()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      setError(null)
    }
  }

  const handleSignup = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase.from("users").insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          preferred_accents: [formData.targetAccent],
          goals: formData.goals,
          interests: formData.interests,
          current_level: formData.currentLevel,
          onboarding_completed: true,
        })

        if (profileError) throw profileError

        // Create initial progress tracking
        const { error: progressError } = await supabase.from("progress_tracking").insert({
          user_id: authData.user.id,
          accent_type: formData.targetAccent,
          difficulty_level: formData.currentLevel,
        })

        if (progressError) throw progressError

        // Send welcome email
        try {
          await sendWelcomeEmail(formData.email, formData.fullName)
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError)
          // Don't fail the signup if email fails
        }

        setSuccess("Account created successfully! Please check your email to verify your account.")

        // Redirect after a delay
        setTimeout(() => {
          router.push("/auth/login?message=Please check your email to verify your account")
        }, 3000)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during signup")
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    const stepVariants = {
      hidden: { opacity: 0, x: 50 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 },
    }

    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Mail className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
              <p className="text-gray-600">Start your accent mastery journey today</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <User className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Tell Us About Yourself</h2>
              <p className="text-gray-600">Help us personalize your experience</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Target className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">What Are Your Goals?</h2>
              <p className="text-gray-600">Select all that apply to customize your learning path</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      formData.goals.includes(goal.id) ? "ring-2 ring-blue-500 bg-blue-50 shadow-md" : "hover:shadow-md"
                    }`}
                    onClick={() => handleArrayToggle("goals", goal.id)}
                  >
                    <CardContent className="p-4 flex items-start space-x-3">
                      <span className="text-2xl">{goal.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{goal.label}</h3>
                          <Checkbox checked={formData.goals.includes(goal.id)} onChange={() => {}} />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="step4"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Globe className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Choose Your Path</h2>
              <p className="text-gray-600">Select your level and target accent</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-4 block">Current Level</Label>
                <RadioGroup
                  value={formData.currentLevel}
                  onValueChange={(value) => handleInputChange("currentLevel", value)}
                  className="space-y-3"
                >
                  {levels.map((level, index) => (
                    <motion.div
                      key={level.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="cursor-pointer hover:shadow-md transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={level.id} id={level.id} />
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${level.color}`} />
                            <Label htmlFor={level.id} className="flex-1 cursor-pointer">
                              <div className="font-medium">{level.label}</div>
                              <div className="text-sm text-gray-600">{level.description}</div>
                            </Label>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium mb-4 block">Target Accent</Label>
                <RadioGroup
                  value={formData.targetAccent}
                  onValueChange={(value) => handleInputChange("targetAccent", value)}
                  className="space-y-3"
                >
                  {accents.map((accent, index) => (
                    <motion.div
                      key={accent.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <Card className="cursor-pointer hover:shadow-md transition-all duration-300">
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
                    </motion.div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            key="step5"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Heart className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">What Interests You?</h2>
              <p className="text-gray-600">We'll customize practice content based on your interests</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {interests.map((interest, index) => (
                <motion.div
                  key={interest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      formData.interests.includes(interest.id)
                        ? "ring-2 ring-blue-500 bg-blue-50 shadow-md"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handleArrayToggle("interests", interest.id)}
                  >
                    <CardContent className="p-4 flex items-center space-x-3">
                      <span className="text-2xl">{interest.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{interest.label}</h3>
                          <Checkbox checked={formData.interests.includes(interest.id)} onChange={() => {}} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Accent Mastery
            </span>
          </Link>
          <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 px-4 py-2">
            <Sparkles className="h-4 w-4 mr-2" />
            Step {currentStep} of {totalSteps}
          </Badge>
        </motion.div>

        {/* Progress Bar */}
        <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} className="mb-8">
          <Progress value={progress} className="h-2" />
        </motion.div>

        {/* Main Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

              {/* Navigation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-between mt-8"
              >
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || loading}
                  className="bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {loading ? (
                    "Creating Account..."
                  ) : currentStep === totalSteps ? (
                    "Create Account"
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Sign In Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center mt-6"
              >
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

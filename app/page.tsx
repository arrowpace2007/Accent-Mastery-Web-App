"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Globe,
  Trophy,
  Users,
  Zap,
  ArrowRight,
  Play,
  Star,
  CheckCircle,
  Quote,
  Sparkles,
  Target,
  Brain,
  Headphones,
  BarChart3,
  Shield,
  TrendingUp,
  Mic,
  Volume2,
  ChevronDown,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"

// Floating Animation Component
const FloatingElement = ({
  children,
  delay = 0,
  duration = 3,
}: { children: React.ReactNode; delay?: number; duration?: number }) => (
  <motion.div
    animate={{
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration,
      repeat: Number.POSITIVE_INFINITY,
      delay,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
)

// Parallax Section Component
const ParallaxSection = ({ children, offset = 50 }: { children: React.ReactNode; offset?: number }) => {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, offset])

  return <motion.div style={{ y }}>{children}</motion.div>
}

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref)

  useEffect(() => {
    if (isInView) {
      let startTime: number
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
        setCount(Math.floor(progress * end))
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }
  }, [isInView, end, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

// Animated Text Component
const AnimatedText = ({ text, className = "" }: { text: string; className?: string }) => {
  const words = text.split(" ")

  return (
    <motion.div className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: index * 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  )
}

// Features Dropdown Component
const FeaturesDropdown = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const features = [
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI-Powered Analysis",
      description: "Advanced speech recognition technology",
    },
    {
      icon: <Headphones className="h-5 w-5" />,
      title: "Real-time Feedback",
      description: "Instant pronunciation corrections",
    },
    {
      icon: <Trophy className="h-5 w-5" />,
      title: "Gamified Learning",
      description: "Earn points and unlock achievements",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Community Challenges",
      description: "Practice with learners worldwide",
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 mt-2 w-80 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl overflow-hidden z-50"
        >
          <div className="p-6">
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  tabIndex={0}
                >
                  <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Currency Detection Hook
const useCurrency = () => {
  const [currency, setCurrency] = useState({ code: "USD", symbol: "$" })

  useEffect(() => {
    // Detect user's currency based on locale
    const detectCurrency = () => {
      try {
        const locale = navigator.language || "en-US"
        const currencyMap: { [key: string]: { code: string; symbol: string } } = {
          "en-US": { code: "USD", symbol: "$" },
          "en-GB": { code: "GBP", symbol: "£" },
          "en-AU": { code: "AUD", symbol: "A$" },
          "en-CA": { code: "CAD", symbol: "C$" },
          "de-DE": { code: "EUR", symbol: "€" },
          "fr-FR": { code: "EUR", symbol: "€" },
          "es-ES": { code: "EUR", symbol: "€" },
          "it-IT": { code: "EUR", symbol: "€" },
          "ja-JP": { code: "JPY", symbol: "¥" },
          "ko-KR": { code: "KRW", symbol: "₩" },
          "zh-CN": { code: "CNY", symbol: "¥" },
          "hi-IN": { code: "INR", symbol: "₹" },
          "pt-BR": { code: "BRL", symbol: "R$" },
        }

        const detected = currencyMap[locale] || currencyMap["en-US"]
        setCurrency(detected)
      } catch (error) {
        console.error("Currency detection failed:", error)
      }
    }

    detectCurrency()
  }, [])

  return currency
}

export default function LandingPage() {
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const currency = useCurrency()

  const features = [
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Multiple Accents",
      description: "Master American, British, Australian, Irish, and Scottish accents with native speaker guidance",
      color: "from-yellow-400 to-orange-500",
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Feedback",
      description: "Get instant pronunciation feedback with color-coded accuracy scoring",
      color: "from-orange-400 to-red-500",
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Gamified Learning",
      description: "Earn badges, maintain streaks, and compete in community challenges",
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Support",
      description: "Connect with learners worldwide and participate in accent challenges",
      color: "from-blue-400 to-purple-500",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Progress Analytics",
      description: "Track your improvement with detailed analytics and insights",
      color: "from-green-400 to-blue-500",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Personalized Learning",
      description: "Adaptive learning paths tailored to your specific needs and goals",
      color: "from-pink-400 to-purple-500",
    },
  ]

  const reviews = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      avatar: "SC",
      rating: 5,
      text: "Accent Mastery transformed my pronunciation in just 3 weeks. The AI feedback is incredibly accurate!",
      accent: "American",
    },
    {
      name: "James Wilson",
      role: "Business Analyst",
      avatar: "JW",
      rating: 5,
      text: "Finally found an app that actually helps with British pronunciation. The community challenges are addictive!",
      accent: "British",
    },
    {
      name: "Maria Rodriguez",
      role: "Teacher",
      avatar: "MR",
      rating: 5,
      text: "My students love using this app. The gamification keeps them engaged and motivated to practice daily.",
      accent: "Australian",
    },
    {
      name: "David Kim",
      role: "Marketing Manager",
      avatar: "DK",
      rating: 5,
      text: "The phonetic analysis feature is a game-changer. I can see exactly which sounds I need to work on.",
      accent: "Irish",
    },
    {
      name: "Emma Thompson",
      role: "International Student",
      avatar: "ET",
      rating: 5,
      text: "This app helped me gain confidence in presentations. The progress tracking is so motivating!",
      accent: "Scottish",
    },
    {
      name: "Alex Rodriguez",
      role: "Voice Actor",
      avatar: "AR",
      rating: 5,
      text: "Professional-grade accent training at my fingertips. The detailed feedback is unmatched.",
      accent: "American",
    },
  ]

  // Convert prices based on currency
  const convertPrice = (usdPrice: number) => {
    const rates: { [key: string]: number } = {
      USD: 1,
      GBP: 0.79,
      EUR: 0.92,
      AUD: 1.52,
      CAD: 1.36,
      JPY: 149,
      KRW: 1320,
      CNY: 7.24,
      INR: 83.12,
      BRL: 4.95,
    }

    const rate = rates[currency.code] || 1
    const convertedPrice = usdPrice * rate

    // Format based on currency
    if (currency.code === "JPY" || currency.code === "KRW") {
      return `${currency.symbol}${Math.round(convertedPrice)}`
    }
    return `${currency.symbol}${convertedPrice.toFixed(2)}`
  }

  const pricingTiers = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for getting started",
      features: ["1 accent choice", "Basic practice sessions", "Progress tracking", "Mobile app access"],
      popular: false,
    },
    {
      name: "Premium",
      price: convertPrice(4.99),
      originalPrice: "$4.99",
      description: "Most popular for serious learners",
      features: [
        "All accent options",
        "Advanced AI feedback",
        "Community challenges",
        "Detailed analytics",
        "Offline practice mode",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Pro",
      price: convertPrice(12.99),
      originalPrice: "$12.99",
      description: "For accent mastery professionals",
      features: [
        "Everything in Premium",
        "1-on-1 coaching sessions",
        "Custom practice plans",
        "Advanced speech analysis",
        "API access",
        "White-label options",
      ],
      popular: false,
    },
  ]

  const accents = [
    { flag: "🇺🇸", name: "American", color: "from-red-400 to-blue-400" },
    { flag: "🇬🇧", name: "British", color: "from-blue-400 to-red-400" },
    { flag: "🇦🇺", name: "Australian", color: "from-green-400 to-yellow-400" },
    { flag: "🇮🇪", name: "Irish", color: "from-green-400 to-orange-400" },
    { flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", name: "Scottish", color: "from-blue-400 to-white" },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Consistent Site-wide Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200" />
        <div className="absolute inset-0 backdrop-blur-[16px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10" />
      </div>

      {/* Floating Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.5,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Floating Header */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="fixed top-4 left-4 right-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl z-50"
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Globe className="h-6 w-6 text-white" />
                </motion.div>
                <span className="text-xl font-bold text-gray-800">Accent Mastery</span>
              </motion.div>

              <nav className="hidden md:flex items-center space-x-6">
                {[
                  { name: "Features", hasDropdown: true },
                  { name: "Pricing", hasDropdown: false },
                  { name: "Community", hasDropdown: false },
                  { name: "About", hasDropdown: false },
                ].map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="relative"
                  >
                    {item.hasDropdown ? (
                      <div className="relative">
                        <button
                          onClick={() => setFeaturesOpen(!featuresOpen)}
                          className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium relative group focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg px-2 py-1"
                          aria-expanded={featuresOpen}
                          aria-haspopup="true"
                        >
                          <span>{item.name}</span>
                          <motion.div animate={{ rotate: featuresOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="h-4 w-4" />
                          </motion.div>
                        </button>
                        <FeaturesDropdown isOpen={featuresOpen} onClose={() => setFeaturesOpen(false)} />
                      </div>
                    ) : (
                      <Link
                        href={`#${item.name.toLowerCase()}`}
                        className="text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg px-2 py-1"
                      >
                        {item.name}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>

              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-white/50 backdrop-blur-sm bg-white/20 focus:ring-2 focus:ring-yellow-400"
                    asChild
                  >
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-yellow-400"
                    asChild
                  >
                    <Link href="/auth/signup">Sign Up</Link>
                  </Button>
                </motion.div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden text-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg"
                  aria-label="Toggle mobile menu"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden mt-4 pb-4 border-t border-white/20"
                >
                  <div className="flex flex-col space-y-4 pt-4">
                    {["Features", "Pricing", "Community", "About"].map((item) => (
                      <Link
                        key={item}
                        href={`#${item.toLowerCase()}`}
                        className="text-gray-700 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg px-2 py-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 pt-24">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-8">
              {/* Hero Content */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <Badge className="mb-6 bg-white/30 text-gray-800 border-white/40 backdrop-blur-sm px-6 py-3 text-base font-medium">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Master Any Accent in 30 Days
                </Badge>

                <AnimatedText
                  text="Master English Accents with AI — Speak with Confidence Everywhere"
                  className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 max-w-5xl mx-auto"
                />

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium"
                >
                  Interactive, accent-specific practice powered by cutting-edge AI. Improve your American, British,
                  Australian, Irish, or Scottish accent, get instant feedback, and track your real progress.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-10 py-4 text-lg font-semibold focus:ring-2 focus:ring-yellow-400"
                      asChild
                    >
                      <Link href="/auth/signup">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-gray-400 bg-white/30 backdrop-blur-sm hover:bg-white/50 text-gray-800 transition-all duration-300 px-10 py-4 text-lg font-semibold focus:ring-2 focus:ring-yellow-400"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      See How It Works
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Mini Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto"
                >
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900">
                      <AnimatedCounter end={2} />
                      K+
                    </div>
                    <div className="text-sm md:text-base text-gray-600 font-medium">Active Learners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900">
                      <AnimatedCounter end={95} />%
                    </div>
                    <div className="text-sm md:text-base text-gray-600 font-medium">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-gray-900">4.8★</div>
                    <div className="text-sm md:text-base text-gray-600 font-medium">User Rating</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Hero Illustration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="relative pt-16"
              >
                <ParallaxSection offset={30}>
                  <div className="relative max-w-4xl mx-auto">
                    {/* Web App Mockup */}
                    <motion.div
                      whileHover={{ scale: 1.02, rotateY: 5 }}
                      transition={{ duration: 0.3 }}
                      className="w-full bg-white/40 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50"
                    >
                      {/* Browser Header */}
                      <div className="flex items-center space-x-2 mb-6 p-4 bg-white/50 rounded-2xl">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 bg-white/60 rounded-lg px-4 py-2 text-sm text-gray-600 font-medium">
                          accentmastery.ai/practice
                        </div>
                      </div>

                      {/* App Content */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/60">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                              <Mic className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-gray-900 font-bold text-lg">Practice Session</h3>
                              <p className="text-gray-600">American Accent</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-700 border-green-400/30 font-semibold">
                            Live
                          </Badge>
                        </div>

                        {/* Waveform Visualization */}
                        <div className="mb-8">
                          <div className="flex items-center justify-center space-x-1 h-24 bg-white/50 rounded-xl p-4 border border-white/60">
                            {[...Array(40)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-1 bg-gradient-to-t from-yellow-400 to-orange-500 rounded-full"
                                animate={{
                                  height: [10, Math.random() * 60 + 10, 10],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Number.POSITIVE_INFINITY,
                                  delay: i * 0.1,
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Practice Text */}
                        <div className="mb-8 p-6 bg-white/50 rounded-xl border border-white/60">
                          <p className="text-gray-900 text-xl leading-relaxed font-medium mb-4">
                            "The quick brown fox jumps over the lazy dog"
                          </p>
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <Volume2 className="h-5 w-5 text-yellow-600" />
                              <span className="text-gray-700 font-medium">Listen</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mic className="h-5 w-5 text-green-600" />
                              <span className="text-gray-700 font-medium">Record</span>
                            </div>
                          </div>
                        </div>

                        {/* Accuracy Score */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                          <div className="text-center p-4 bg-white/50 rounded-xl border border-green-400/30">
                            <div className="text-3xl font-bold text-green-600">94%</div>
                            <div className="text-gray-700 font-medium">Accuracy</div>
                          </div>
                          <div className="text-center p-4 bg-white/50 rounded-xl border border-blue-400/30">
                            <div className="text-3xl font-bold text-blue-600">87%</div>
                            <div className="text-gray-700 font-medium">Fluency</div>
                          </div>
                          <div className="text-center p-4 bg-white/50 rounded-xl border border-purple-400/30">
                            <div className="text-3xl font-bold text-purple-600">91%</div>
                            <div className="text-gray-700 font-medium">Rhythm</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                          <Button className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold">
                            Try Again
                          </Button>
                          <Button
                            variant="outline"
                            className="border-gray-400 text-gray-700 hover:bg-white/50 bg-white/30 font-semibold"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </motion.div>

                    {/* Floating Accent Flags */}
                    {accents.map((accent, index) => (
                      <FloatingElement key={accent.name} delay={index * 0.5} duration={3 + index * 0.5}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1 + index * 0.2 }}
                          className={`absolute w-16 h-16 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl shadow-lg cursor-pointer hover:scale-110 transition-transform border border-white/50`}
                          style={{
                            top: `${20 + (index % 3) * 30}%`,
                            left: index % 2 === 0 ? "-8%" : "108%",
                            right: index % 2 === 1 ? "-8%" : "auto",
                          }}
                          whileHover={{ scale: 1.2, rotate: 10 }}
                        >
                          {accent.flag}
                        </motion.div>
                      </FloatingElement>
                    ))}
                  </div>
                </ParallaxSection>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6">
          <div className="container mx-auto">
            <ParallaxSection offset={-30}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-20"
              >
                <Badge className="mb-6 bg-white/30 text-gray-800 border-white/40 backdrop-blur-sm px-4 py-2">
                  <Target className="h-4 w-4 mr-2" />
                  Why Choose Us
                </Badge>
                <AnimatedText
                  text="Master accents with cutting-edge AI"
                  className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
                />
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
                >
                  Our AI-powered platform combines advanced technology with proven language learning methods to deliver
                  personalized accent training that actually works.
                </motion.p>
              </motion.div>
            </ParallaxSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/40 backdrop-blur-xl border border-white/50 overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400">
                    <CardContent className="p-8 text-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className={`mx-auto mb-6 p-4 bg-gradient-to-r ${feature.color} rounded-2xl w-fit shadow-lg`}
                      >
                        <div className="text-white">{feature.icon}</div>
                      </motion.div>
                      <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6">
          <div className="container mx-auto">
            <ParallaxSection offset={20}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-20"
              >
                <Badge className="mb-6 bg-white/30 text-gray-800 border-white/40 backdrop-blur-sm px-4 py-2">
                  <Star className="h-4 w-4 mr-2" />
                  Pricing Plans
                </Badge>
                <AnimatedText
                  text="Choose Your Perfect Plan"
                  className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
                />
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-4"
                >
                  Start free and upgrade as you progress in your accent mastery journey with our AI-powered training.
                </motion.p>
                <p className="text-sm text-gray-600 italic">* Currency will auto-update based on your location</p>
              </motion.div>
            </ParallaxSection>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <Card
                    className={`relative h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400 ${
                      tier.popular
                        ? "bg-gradient-to-br from-yellow-100/60 to-orange-100/60 backdrop-blur-xl border-2 border-yellow-400/50 scale-105"
                        : "bg-white/40 backdrop-blur-xl border border-white/50"
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 shadow-lg font-semibold">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-8 text-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {tier.price}
                          {tier.price !== "Free" && <span className="text-lg font-normal text-gray-600">/month</span>}
                        </div>
                        <p className="text-gray-700 mb-6 font-medium">{tier.description}</p>
                        <ul className="space-y-3 mb-8 text-left">
                          {tier.features.map((feature, featureIndex) => (
                            <motion.li
                              key={featureIndex}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 + featureIndex * 0.1 }}
                              viewport={{ once: true }}
                              className="flex items-center text-gray-800"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                              <span className="text-sm font-medium">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                        <Button
                          className={`w-full ${
                            tier.popular
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                              : "bg-white/50 hover:bg-white/70 text-gray-800 border border-gray-300"
                          } transition-all duration-300 focus:ring-2 focus:ring-yellow-400 font-semibold`}
                          asChild
                        >
                          <Link href="/auth/signup">{tier.name === "Basic" ? "Start Free" : "Start Trial"}</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-32 px-6">
          <div className="container mx-auto">
            <ParallaxSection offset={20}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-20"
              >
                <Badge className="mb-6 bg-white/30 text-gray-800 border-white/40 backdrop-blur-sm px-4 py-2">
                  <Star className="h-4 w-4 mr-2" />
                  User Reviews
                </Badge>
                <AnimatedText
                  text="Loved by learners worldwide"
                  className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
                />
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
                >
                  Join thousands of satisfied users who have transformed their pronunciation and gained confidence in
                  speaking with our AI-powered platform.
                </motion.p>
              </motion.div>
            </ParallaxSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateY: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, rotateY: 5, scale: 1.02 }}
                  className="group perspective-1000"
                >
                  <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-white/40 backdrop-blur-xl border border-white/50 overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400">
                    <CardContent className="p-6 relative">
                      <div className="absolute top-4 right-4 text-gray-400 group-hover:text-gray-600 transition-colors">
                        <Quote className="h-8 w-8" />
                      </div>

                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {review.avatar}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.name}</h4>
                          <p className="text-sm text-gray-600">{review.role}</p>
                        </div>
                      </div>

                      <div className="flex mb-4">
                        {[...Array(review.rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          </motion.div>
                        ))}
                      </div>

                      <p className="text-gray-800 mb-4 leading-relaxed font-medium">"{review.text}"</p>

                      <Badge className="bg-white/50 text-gray-800 border-gray-300 font-medium">
                        {review.accent} Accent
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-32 px-6">
          <div className="container mx-auto">
            <ParallaxSection offset={-20}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-20"
              >
                <AnimatedText
                  text="Trusted by thousands worldwide"
                  className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
                />
              </motion.div>
            </ParallaxSection>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: 2000, suffix: "+", label: "Active Learners", icon: <Users className="h-8 w-8" /> },
                { number: 95, suffix: "%", label: "Success Rate", icon: <TrendingUp className="h-8 w-8" /> },
                { number: 120, suffix: "+", label: "Countries", icon: <Globe className="h-8 w-8" /> },
                { number: 4.8, suffix: "★", label: "User Rating", icon: <Star className="h-8 w-8" /> },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <Card className="border-0 shadow-xl bg-white/40 backdrop-blur-xl border border-white/50 p-8 hover:bg-white/60 transition-all duration-300 focus-within:ring-2 focus-within:ring-yellow-400">
                    <CardContent className="p-0">
                      <div className="text-yellow-600 mb-4 flex justify-center">{stat.icon}</div>
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        <AnimatedCounter end={stat.number} />
                        {stat.suffix}
                      </div>
                      <div className="text-gray-700 font-medium">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="container mx-auto">
            <ParallaxSection offset={-20}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-yellow-100/60 to-orange-100/60 backdrop-blur-xl border border-yellow-400/50 overflow-hidden focus-within:ring-2 focus-within:ring-yellow-400">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10" />
                  <CardContent className="p-16 text-center relative">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <AnimatedText
                        text="Ready to master your accent?"
                        className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
                      />
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="text-xl mb-10 text-gray-800 max-w-2xl mx-auto leading-relaxed font-medium"
                      >
                        Join thousands of learners who have transformed their pronunciation with our AI-powered
                        platform. Start your journey today!
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-10 py-4 text-lg font-semibold focus:ring-2 focus:ring-yellow-400"
                          asChild
                        >
                          <Link href="/auth/signup">
                            Start Your Journey Today
                            <Zap className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </ParallaxSection>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white/30 backdrop-blur-xl text-gray-800 py-16 px-6 border-t border-white/40">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">Accent Mastery</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Perfect your accent with our AI-powered coaching and community support. Transform your pronunciation
                  today.
                </p>
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    <strong>2,000+</strong> Active Learners • <strong>4.8★</strong> User Rating
                  </p>
                </div>
              </motion.div>

              {[
                {
                  title: "Product",
                  links: ["Features", "Pricing", "Mobile App", "API"],
                },
                {
                  title: "Support",
                  links: ["Help Center", "Contact Us", "Community", "Status"],
                },
                {
                  title: "Company",
                  links: ["About", "Blog", "Careers", "Press"],
                },
              ].map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="font-semibold mb-6 text-lg text-gray-900">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link}>
                        <Link
                          href="#"
                          className="text-gray-700 hover:text-gray-900 transition-colors duration-300 hover:translate-x-1 inline-block focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-1"
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="border-t border-white/40 mt-12 pt-8 text-center"
            >
              <p className="text-gray-600">
                &copy; 2024 Accent Mastery. All rights reserved. Made with ❤️ for language learners worldwide.
              </p>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  )
}

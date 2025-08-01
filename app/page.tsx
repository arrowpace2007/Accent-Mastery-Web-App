"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Globe,
  Mic,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  Play,
  Target,
  TrendingUp,
  Award,
  Zap,
  Crown,
  Menu,
  X,
  Volume2,
  Headphones,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"

// Floating animation component
function FloatingElement({ children, delay = 0, duration = 6 }: { children: React.ReactNode; delay?: number; duration?: number }) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
}

// Animated background elements
function BackgroundElements() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient blobs */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      {/* Floating icons */}
      {[...Array(12)].map((_, i) => {
        const icons = [Mic, Volume2, Headphones, MessageCircle, Globe, Star]
        const Icon = icons[i % icons.length]
        return (
          <motion.div
            key={i}
            className="absolute text-blue-300/30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              rotate: [0, 360],
            }}
            transition={{
              duration: 20 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Icon className="h-6 w-6" />
          </motion.div>
        )
      })}
    </div>
  )
}

// Enhanced header component
function EnhancedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg" 
          : "bg-white/60 backdrop-blur-lg"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Accent Mastery
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {["Features", "Pricing", "Community", "About"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <Link
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:scale-105 px-3 py-2 rounded-lg hover:bg-white/50"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button variant="ghost" asChild className="text-gray-700 hover:text-blue-600 hover:bg-white/50 rounded-xl">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                    <Link href="/auth/signup">Get Started</Link>
                  </Button>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-gray-700 hover:bg-white/50 rounded-xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 pb-4 border-t border-white/20"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 mt-4 shadow-xl">
                <nav className="flex flex-col space-y-4">
                  {["Features", "Pricing", "Community", "About"].map((item) => (
                    <Link
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="text-gray-700 hover:text-blue-600 font-medium py-2 px-4 rounded-xl hover:bg-blue-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    {user ? (
                      <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl">
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" asChild className="w-full rounded-xl">
                          <Link href="/auth/login">Sign In</Link>
                        </Button>
                        <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl">
                          <Link href="/auth/signup">Get Started</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}

// Enhanced pricing section
function EnhancedPricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  const pricingTiers = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for getting started",
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      features: [
        "5 practice sessions per month",
        "1 accent choice",
        "Basic feedback",
        "Progress tracking",
        "Community access",
      ],
      buttonText: "Get Started Free",
      icon: <Star className="h-6 w-6" />,
      color: "from-gray-400 to-gray-500",
    },
    {
      id: "standard",
      name: "Standard",
      description: "Most popular for serious learners",
      monthlyPrice: 499,
      yearlyPrice: 4990,
      popular: true,
      features: [
        "100 practice sessions per month",
        "3 accent choices",
        "Advanced AI feedback",
        "Detailed analytics",
        "Offline mode",
        "Email support",
      ],
      buttonText: "Start Standard Plan",
      icon: <Zap className="h-6 w-6" />,
      color: "from-blue-500 to-purple-500",
    },
    {
      id: "pro",
      name: "Pro",
      description: "For accent mastery professionals",
      monthlyPrice: 1199,
      yearlyPrice: 11990,
      popular: false,
      features: [
        "Unlimited practice sessions",
        "All accent options",
        "1-on-1 coaching sessions",
        "Custom practice plans",
        "Priority support",
        "API access",
      ],
      buttonText: "Go Pro",
      icon: <Crown className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
    },
  ]

  const formatPrice = (price: number) => {
    if (price === 0) return "Free"
    return `₹${price.toLocaleString()}`
  }

  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start free and upgrade as you progress in your accent mastery journey
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-medium ${!isYearly ? "text-gray-900" : "text-gray-500"}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={`text-sm font-medium ${isYearly ? "text-gray-900" : "text-gray-500"}`}>Yearly</span>
            <Badge className="bg-green-100 text-green-800 ml-2 rounded-full px-3 py-1">Save up to 17%</Badge>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => {
            const price = isYearly ? tier.yearlyPrice : tier.monthlyPrice
            const savings = tier.monthlyPrice > 0 ? Math.round(((tier.monthlyPrice * 12 - tier.yearlyPrice) / (tier.monthlyPrice * 12)) * 100) : 0

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative"
              >
                <Card
                  className={`relative h-full rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ${
                    tier.popular
                      ? "border-2 border-blue-500 bg-gradient-to-b from-blue-50/80 to-white/80 backdrop-blur-sm scale-105"
                      : "border border-gray-200 bg-white/80 backdrop-blur-sm hover:border-gray-300"
                  }`}
                >
                  {/* Most Popular Badge */}
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4 pt-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${tier.color} text-white shadow-lg`}>
                        {tier.icon}
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                    <CardDescription className="text-base text-gray-600 mt-2">{tier.description}</CardDescription>

                    <div className="mt-6">
                      <div className="text-4xl font-bold text-gray-900">
                        {formatPrice(price)}
                        {price > 0 && (
                          <span className="text-lg font-normal text-gray-600">/{isYearly ? "year" : "month"}</span>
                        )}
                      </div>
                      {isYearly && savings > 0 && (
                        <div className="text-sm text-green-600 font-medium mt-2">Save {savings}% annually</div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 pb-8">
                    <ul className="space-y-4 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <motion.li
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: featureIndex * 0.1 }}
                          className="flex items-start"
                        >
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className={`w-full rounded-2xl py-3 font-semibold transition-all duration-200 ${
                          tier.popular
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl"
                            : tier.id === "pro"
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl"
                              : "border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-600"
                        }`}
                        variant={tier.popular || tier.id === "pro" ? "default" : "outline"}
                        asChild
                      >
                        <Link href="/auth/signup">
                          {tier.buttonText}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Enhanced stats section
function EnhancedStatsSection() {
  const stats = [
    {
      number: "2,000+",
      label: "Active Learners",
      icon: <Users className="h-8 w-8" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: "120+",
      label: "Countries",
      icon: <Globe className="h-8 w-8" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      number: "4.8★",
      label: "User Rating",
      icon: (
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < 4 ? "text-yellow-400 fill-current" : i === 4 ? "text-yellow-400 fill-current opacity-80" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      ),
      color: "from-yellow-500 to-orange-500",
    },
    {
      number: "95%",
      label: "Success Rate",
      icon: <Target className="h-8 w-8" />,
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.05 }}
            >
              <Card className="text-center p-6 rounded-3xl bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-0">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${stat.color} text-white mb-4 shadow-lg`}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Enhanced CTA section
function EnhancedCTASection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-3xl shadow-2xl overflow-hidden">
            <CardContent className="p-12 md:p-16 text-center relative">
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-32 h-32 bg-white/10 rounded-full"
                    animate={{
                      x: [0, 100, 0],
                      y: [0, -50, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 8 + i * 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 1.5,
                    }}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="mb-8"
                >
                  <FloatingElement delay={0} duration={4}>
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
                      <Mic className="h-10 w-10 text-white" />
                    </div>
                  </FloatingElement>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  Ready to Master Your Accent?
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-xl mb-8 opacity-90 max-w-2xl mx-auto"
                >
                  Join thousands of learners who have transformed their pronunciation with our AI-powered platform
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100 rounded-2xl px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-200"
                    asChild
                  >
                    <Link href="/auth/signup">
                      Start Your Journey Today
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                </motion.div>

                {/* Floating mascot elements */}
                <div className="absolute top-4 right-4 opacity-20">
                  <FloatingElement delay={1} duration={5}>
                    <div className="text-6xl">🦅</div>
                  </FloatingElement>
                </div>
                <div className="absolute bottom-4 left-4 opacity-20">
                  <FloatingElement delay={2} duration={7}>
                    <div className="text-5xl">🐨</div>
                  </FloatingElement>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

// Scroll indicator
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.6 }}
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
    >
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex flex-col items-center text-white/80 cursor-pointer"
        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-sm mb-2">Scroll to Learn More</span>
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </motion.div>
  )
}

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Fixed animated background */}
      <BackgroundElements />
      
      {/* Enhanced Header */}
      <EnhancedHeader />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Floating mascot */}
            <div className="absolute -top-20 -right-20 opacity-30">
              <FloatingElement delay={0} duration={6}>
                <div className="text-8xl">🌍</div>
              </FloatingElement>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight"
            >
              Perfect Your Accent with AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Transform your pronunciation with personalized AI coaching, interactive practice sessions, and a supportive global community
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-200"
                  asChild
                >
                  <Link href="/auth/signup">
                    Start Free Today
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-blue-500 hover:bg-white/80 text-gray-700 hover:text-blue-600 rounded-2xl px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all duration-200"
                  asChild
                >
                  <Link href="#features">
                    <Play className="h-5 w-5 mr-2" />
                    Watch Demo
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Animated sound waves */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex justify-center items-center space-x-2 mb-8"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                  animate={{
                    height: [20, 40, 60, 40, 20],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>

        <ScrollIndicator />
      </section>

      {/* Enhanced Stats Section */}
      <EnhancedStatsSection />

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to master any accent with confidence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Mic className="h-8 w-8" />,
                title: "AI-Powered Analysis",
                description: "Get instant feedback on your pronunciation with advanced AI technology",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Target className="h-8 w-8" />,
                title: "Personalized Learning",
                description: "Customized practice sessions based on your goals and progress",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Global Community",
                description: "Connect with learners worldwide and participate in challenges",
                color: "from-purple-500 to-pink-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="h-full p-8 rounded-3xl bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-0 text-center">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-6 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <EnhancedPricingSection />

      {/* Enhanced CTA Section */}
      <EnhancedCTASection />

      {/* Footer */}
      <footer className="py-12 border-t border-white/20 bg-white/60 backdrop-blur-lg relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Accent Mastery
              </span>
            </div>
            <div className="flex items-center space-x-6 text-gray-600">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
            </div>
          </div>
          <div className="text-center mt-8 text-gray-500">
            <p>&copy; 2025 Accent Mastery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
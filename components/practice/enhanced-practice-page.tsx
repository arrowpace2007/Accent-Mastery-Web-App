"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { SentenceDisplay } from "@/components/practice/sentence-display"
import { RecordingInterface } from "@/components/practice/recording-interface"
import { FeedbackSection } from "@/components/practice/feedback-section"
import { ProgressSection } from "@/components/practice/progress-section"
import { PhoneticAnalysis } from "@/components/practice/phonetic-analysis"

export default function EnhancedPracticePage() {
  const [currentSentence, setCurrentSentence] = useState(0)
  const [targetAccent, setTargetAccent] = useState("american")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [hasRecording, setHasRecording] = useState(false)
  const [isPlayingRecording, setIsPlayingRecording] = useState(false)
  const [isPlayingNative, setIsPlayingNative] = useState(false)
  const [isPlayingUser, setIsPlayingUser] = useState(false)
  const [feedback, setFeedback] = useState<any>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showPhoneticAnalysis, setShowPhoneticAnalysis] = useState(false)

  const { user } = useAuth()
  const router = useRouter()
  const recordingInterval = useRef<NodeJS.Timeout>()
  const audioLevelInterval = useRef<NodeJS.Timeout>()

  const practiceContent = {
    title: "Advanced Phonetic Analysis - Vowel Sounds",
    difficulty: "Advanced",
    estimatedTime: "20 minutes",
    sentences: [
      {
        text: "The meeting will start at three thirty.",
        phonetic: "/ðə ˈmiːtɪŋ wɪl stɑːrt æt θriː ˈθɜːrti/",
        narrowPhonetic: "/ðə ˈmiːtɪŋ wɪɫ stɑːɹt æt θɹiː ˈθɜːɹti/",
        targetSounds: ["/iː/", "/ɑː/", "/θ/"],
        tips: "Focus on the long 'ee' sound in 'meeting' and the 'ar' sound in 'start'. The 'th' in 'three' should be voiceless.",
        phonemeData: [
          {
            symbol: "/ð/",
            plainEnglish: "th (voiced)",
            type: "consonant" as const,
            accuracy: 85,
            targetPronunciation: "voiced th",
            articulationTips: [
              "Place tongue tip between teeth",
              "Voice should vibrate - feel the buzz",
              "Air flows around tongue sides",
              "Keep tongue relaxed, not tense",
            ],
            similarWords: ["the", "this", "that", "they", "there", "then"],
            mouthPosition: {
              description: "Tongue tip lightly touches the back of upper teeth. Vocal cords vibrate.",
            },
            exercises: [
              {
                title: "Voiced TH Practice",
                description: "Practice distinguishing voiced and voiceless TH sounds",
                difficulty: "intermediate" as const,
              },
              {
                title: "Minimal Pairs",
                description: "Practice 'the' vs 'thee' distinctions",
                difficulty: "beginner" as const,
              },
            ],
          },
          {
            symbol: "/iː/",
            plainEnglish: "ee (long)",
            type: "vowel" as const,
            accuracy: 92,
            targetPronunciation: "long ee",
            tonguePosition: { x: 20, y: 85 },
            articulationTips: [
              "Tongue high and front in mouth",
              "Lips slightly spread, not rounded",
              "Maintain length - don't cut it short",
              "Keep jaw relatively closed",
            ],
            similarWords: ["see", "tree", "free", "key", "bee", "knee"],
            mouthPosition: {
              description: "High front tongue position. Lips slightly spread. Jaw nearly closed.",
            },
            exercises: [
              {
                title: "Long Vowel Duration",
                description: "Practice maintaining vowel length consistently",
                difficulty: "beginner" as const,
              },
              {
                title: "Vowel Clarity",
                description: "Focus on clear /iː/ vs /ɪ/ distinction",
                difficulty: "intermediate" as const,
              },
            ],
          },
          {
            symbol: "/ɑː/",
            plainEnglish: "ah (long)",
            type: "vowel" as const,
            accuracy: 68,
            targetPronunciation: "long ah",
            tonguePosition: { x: 80, y: 15 },
            articulationTips: [
              "Tongue low and back in mouth",
              "Mouth wide open - like at doctor",
              "Maintain length and quality throughout",
              "Don't let tongue move during sound",
            ],
            similarWords: ["car", "far", "star", "hard", "park", "start"],
            mouthPosition: {
              description: "Low back tongue position. Mouth wide open. Jaw dropped significantly.",
            },
            exercises: [
              {
                title: "Back Vowel Practice",
                description: "Focus on tongue position for back vowels",
                difficulty: "intermediate" as const,
              },
              {
                title: "Length Control",
                description: "Practice maintaining consistent vowel length",
                difficulty: "advanced" as const,
              },
            ],
          },
          {
            symbol: "/θ/",
            plainEnglish: "th (voiceless)",
            type: "consonant" as const,
            accuracy: 75,
            targetPronunciation: "voiceless th",
            articulationTips: [
              "Place tongue tip between teeth",
              "No voice vibration - just air",
              "Strong air flow through gap",
              "Don't substitute with 'f' or 's'",
            ],
            similarWords: ["think", "three", "thirty", "thank", "thick", "thin"],
            mouthPosition: {
              description: "Tongue tip between teeth. No vocal cord vibration. Strong airflow.",
            },
            exercises: [
              {
                title: "Voiceless TH Drills",
                description: "Practice clear voiceless TH sounds",
                difficulty: "intermediate" as const,
              },
              {
                title: "TH vs F Distinction",
                description: "Avoid common substitution errors",
                difficulty: "beginner" as const,
              },
            ],
          },
          {
            symbol: "/w/",
            plainEnglish: "w",
            type: "consonant" as const,
            accuracy: 88,
            targetPronunciation: "w sound",
            articulationTips: [
              "Round lips tightly",
              "Quick glide to next vowel",
              "Voice starts immediately",
              "Don't make it too long",
            ],
            similarWords: ["will", "we", "way", "want", "water", "work"],
            mouthPosition: {
              description: "Lips rounded and protruded. Quick transition to following vowel.",
            },
            exercises: [
              {
                title: "W Glide Practice",
                description: "Practice smooth transitions from /w/ to vowels",
                difficulty: "beginner" as const,
              },
            ],
          },
          {
            symbol: "/ɪ/",
            plainEnglish: "i (short)",
            type: "vowel" as const,
            accuracy: 82,
            targetPronunciation: "short i",
            tonguePosition: { x: 30, y: 70 },
            articulationTips: [
              "Tongue high but not as high as /iː/",
              "More relaxed than long /iː/",
              "Shorter duration",
              "Slightly more central",
            ],
            similarWords: ["will", "sit", "bit", "hit", "fit", "it"],
            mouthPosition: {
              description: "High front tongue, but lower than /iː/. Relaxed lip position.",
            },
            exercises: [
              {
                title: "Short vs Long Vowels",
                description: "Practice /ɪ/ vs /iː/ distinction",
                difficulty: "intermediate" as const,
              },
            ],
          },
        ],
      },
    ],
  }

  const currentSentenceData = practiceContent.sentences[currentSentence]

  // Enhanced mock waveform data with more realistic patterns
  const mockUserWaveform = Array.from({ length: 150 }, (_, i) => {
    const base = Math.sin(i * 0.08) * 0.6
    const noise = (Math.random() - 0.5) * 0.3
    const envelope = Math.exp(-Math.abs(i - 75) / 50) // Envelope shape
    return (base + noise) * envelope
  })

  const mockTargetWaveform = Array.from({ length: 150 }, (_, i) => {
    const base = Math.sin(i * 0.1) * 0.7
    const harmonics = Math.sin(i * 0.3) * 0.2 + Math.sin(i * 0.5) * 0.1
    const envelope = Math.exp(-Math.abs(i - 75) / 60)
    return (base + harmonics) * envelope
  })

  // Mock progress data
  const progressData = {
    currentSession: currentSentence + 1,
    totalSessions: practiceContent.sentences.length,
    dailyGoal: 5,
    dailyProgress: 2,
    currentAccuracy: feedback?.overallScore || 0,
    averageAccuracy: 78,
    streak: 7,
    practiceTime: 45,
    achievements: [
      {
        id: "first_session",
        title: "First Steps",
        description: "Complete your first practice session",
        icon: "👶",
        earned: true,
      },
      {
        id: "phonetic_analysis",
        title: "Phonetic Explorer",
        description: "Use advanced phonetic analysis",
        icon: "🔬",
        earned: showPhoneticAnalysis,
      },
      {
        id: "accuracy_expert",
        title: "Accuracy Expert",
        description: "Achieve 90% accuracy on a phoneme",
        icon: "🎯",
        earned: currentSentenceData.phonemeData.some((p) => p.accuracy >= 90),
      },
    ],
  }

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            handleStopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)

      audioLevelInterval.current = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 10))
      }, 100)
    } else {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
      }
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current)
      }
      setAudioLevel(0)
    }

    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
      }
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current)
      }
    }
  }, [isRecording])

  const handleStartRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    setFeedback(null)
    setShowFeedback(false)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setHasRecording(true)

    setTimeout(() => {
      const mockFeedback = {
        overallScore: Math.floor(Math.random() * 30) + 70,
        wordFeedback: [
          {
            word: "The",
            score: 95,
            status: "excellent" as const,
            phonemes: [{ sound: "/ðə/", accuracy: 95, tip: "Perfect pronunciation!" }],
          },
          {
            word: "meeting",
            score: 80,
            status: "good" as const,
            phonemes: [
              { sound: "/miː/", accuracy: 85, tip: "Good long 'ee' sound" },
              { sound: "/tɪŋ/", accuracy: 75, tip: "Try to make the 'ng' sound clearer" },
            ],
          },
          {
            word: "start",
            score: 65,
            status: "needs-work" as const,
            phonemes: [{ sound: "/stɑːrt/", accuracy: 65, tip: "Make the 'ar' sound more rounded and longer" }],
          },
        ],
        suggestions: [
          "Work on the 'ar' sound in 'start' - try to make it more rounded and longer",
          "The 'th' sound in 'three' needs more tongue placement against teeth",
        ],
        exerciseRecommendations: [
          {
            title: "Vowel Sound Practice",
            description: "Focus on /ɑː/ sounds with minimal pairs",
            difficulty: "Intermediate",
          },
        ],
      }

      setFeedback(mockFeedback)
      setShowFeedback(true)
    }, 2000)
  }

  const handlePlayRecording = () => {
    setIsPlayingRecording(true)
    setTimeout(() => setIsPlayingRecording(false), 3000)
  }

  const handleStopPlayback = () => {
    setIsPlayingRecording(false)
  }

  const handleReRecord = () => {
    setHasRecording(false)
    setFeedback(null)
    setShowFeedback(false)
    setRecordingTime(0)
  }

  const handleContinue = () => {
    if (currentSentence < practiceContent.sentences.length - 1) {
      setCurrentSentence((prev) => prev + 1)
      setHasRecording(false)
      setFeedback(null)
      setShowFeedback(false)
      setRecordingTime(0)
    } else {
      router.push("/dashboard")
    }
  }

  const handlePlayNative = () => {
    setIsPlayingNative(true)
    setTimeout(() => setIsPlayingNative(false), 3000)
  }

  const handlePlayUser = () => {
    setIsPlayingUser(true)
    setTimeout(() => setIsPlayingUser(false), 3000)
  }

  const handlePlayPhoneme = (phoneme: string) => {
    console.log("Playing phoneme:", phoneme)
    // Implement phoneme-specific audio playback
  }

  const handlePlayUserSegment = (startTime: number, endTime: number) => {
    console.log("Playing user segment:", startTime, "to", endTime)
    // Implement segment playback
  }

  const handlePlayTargetSegment = (startTime: number, endTime: number) => {
    console.log("Playing target segment:", startTime, "to", endTime)
    // Implement segment playback
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="hidden sm:inline-flex">
                {practiceContent.difficulty}
              </Badge>
              <Badge variant="outline">
                {currentSentence + 1} of {practiceContent.sentences.length}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPhoneticAnalysis(!showPhoneticAnalysis)}
                className="bg-transparent"
              >
                {showPhoneticAnalysis ? "Hide" : "Show"} Analysis
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentSentence(0)
                setHasRecording(false)
                setFeedback(null)
                setShowFeedback(false)
                setRecordingTime(0)
              }}
              className="bg-transparent"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Restart</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{practiceContent.title}</h1>
            <p className="text-gray-600">Advanced pronunciation practice with detailed phonetic analysis</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <SentenceDisplay
                sentence={currentSentenceData.text}
                phonetic={currentSentenceData.phonetic}
                targetAccent={targetAccent}
                onAccentChange={setTargetAccent}
                onPlayAudio={handlePlayNative}
                isPlaying={isPlayingNative}
                targetSounds={currentSentenceData.targetSounds}
                tips={currentSentenceData.tips}
              />

              <RecordingInterface
                isRecording={isRecording}
                recordingTime={recordingTime}
                audioLevel={audioLevel}
                hasRecording={hasRecording}
                isPlayingRecording={isPlayingRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onPlayRecording={handlePlayRecording}
                onStopPlayback={handleStopPlayback}
                onReRecord={handleReRecord}
                onContinue={handleContinue}
              />

              {showFeedback && feedback && (
                <FeedbackSection
                  overallScore={feedback.overallScore}
                  wordFeedback={feedback.wordFeedback}
                  suggestions={feedback.suggestions}
                  onPlayNative={handlePlayNative}
                  onPlayUser={handlePlayUser}
                  isPlayingNative={isPlayingNative}
                  isPlayingUser={isPlayingUser}
                  exerciseRecommendations={feedback.exerciseRecommendations}
                />
              )}

              {showPhoneticAnalysis && hasRecording && (
                <PhoneticAnalysis
                  sentence={currentSentenceData.text}
                  broadTranscription={currentSentenceData.phonetic}
                  narrowTranscription={currentSentenceData.narrowPhonetic}
                  phonemeData={currentSentenceData.phonemeData}
                  userWaveform={mockUserWaveform}
                  targetWaveform={mockTargetWaveform}
                  onPlayPhoneme={handlePlayPhoneme}
                  onPlayUserSegment={handlePlayUserSegment}
                  onPlayTargetSegment={handlePlayTargetSegment}
                />
              )}

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentSentence > 0) {
                      setCurrentSentence((prev) => prev - 1)
                      setHasRecording(false)
                      setFeedback(null)
                      setShowFeedback(false)
                      setRecordingTime(0)
                    }
                  }}
                  disabled={currentSentence === 0}
                  className="bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={() => {
                    if (currentSentence < practiceContent.sentences.length - 1) {
                      setCurrentSentence((prev) => prev + 1)
                      setHasRecording(false)
                      setFeedback(null)
                      setShowFeedback(false)
                      setRecordingTime(0)
                    } else {
                      router.push("/dashboard")
                    }
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {currentSentence === practiceContent.sentences.length - 1 ? "Complete" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <ProgressSection {...progressData} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

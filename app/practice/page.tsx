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

export default function PracticePage() {
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

  const { user } = useAuth()
  const router = useRouter()
  const recordingInterval = useRef<NodeJS.Timeout>()
  const audioLevelInterval = useRef<NodeJS.Timeout>()

  const practiceContent = {
    title: "Business Communication - Vowel Sounds",
    difficulty: "Intermediate",
    estimatedTime: "15 minutes",
    sentences: [
      {
        text: "The meeting will start at three thirty.",
        phonetic: "/ðə ˈmiːtɪŋ wɪl stɑːrt æt θriː ˈθɜːrti/",
        targetSounds: ["/iː/", "/ɑː/", "/θ/"],
        tips: "Focus on the long 'ee' sound in 'meeting' and the 'ar' sound in 'start'. The 'th' in 'three' should be voiceless.",
      },
      {
        text: "Please review the quarterly report carefully.",
        phonetic: "/pliːz rɪˈvjuː ðə ˈkwɔːrtərli rɪˈpɔːrt ˈkɛrfəli/",
        targetSounds: ["/iː/", "/uː/", "/ɔː/"],
        tips: "Pay attention to the 'oo' sound in 'review' and the 'or' sound in 'quarterly'. Make sure 'carefully' ends with a clear 'lee' sound.",
      },
      {
        text: "Our team achieved excellent results this quarter.",
        phonetic: "/aʊər tiːm əˈtʃiːvd ˈɛksələnt rɪˈzʌlts ðɪs ˈkwɔːrtər/",
        targetSounds: ["/aʊ/", "/iː/", "/ʌ/"],
        tips: "Focus on the 'ow' sound in 'our' and the short 'u' sound in 'results'. 'Achieved' should have a clear 'ee' sound.",
      },
    ],
  }

  const currentSentenceData = practiceContent.sentences[currentSentence]

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
        id: "session_complete",
        title: "Session Master",
        description: "Complete a practice session",
        icon: "🎯",
        earned: hasRecording && feedback,
      },
      {
        id: "accuracy_high",
        title: "Accuracy Expert",
        description: "Achieve 90% accuracy",
        icon: "🎯",
        earned: false,
        progress: feedback?.overallScore || 0,
        target: 90,
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

      // Simulate audio level
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

    // Simulate processing and generate feedback
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
            word: "will",
            score: 90,
            status: "excellent" as const,
            phonemes: [{ sound: "/wɪl/", accuracy: 90, tip: "Excellent!" }],
          },
          {
            word: "start",
            score: 65,
            status: "needs-work" as const,
            phonemes: [{ sound: "/stɑːrt/", accuracy: 65, tip: "Make the 'ar' sound more rounded and longer" }],
          },
          {
            word: "at",
            score: 95,
            status: "excellent" as const,
            phonemes: [{ sound: "/æt/", accuracy: 95, tip: "Perfect!" }],
          },
          {
            word: "three",
            score: 70,
            status: "needs-work" as const,
            phonemes: [{ sound: "/θriː/", accuracy: 70, tip: "Place tongue between teeth for 'th' sound" }],
          },
          {
            word: "thirty",
            score: 85,
            status: "good" as const,
            phonemes: [{ sound: "/θɜːrti/", accuracy: 85, tip: "Good, but work on the 'th' sound" }],
          },
        ],
        suggestions: [
          "Work on the 'ar' sound in 'start' - try to make it more rounded and longer",
          "The 'th' sound in 'three' needs more tongue placement against teeth",
          "Practice the 'ng' sound in 'meeting' - it should resonate in your nose",
        ],
        exerciseRecommendations: [
          {
            title: "Vowel Sound Practice",
            description: "Focus on /ɑː/ sounds with minimal pairs",
            difficulty: "Intermediate",
          },
          {
            title: "Consonant Clusters",
            description: "Practice 'st' and 'th' sound combinations",
            difficulty: "Beginner",
          },
          {
            title: "Word Stress Patterns",
            description: "Practice stress in multi-syllable words",
            difficulty: "Advanced",
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
      // Session complete
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

  const nextSentence = () => {
    if (currentSentence < practiceContent.sentences.length - 1) {
      setCurrentSentence((prev) => prev + 1)
      setHasRecording(false)
      setFeedback(null)
      setShowFeedback(false)
      setRecordingTime(0)
    }
  }

  const previousSentence = () => {
    if (currentSentence > 0) {
      setCurrentSentence((prev) => prev - 1)
      setHasRecording(false)
      setFeedback(null)
      setShowFeedback(false)
      setRecordingTime(0)
    }
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
          {/* Practice Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{practiceContent.title}</h1>
            <p className="text-gray-600">Practice pronunciation with real-time AI feedback</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Practice Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Sentence Display */}
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

              {/* Recording Interface */}
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

              {/* Feedback Section */}
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

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={previousSentence}
                  disabled={currentSentence === 0}
                  className="bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={nextSentence}
                  disabled={currentSentence === practiceContent.sentences.length - 1}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {currentSentence === practiceContent.sentences.length - 1 ? "Complete" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Progress Sidebar */}
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

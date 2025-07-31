"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Volume2, Eye, EyeOff, Play, BookOpen, Target, Lightbulb, ArrowRight, Info, Pause } from "lucide-react"

interface PhonemeData {
  symbol: string
  plainEnglish: string
  type: "vowel" | "consonant" | "diphthong" | "consonant-cluster"
  accuracy: number
  userPronunciation?: string
  targetPronunciation: string
  tonguePosition?: {
    x: number // 0-100 (front to back)
    y: number // 0-100 (high to low)
  }
  articulationTips: string[]
  similarWords: string[]
  exercises: Array<{
    title: string
    description: string
    difficulty: "beginner" | "intermediate" | "advanced"
  }>
  mouthPosition?: {
    description: string
    imageUrl?: string
  }
}

interface PhoneticAnalysisProps {
  sentence: string
  broadTranscription: string
  narrowTranscription: string
  phonemeData: PhonemeData[]
  userWaveform?: number[]
  targetWaveform?: number[]
  onPlayPhoneme: (phoneme: string) => void
  onPlayUserSegment: (startTime: number, endTime: number) => void
  onPlayTargetSegment: (startTime: number, endTime: number) => void
}

const phonemeColors = {
  vowel: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  consonant: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
  diphthong: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
  "consonant-cluster": "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
}

const accuracyColors = {
  excellent: "bg-green-500",
  good: "bg-yellow-500",
  needsWork: "bg-red-500",
}

const accuracyTextColors = {
  excellent: "text-green-700 bg-green-50 border-green-200",
  good: "text-yellow-700 bg-yellow-50 border-yellow-200",
  needsWork: "text-red-700 bg-red-50 border-red-200",
}

function getAccuracyLevel(score: number): keyof typeof accuracyColors {
  if (score >= 90) return "excellent"
  if (score >= 75) return "good"
  return "needsWork"
}

// Enhanced Waveform visualization component
function WaveformDisplay({
  userWaveform = [],
  targetWaveform = [],
  onUserClick,
  onTargetClick,
  isPlaying = false,
  playbackPosition = 0,
}: {
  userWaveform?: number[]
  targetWaveform?: number[]
  onUserClick?: (position: number) => void
  onTargetClick?: (position: number) => void
  isPlaying?: boolean
  playbackPosition?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    // Draw target waveform (blue)
    if (targetWaveform.length > 0) {
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.beginPath()

      targetWaveform.forEach((amplitude, index) => {
        const x = (index / targetWaveform.length) * width
        const y = height / 4 + (amplitude * height) / 4

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    }

    // Draw user waveform (red)
    if (userWaveform.length > 0) {
      ctx.strokeStyle = "#ef4444"
      ctx.lineWidth = 2
      ctx.beginPath()

      userWaveform.forEach((amplitude, index) => {
        const x = (index / userWaveform.length) * width
        const y = (3 * height) / 4 + (amplitude * height) / 4

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    }

    // Draw center line
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()

    // Draw playback position indicator
    if (isPlaying) {
      const playbackX = playbackPosition * width
      ctx.strokeStyle = "#10b981"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(playbackX, 0)
      ctx.lineTo(playbackX, height)
      ctx.stroke()
    }
  }, [userWaveform, targetWaveform, isPlaying, playbackPosition])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Target Pronunciation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Your Recording</span>
          </div>
          {isPlaying && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Playback Position</span>
            </div>
          )}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={150}
        className="w-full h-32 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const position = x / rect.width
          onUserClick?.(position)
        }}
        role="img"
        aria-label="Audio waveform comparison between target and user pronunciation. Click to play specific segments."
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onUserClick?.(0.5) // Play from middle
          }
        }}
      />
      <div className="text-xs text-gray-500 text-center">Click anywhere on the waveform to play that segment</div>
    </div>
  )
}

// Enhanced Tongue position visualization
function TonguePositionMap({
  phonemes,
  selectedPhoneme,
  onPhonemeSelect,
}: {
  phonemes: PhonemeData[]
  selectedPhoneme?: PhonemeData
  onPhonemeSelect?: (phoneme: PhonemeData) => void
}) {
  return (
    <div className="relative bg-gradient-to-b from-pink-50 to-red-50 rounded-lg p-4 border border-pink-200">
      <div className="text-center mb-4">
        <h4 className="font-medium text-gray-800">Vowel Articulation Map</h4>
        <p className="text-xs text-gray-600">Interactive tongue position visualization</p>
      </div>

      {/* Mouth diagram */}
      <div className="relative w-full h-40 bg-white rounded-lg border-2 border-pink-300 overflow-hidden">
        {/* Position labels */}
        <div className="absolute top-2 left-3 text-xs font-medium text-gray-600">High</div>
        <div className="absolute bottom-2 left-3 text-xs font-medium text-gray-600">Low</div>
        <div className="absolute top-2 left-3 text-xs font-medium text-gray-600">Front</div>
        <div className="absolute top-2 right-3 text-xs font-medium text-gray-600">Back</div>

        {/* Grid lines for reference */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1d5db" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Plot phonemes */}
        {phonemes
          .filter((p) => p.type === "vowel" && p.tonguePosition)
          .map((phoneme, index) => {
            const isSelected = selectedPhoneme?.symbol === phoneme.symbol
            const position = phoneme.tonguePosition!

            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-mono cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isSelected
                          ? "bg-blue-500 text-white border-blue-600 scale-125 z-10 shadow-lg"
                          : `${phonemeColors[phoneme.type]} scale-100 hover:scale-110`
                      }`}
                      style={{
                        left: `${position.x}%`,
                        top: `${100 - position.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onClick={() => onPhonemeSelect?.(phoneme)}
                      aria-label={`Phoneme ${phoneme.symbol} (${phoneme.plainEnglish}) at position ${position.x}% front-back, ${position.y}% high-low. Accuracy: ${phoneme.accuracy}%`}
                    >
                      {phoneme.symbol}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <div className="font-mono text-lg">{phoneme.symbol}</div>
                      <div className="text-sm">{phoneme.plainEnglish}</div>
                      <div className="text-xs text-gray-300">Accuracy: {phoneme.accuracy}%</div>
                      <div className="text-xs text-gray-400 mt-1">Click to select</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
      </div>

      {selectedPhoneme && (
        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Badge className={`font-mono ${phonemeColors[selectedPhoneme.type]}`}>{selectedPhoneme.symbol}</Badge>
              <span className="font-medium">{selectedPhoneme.plainEnglish}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${accuracyColors[getAccuracyLevel(selectedPhoneme.accuracy)]}`}
              ></div>
              <span className="text-sm font-medium">{selectedPhoneme.accuracy}%</span>
            </div>
          </div>
          {selectedPhoneme.mouthPosition && (
            <p className="text-sm text-gray-600">{selectedPhoneme.mouthPosition.description}</p>
          )}
        </div>
      )}
    </div>
  )
}

// Individual phoneme detail component with enhanced features
function PhonemeDetail({
  phoneme,
  onPlayPhoneme,
  onStartExercise,
}: {
  phoneme: PhonemeData
  onPlayPhoneme: (symbol: string) => void
  onStartExercise: (exercise: any) => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayPhoneme = (sound: string) => {
    setIsPlaying(true)
    onPlayPhoneme(sound)
    setTimeout(() => setIsPlaying(false), 1000)
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge className={`text-lg px-3 py-1 font-mono ${phonemeColors[phoneme.type]}`}>{phoneme.symbol}</Badge>
            <div>
              <h3 className="font-medium">{phoneme.plainEnglish}</h3>
              <p className="text-sm text-gray-600 capitalize">{phoneme.type.replace("-", " ")}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePlayPhoneme(phoneme.symbol)}
              disabled={isPlaying}
              className="bg-transparent"
              aria-label={`Play sound for phoneme ${phoneme.symbol}`}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <div
              className={`w-4 h-4 rounded-full ${accuracyColors[getAccuracyLevel(phoneme.accuracy)]}`}
              aria-label={`Accuracy level: ${getAccuracyLevel(phoneme.accuracy)}`}
            ></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Accuracy Progress with detailed feedback */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Pronunciation Accuracy</span>
            <span
              className={`text-sm font-bold px-2 py-1 rounded ${accuracyTextColors[getAccuracyLevel(phoneme.accuracy)]}`}
            >
              {phoneme.accuracy}%
            </span>
          </div>
          <Progress value={phoneme.accuracy} className="h-3" />
          <div className="text-xs text-gray-600">
            {phoneme.accuracy >= 90 && "Excellent! Your pronunciation is very accurate."}
            {phoneme.accuracy >= 75 && phoneme.accuracy < 90 && "Good progress! Minor adjustments needed."}
            {phoneme.accuracy < 75 && "Needs improvement. Focus on the tips below."}
          </div>
        </div>

        {/* Mouth Position Guide */}
        {phoneme.mouthPosition && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center">
              <Target className="h-4 w-4 mr-2 text-blue-500" />
              Mouth Position Guide
            </h4>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">{phoneme.mouthPosition.description}</p>
            </div>
          </div>
        )}

        {/* Articulation Tips */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center">
            <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
            Articulation Tips
          </h4>
          <ul className="space-y-2">
            {phoneme.articulationTips.map((tip, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start p-2 bg-gray-50 rounded">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Similar Words Practice */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-green-500" />
            Practice with Similar Words
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {phoneme.similarWords.map((word, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs bg-transparent justify-start"
                onClick={() => handlePlayPhoneme(word)}
                aria-label={`Practice with word: ${word}`}
              >
                <Volume2 className="h-3 w-3 mr-2" />
                {word}
              </Button>
            ))}
          </div>
        </div>

        {/* Recommended Exercises */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center">
            <Target className="h-4 w-4 mr-2 text-purple-500" />
            Recommended Exercises
          </h4>
          <div className="space-y-3">
            {phoneme.exercises.map((exercise, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                  <div className="font-medium text-sm">{exercise.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{exercise.description}</div>
                  <Badge variant="outline" className="text-xs mt-2">
                    {exercise.difficulty}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => onStartExercise(exercise)}
                  className="ml-3"
                  aria-label={`Start exercise: ${exercise.title}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PhoneticAnalysis({
  sentence,
  broadTranscription,
  narrowTranscription,
  phonemeData,
  userWaveform,
  targetWaveform,
  onPlayPhoneme,
  onPlayUserSegment,
  onPlayTargetSegment,
}: PhoneticAnalysisProps) {
  const [showNarrowTranscription, setShowNarrowTranscription] = useState(false)
  const [useIPA, setUseIPA] = useState(true)
  const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeData | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isWaveformPlaying, setIsWaveformPlaying] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(0)

  // Generate plain English transcription
  const plainEnglishTranscription = phonemeData.map((p) => p.plainEnglish).join(" ")

  const handlePhonemeClick = (phoneme: PhonemeData) => {
    setSelectedPhoneme(phoneme)
    setActiveTab("details")
    onPlayPhoneme(phoneme.symbol)
  }

  const handleStartExercise = (exercise: any) => {
    // This would navigate to a specific exercise
    console.log("Starting exercise:", exercise)
  }

  const handleWaveformPlay = (position: number) => {
    setIsWaveformPlaying(true)
    setPlaybackPosition(position)
    onPlayUserSegment(position * 3, position * 3 + 0.5)

    // Simulate playback progress
    const interval = setInterval(() => {
      setPlaybackPosition((prev) => {
        if (prev >= 1) {
          setIsWaveformPlaying(false)
          clearInterval(interval)
          return 0
        }
        return prev + 0.02
      })
    }, 50)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPhoneme(null)
      }
      if (event.key === "Tab" && selectedPhoneme) {
        // Allow tab navigation through phonemes
        const currentIndex = phonemeData.findIndex((p) => p.symbol === selectedPhoneme.symbol)
        if (event.shiftKey && currentIndex > 0) {
          setSelectedPhoneme(phonemeData[currentIndex - 1])
        } else if (!event.shiftKey && currentIndex < phonemeData.length - 1) {
          setSelectedPhoneme(phonemeData[currentIndex + 1])
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedPhoneme, phonemeData])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-500" />
            Advanced Phonetic Analysis
          </div>
          <div className="flex items-center space-x-2">
            <Toggle
              pressed={useIPA}
              onPressedChange={setUseIPA}
              aria-label="Toggle between IPA symbols and plain English pronunciation"
              className="text-sm"
            >
              {useIPA ? "IPA" : "Plain"}
            </Toggle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNarrowTranscription(!showNarrowTranscription)}
              className="bg-transparent"
              aria-label={`${showNarrowTranscription ? "Hide" : "Show"} narrow transcription`}
            >
              {showNarrowTranscription ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showNarrowTranscription ? "Hide Narrow" : "Show Narrow"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="waveform">Waveform Analysis</TabsTrigger>
            <TabsTrigger value="tongue-map">Articulation Map</TabsTrigger>
            <TabsTrigger value="details">Detailed Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Original Sentence */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">Original Text</h3>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-lg font-medium">{sentence}</p>
              </div>
            </div>

            {/* Transcriptions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">
                  {useIPA ? "Broad IPA Transcription" : "Plain English Pronunciation Guide"}
                </h3>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-lg font-mono leading-relaxed">
                    {useIPA ? broadTranscription : plainEnglishTranscription}
                  </p>
                </div>
              </div>

              {showNarrowTranscription && useIPA && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-800">Narrow IPA Transcription</h3>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-lg font-mono leading-relaxed">{narrowTranscription}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Phonemes */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-800">Interactive Phoneme Analysis</h3>
              <p className="text-sm text-gray-600">
                Click on phonemes to hear pronunciation and get detailed feedback. Use keyboard navigation for
                accessibility.
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Interactive phonemes">
                {phonemeData.map((phoneme, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => handlePhonemeClick(phoneme)}
                          className={`relative px-4 py-3 text-sm font-mono ${phonemeColors[phoneme.type]} transition-all hover:scale-105 focus:scale-105 focus:ring-2 focus:ring-blue-500`}
                          aria-label={`Phoneme ${phoneme.symbol}, pronounced as ${phoneme.plainEnglish}, accuracy ${phoneme.accuracy}%. Press Enter to hear sound and view details.`}
                          tabIndex={0}
                        >
                          <span className="text-base">{useIPA ? phoneme.symbol : phoneme.plainEnglish}</span>
                          <div
                            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${accuracyColors[getAccuracyLevel(phoneme.accuracy)]}`}
                            aria-hidden="true"
                          ></div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <div className="font-mono text-lg">{phoneme.symbol}</div>
                          <div className="text-sm">{phoneme.plainEnglish}</div>
                          <div className="text-xs">Accuracy: {phoneme.accuracy}%</div>
                          <div className="text-xs text-gray-400 mt-1">Click for details</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            {/* Enhanced Legend */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-medium text-sm mb-3">Legend & Guide</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Phoneme Types</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                      <span>Vowels</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                      <span>Consonants</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-purple-100 border border-purple-200 rounded"></div>
                      <span>Diphthongs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
                      <span>Clusters</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Accuracy Levels</h5>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Excellent (90%+)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Good (75-89%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Needs Work (&lt;75%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="waveform" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">Audio Waveform Comparison</h3>
              <p className="text-sm text-gray-600">
                Compare your pronunciation (red) with the target (blue). Click on the waveform to play specific
                segments. The green line shows current playback position.
              </p>
            </div>
            <WaveformDisplay
              userWaveform={userWaveform}
              targetWaveform={targetWaveform}
              onUserClick={handleWaveformPlay}
              onTargetClick={(position) => {
                const duration = 3
                const startTime = position * duration
                onPlayTargetSegment(startTime, startTime + 0.5)
              }}
              isPlaying={isWaveformPlaying}
              playbackPosition={playbackPosition}
            />
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => onPlayTargetSegment(0, 3)}
                className="bg-transparent"
                aria-label="Play complete target pronunciation"
              >
                <Play className="h-4 w-4 mr-2" />
                Play Target
              </Button>
              <Button
                variant="outline"
                onClick={() => onPlayUserSegment(0, 3)}
                className="bg-transparent"
                aria-label="Play complete user recording"
              >
                <Play className="h-4 w-4 mr-2" />
                Play Your Recording
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tongue-map" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">Interactive Articulation Map</h3>
              <p className="text-sm text-gray-600">
                Visual representation of tongue positions for vowel sounds. Click on phonemes to see detailed
                positioning information.
              </p>
            </div>
            <TonguePositionMap
              phonemes={phonemeData}
              selectedPhoneme={selectedPhoneme}
              onPhonemeSelect={setSelectedPhoneme}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Vowel Accuracy Summary</h4>
                {phonemeData
                  .filter((p) => p.type === "vowel")
                  .map((phoneme, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-3">
                        <Badge className={`font-mono ${phonemeColors[phoneme.type]}`}>{phoneme.symbol}</Badge>
                        <span className="text-sm font-medium">{phoneme.plainEnglish}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Progress value={phoneme.accuracy} className="w-20 h-2" />
                        <span className="text-sm font-medium w-12 text-right">{phoneme.accuracy}%</span>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Consonant Accuracy Summary</h4>
                {phonemeData
                  .filter((p) => p.type === "consonant")
                  .slice(0, 5)
                  .map((phoneme, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <div className="flex items-center space-x-3">
                        <Badge className={`font-mono ${phonemeColors[phoneme.type]}`}>{phoneme.symbol}</Badge>
                        <span className="text-sm font-medium">{phoneme.plainEnglish}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Progress value={phoneme.accuracy} className="w-20 h-2" />
                        <span className="text-sm font-medium w-12 text-right">{phoneme.accuracy}%</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {selectedPhoneme ? (
              <PhonemeDetail
                phoneme={selectedPhoneme}
                onPlayPhoneme={onPlayPhoneme}
                onStartExercise={handleStartExercise}
              />
            ) : (
              <div className="text-center py-12">
                <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-600 mb-2">Select a Phoneme for Detailed Analysis</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Click on a phoneme from the Overview tab to see detailed analysis, improvement recommendations, and
                  practice exercises.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("overview")}
                  className="bg-transparent"
                  aria-label="Go to overview tab to select a phoneme"
                >
                  Go to Overview
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

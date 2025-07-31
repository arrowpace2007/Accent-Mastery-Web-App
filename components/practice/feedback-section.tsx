"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, Volume2, Play, Lightbulb, TrendingUp } from "lucide-react"

interface WordFeedback {
  word: string
  score: number
  status: "excellent" | "good" | "needs-work"
  phonemes?: Array<{
    sound: string
    accuracy: number
    tip?: string
  }>
}

interface FeedbackSectionProps {
  overallScore: number
  wordFeedback: WordFeedback[]
  suggestions: string[]
  onPlayNative: () => void
  onPlayUser: () => void
  isPlayingNative: boolean
  isPlayingUser: boolean
  exerciseRecommendations: Array<{
    title: string
    description: string
    difficulty: string
  }>
}

export function FeedbackSection({
  overallScore,
  wordFeedback,
  suggestions,
  onPlayNative,
  onPlayUser,
  isPlayingNative,
  isPlayingUser,
  exerciseRecommendations,
}: FeedbackSectionProps) {
  const [selectedWord, setSelectedWord] = useState<WordFeedback | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100 border-green-200"
    if (score >= 75) return "text-yellow-600 bg-yellow-100 border-yellow-200"
    return "text-red-600 bg-red-100 border-red-200"
  }

  const getWordStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
      case "good":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
      case "needs-work":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
    }
  }

  const getScoreMessage = (score: number) => {
    if (score >= 95) return "Excellent! Near-perfect pronunciation!"
    if (score >= 85) return "Great job! Very good pronunciation!"
    if (score >= 75) return "Good work! Some areas to improve."
    if (score >= 60) return "Keep practicing! You're making progress."
    return "Don't worry! Practice makes perfect."
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2 text-green-500" />
          AI Pronunciation Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-4">
          <div
            className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold border-2 ${getScoreColor(overallScore)}`}
          >
            {overallScore}% Accuracy
          </div>
          <p className="text-gray-600">{getScoreMessage(overallScore)}</p>
          <Progress value={overallScore} className="h-3" />
        </div>

        <Tabs defaultValue="words" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="words">Word Analysis</TabsTrigger>
            <TabsTrigger value="comparison">Audio Compare</TabsTrigger>
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
          </TabsList>

          <TabsContent value="words" className="space-y-4">
            {/* Word-by-word Feedback */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Tap words for detailed feedback:</h4>
              <div className="flex flex-wrap gap-2">
                {wordFeedback.map((word, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setSelectedWord(selectedWord?.word === word.word ? null : word)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${getWordStatusColor(word.status)} ${
                      selectedWord?.word === word.word ? "ring-2 ring-blue-500" : ""
                    }`}
                  >
                    {word.word}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {word.score}%
                    </Badge>
                  </Button>
                ))}
              </div>

              {/* Detailed Word Feedback */}
              {selectedWord && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-blue-900">"{selectedWord.word}" Analysis</h5>
                    <Badge className={getScoreColor(selectedWord.score)}>{selectedWord.score}%</Badge>
                  </div>

                  {selectedWord.phonemes && (
                    <div className="space-y-2">
                      <p className="text-sm text-blue-800 font-medium">Phoneme Breakdown:</p>
                      {selectedWord.phonemes.map((phoneme, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white rounded p-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="font-mono">
                              {phoneme.sound}
                            </Badge>
                            <Progress value={phoneme.accuracy} className="w-20 h-2" />
                            <span className="text-xs text-gray-600">{phoneme.accuracy}%</span>
                          </div>
                          {phoneme.tip && <div className="text-xs text-blue-700 max-w-xs">{phoneme.tip}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            {/* Audio Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center space-y-3">
                  <h4 className="font-medium text-blue-900">Native Pronunciation</h4>
                  <Button
                    onClick={onPlayNative}
                    disabled={isPlayingNative}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {isPlayingNative ? (
                      <>
                        <Play className="h-4 w-4 mr-2 animate-pulse" />
                        Playing...
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 mr-2" />
                        Play Native
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center space-y-3">
                  <h4 className="font-medium text-green-900">Your Pronunciation</h4>
                  <Button
                    onClick={onPlayUser}
                    disabled={isPlayingUser}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {isPlayingUser ? (
                      <>
                        <Play className="h-4 w-4 mr-2 animate-pulse" />
                        Playing...
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 mr-2" />
                        Play Yours
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Improvement Suggestions */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center text-amber-900">
                <Lightbulb className="h-4 w-4 mr-2" />
                Improvement Tips:
              </h4>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-amber-800 flex items-start">
                    <span className="text-amber-600 mr-2">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-4">
            {/* Recommended Exercises */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
                Recommended Practice Exercises:
              </h4>
              {exerciseRecommendations.map((exercise, index) => (
                <Card key={index} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-1">{exercise.title}</h5>
                        <p className="text-sm text-gray-600 mb-2">{exercise.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {exercise.difficulty}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline" className="ml-4 bg-transparent">
                        Try Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

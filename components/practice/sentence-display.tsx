"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Volume2, ChevronDown, ChevronUp, Globe } from "lucide-react"

interface SentenceDisplayProps {
  sentence: string
  phonetic: string
  targetAccent: string
  onAccentChange: (accent: string) => void
  onPlayAudio: () => void
  isPlaying: boolean
  targetSounds: string[]
  tips: string
}

const accents = [
  { id: "american", label: "American English", flag: "🇺🇸", description: "General American" },
  { id: "british", label: "British English", flag: "🇬🇧", description: "Received Pronunciation" },
  { id: "australian", label: "Australian English", flag: "🇦🇺", description: "General Australian" },
  { id: "irish", label: "Irish English", flag: "🇮🇪", description: "Dublin Irish" },
  { id: "scottish", label: "Scottish English", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", description: "Edinburgh Scottish" },
  { id: "canadian", label: "Canadian English", flag: "🇨🇦", description: "Standard Canadian" },
]

export function SentenceDisplay({
  sentence,
  phonetic,
  targetAccent,
  onAccentChange,
  onPlayAudio,
  isPlaying,
  targetSounds,
  tips,
}: SentenceDisplayProps) {
  const [showPhonetics, setShowPhonetics] = useState(false)
  const [showTips, setShowTips] = useState(false)

  const selectedAccent = accents.find((a) => a.id === targetAccent) || accents[0]

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        {/* Accent Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-500" />
            <span className="font-medium text-gray-700">Target Accent:</span>
          </div>
          <Select value={targetAccent} onValueChange={onAccentChange}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{selectedAccent.flag}</span>
                  <span>{selectedAccent.label}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {accents.map((accent) => (
                <SelectItem key={accent.id} value={accent.id}>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{accent.flag}</span>
                    <div>
                      <div className="font-medium">{accent.label}</div>
                      <div className="text-xs text-gray-500">{accent.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Sentence */}
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
            <p className="text-2xl md:text-3xl font-medium leading-relaxed text-gray-800 mb-4">{sentence}</p>

            {/* Audio Control */}
            <Button
              onClick={onPlayAudio}
              disabled={isPlaying}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Volume2 className={`h-5 w-5 mr-2 ${isPlaying ? "animate-pulse" : ""}`} />
              {isPlaying ? "Playing..." : "Listen to Native"}
            </Button>
          </div>

          {/* Phonetic Breakdown */}
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => setShowPhonetics(!showPhonetics)}
              className="text-sm bg-transparent"
            >
              {showPhonetics ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Hide Phonetics
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show Phonetics
                </>
              )}
            </Button>

            {showPhonetics && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 animate-in slide-in-from-top-2 duration-200">
                <p className="text-lg font-mono text-blue-800 mb-3">{phonetic}</p>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Target Sounds:</h4>
                  <div className="flex flex-wrap gap-2">
                    {targetSounds.map((sound, index) => (
                      <Badge key={index} variant="secondary" className="font-mono text-sm bg-blue-100 text-blue-800">
                        {sound}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div className="space-y-3">
            <Button variant="outline" onClick={() => setShowTips(!showTips)} className="text-sm bg-transparent">
              {showTips ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Hide Tips
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show Pronunciation Tips
                </>
              )}
            </Button>

            {showTips && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 animate-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-amber-800">{tips}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

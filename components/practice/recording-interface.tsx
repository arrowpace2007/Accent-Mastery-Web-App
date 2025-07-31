"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, MicOff, Play, Pause, RotateCcw, ArrowRight, Volume2 } from "lucide-react"

interface RecordingInterfaceProps {
  isRecording: boolean
  recordingTime: number
  audioLevel: number
  hasRecording: boolean
  isPlayingRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onPlayRecording: () => void
  onStopPlayback: () => void
  onReRecord: () => void
  onContinue: () => void
  maxRecordingTime?: number
}

export function RecordingInterface({
  isRecording,
  recordingTime,
  audioLevel,
  hasRecording,
  isPlayingRecording,
  onStartRecording,
  onStopRecording,
  onPlayRecording,
  onStopPlayback,
  onReRecord,
  onContinue,
  maxRecordingTime = 30,
}: RecordingInterfaceProps) {
  const [pulseAnimation, setPulseAnimation] = useState(false)

  useEffect(() => {
    if (isRecording) {
      setPulseAnimation(true)
      const interval = setInterval(() => {
        setPulseAnimation((prev) => !prev)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setPulseAnimation(false)
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const recordingProgress = (recordingTime / maxRecordingTime) * 100

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Record Your Pronunciation</h3>

          {/* Recording Status */}
          {isRecording && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-center space-x-2 text-red-700">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Recording in progress...</span>
              </div>
              <div className="mt-2 text-2xl font-mono text-red-800">{formatTime(recordingTime)}</div>
              <Progress value={recordingProgress} className="mt-2 h-2" />
              {recordingTime >= maxRecordingTime - 5 && (
                <p className="text-xs text-red-600 mt-1">
                  Recording will stop automatically in {maxRecordingTime - recordingTime} seconds
                </p>
              )}
            </div>
          )}

          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Volume2 className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Audio Level</span>
              </div>
              <div className="flex items-center justify-center space-x-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-8 rounded-full transition-all duration-100 ${
                      i < audioLevel ? (i < 6 ? "bg-green-500" : i < 8 ? "bg-yellow-500" : "bg-red-500") : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Main Record Button */}
          <div className="flex justify-center">
            <Button
              onClick={isRecording ? onStopRecording : onStartRecording}
              size="lg"
              className={`w-24 h-24 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 ${
                isRecording
                  ? `bg-red-500 hover:bg-red-600 ${pulseAnimation ? "scale-110" : "scale-100"}`
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              }`}
            >
              {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
          </div>

          <p className="text-sm text-gray-600">
            {isRecording ? "Tap to stop recording" : hasRecording ? "Tap to re-record" : "Tap to start recording"}
          </p>
        </div>

        {/* Playback Controls */}
        {hasRecording && !isRecording && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">Recording Complete</span>
            </div>

            {/* Playback Button */}
            <div className="flex justify-center">
              <Button
                onClick={isPlayingRecording ? onStopPlayback : onPlayRecording}
                variant="outline"
                size="lg"
                className="bg-white border-green-300 text-green-700 hover:bg-green-50"
              >
                {isPlayingRecording ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Stop Playback
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Play Recording
                  </>
                )}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={onReRecord} variant="outline" className="flex-1 sm:flex-none bg-transparent">
                <RotateCcw className="h-4 w-4 mr-2" />
                Re-record
              </Button>
              <Button
                onClick={onContinue}
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Recording Instructions */}
        {!hasRecording && !isRecording && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Recording Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Find a quiet environment</li>
              <li>• Speak clearly and at normal pace</li>
              <li>• Hold device 6-8 inches from your mouth</li>
              <li>• Try to match the native pronunciation</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, MicOff, Play, Pause, RotateCcw, ArrowRight, Volume2, Loader2, AlertCircle } from "lucide-react"
import { useSpeechAnalysis } from "@/hooks/use-speech-analysis"

interface EnhancedRecordingInterfaceProps {
  targetSentence: string
  accentType: string
  difficulty?: string
  onAnalysisComplete: (result: any) => void
  onContinue: () => void
  maxRecordingTime?: number
}

export function EnhancedRecordingInterface({
  targetSentence,
  accentType,
  difficulty = "intermediate",
  onAnalysisComplete,
  onContinue,
  maxRecordingTime = 30,
}: EnhancedRecordingInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [hasRecording, setHasRecording] = useState(false)
  const [isPlayingRecording, setIsPlayingRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingInterval = useRef<NodeJS.Timeout>()
  const audioLevelInterval = useRef<NodeJS.Timeout>()
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { isProcessing, progress, result, error, processSpeech, reset } = useSpeechAnalysis()

  useEffect(() => {
    if (result) {
      onAnalysisComplete(result)
    }
  }, [result, onAnalysisComplete])

  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxRecordingTime) {
            handleStopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)

      // Audio level monitoring
      if (analyserRef.current) {
        audioLevelInterval.current = setInterval(() => {
          const dataArray = new Uint8Array(analyserRef.current!.frequencyBinCount)
          analyserRef.current!.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
          setAudioLevel(Math.floor((average / 255) * 10))
        }, 100)
      }
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
  }, [isRecording, maxRecordingTime])

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Set up audio context for level monitoring
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)
        setAudioUrl(URL.createObjectURL(audioBlob))
        setHasRecording(true)

        // Clean up
        stream.getTracks().forEach((track) => track.stop())
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      reset() // Reset any previous analysis
    } catch (error) {
      console.error("Error starting recording:", error)
      alert("Could not access microphone. Please check permissions.")
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handlePlayRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl
      audioRef.current.play()
      setIsPlayingRecording(true)

      audioRef.current.onended = () => {
        setIsPlayingRecording(false)
      }
    }
  }

  const handleStopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlayingRecording(false)
    }
  }

  const handleReRecord = () => {
    setHasRecording(false)
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    reset()
    if (audioRef.current) {
      audioRef.current.src = ""
    }
  }

  const handleAnalyze = async () => {
    if (audioBlob) {
      await processSpeech(audioBlob, targetSentence, accentType, difficulty)
    }
  }

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

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-center space-x-2 text-blue-700 mb-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="font-medium">Analyzing your pronunciation...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-blue-600 mt-2">{Math.round(progress)}% complete</p>
            </div>
          )}

          {/* Main Record Button */}
          <div className="flex justify-center">
            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              size="lg"
              disabled={isProcessing}
              className={`w-24 h-24 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
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
        {hasRecording && !isRecording && !isProcessing && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">Recording Complete</span>
            </div>

            {/* Playback Button */}
            <div className="flex justify-center">
              <Button
                onClick={isPlayingRecording ? handleStopPlayback : handlePlayRecording}
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
              <Button onClick={handleReRecord} variant="outline" className="flex-1 sm:flex-none bg-transparent">
                <RotateCcw className="h-4 w-4 mr-2" />
                Re-record
              </Button>
              {!result && (
                <Button
                  onClick={handleAnalyze}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze Pronunciation
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
              {result && (
                <Button
                  onClick={onContinue}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Recording Instructions */}
        {!hasRecording && !isRecording && !isProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Recording Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Find a quiet environment</li>
              <li>• Speak clearly and at normal pace</li>
              <li>• Hold device 6-8 inches from your mouth</li>
              <li>• Try to match the native pronunciation</li>
              <li>• Ensure good audio levels (green bars)</li>
            </ul>
          </div>
        )}

        {/* Hidden audio element for playback */}
        <audio ref={audioRef} style={{ display: "none" }} />
      </CardContent>
    </Card>
  )
}

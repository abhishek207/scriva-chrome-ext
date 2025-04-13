"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void
  className?: string
  maxRecordingTime?: number // in seconds
}

export function AudioRecorder({
  onTranscriptionComplete,
  className,
  maxRecordingTime = 20, // Default to 20 seconds
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Effect to handle the recording timer
  useEffect(() => {
    if (isRecording) {
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          // Auto-stop recording when reaching the time limit
          if (newTime >= maxRecordingTime) {
            stopRecording()
            return 0
          }
          return newTime
        })
      }, 1000)
    } else {
      // Clear timer when not recording
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setRecordingTime(0)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, maxRecordingTime])

  const startRecording = async () => {
    try {
      setError(null)
      setRecordingTime(0)

      // Stop any existing recording first
      if (mediaRecorderRef.current && isRecording) {
        stopRecording()
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Use a more compatible MIME type with fallbacks
      let mimeType = "audio/webm"
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus"
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm"
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4"
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          // No audio data was collected, likely because recording was stopped immediately
          setIsProcessing(false)
          return
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        try {
          setIsProcessing(true)
          const transcription = await transcribeWithGemini(audioBlob)
          onTranscriptionComplete(transcription)
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to transcribe audio")
          console.error("Transcription error:", err)
        } finally {
          setIsProcessing(false)
        }

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      setError("Microphone access denied. Please allow microphone access to use this feature.")
      console.error("Recording error:", err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setRecordingTime(0)
      } catch (err) {
        console.error("Error stopping recording:", err)
        // Force reset the state if there's an error
        setIsRecording(false)
        setRecordingTime(0)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
    }
  }

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        // Extract only the base64 data part without the prefix
        const base64Data = base64String.split(",")[1] || base64String
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const transcribeWithGemini = async (audioBlob: Blob): Promise<string> => {
    try {
      const base64Audio = await blobToBase64(audioBlob)

      // Prepare the transcription prompt - this is the key part for formatting
      const transcriptionPrompt =
        "Transcribe this audio with the following improvements:\n\n" +
        "1. Fix grammatical errors while preserving the original meaning\n" +
        "2. Remove unnecessary word repetitions (like 'I think, I think that...')\n" +
        "3. Remove filler words like 'um', 'uh', 'like', 'you know', etc.\n" +
        "4. Maintain natural flow and conversational tone\n" +
        "5. Add proper punctuation and capitalization\n" +
        "6. Format into coherent paragraphs\n" +
        "7. Use bullet points for lists\n\n" +
        "IMPORTANT: Return ONLY the cleaned-up transcription without any explanations or meta-commentary. Preserve all meaningful content even if grammatically imperfect."

      console.log("Sending transcription prompt:", transcriptionPrompt)

      const payload = {
        contents: [
          {
            parts: [
              {
                text: transcriptionPrompt,
              },
              {
                inline_data: {
                  mime_type: "audio/webm",
                  data: base64Audio,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.0,
          topP: 0.8,
          topK: 16,
          maxOutputTokens: 1024,
        },
      }

      // Use AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30-second timeout

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=AIzaSyDDvrZ_kWCTAy-1B9brQBAPZQFVUqo0ItQ`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        },
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      console.log("Gemini API response:", data)

      // Extract the transcription from the response
      let transcription = ""
      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0]
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          transcription = candidate.content.parts[0].text || ""
        }
      }

      return transcription
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("Transcription request timed out. Please try again with a shorter recording.")
      }
      throw error
    }
  }

  // Calculate progress percentage for the timer ring
  const progressPercentage = (recordingTime / maxRecordingTime) * 100

  return (
    <div className={cn("flex items-center", className)}>
      {error && <p className="text-sm text-red-500 mr-2">{error}</p>}

      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className="text-muted-foreground/20"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercentage / 100)}`}
                className="text-secondary-dark"
              />
            </svg>
          </div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            isRecording ? stopRecording() : startRecording()
          }}
          disabled={isProcessing}
          className={cn(
            "flex items-center justify-center rounded-full w-12 h-12 transition-all duration-300 shadow-md",
            isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary hover:bg-primary-dark text-white",
            isProcessing && "opacity-70 cursor-not-allowed",
          )}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isRecording ? (
            <>
              <Square className="h-4 w-4" />
              <span className="sr-only">{maxRecordingTime - recordingTime}s remaining</span>
            </>
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>
      </div>

      {isRecording && (
        <span className="ml-2 text-xs font-medium text-secondary-dark">{maxRecordingTime - recordingTime}s</span>
      )}
    </div>
  )
}

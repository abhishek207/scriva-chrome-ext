"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AudioRecorder } from "@/components/audio-recorder"

export function Hero() {
  const [transcription, setTranscription] = useState<string>("")
  const [isTranscribed, setIsTranscribed] = useState(false)

  const handleTranscriptionComplete = (text: string) => {
    setTranscription(text)
    setIsTranscribed(true)
  }

  const resetTranscription = () => {
    setTranscription("")
    setIsTranscribed(false)
  }

  // Function to format the transcription with proper styling
  const formatTranscription = (text: string) => {
    if (!text) return null

    // Split by line breaks to handle bullet points properly
    const lines = text.split("\n")

    return (
      <>
        {lines.map((line, index) => {
          // Check if line is a bullet point
          if (line.trim().startsWith("•") || line.trim().startsWith("-") || /^\d+\./.test(line.trim())) {
            return (
              <p key={index} className="text-sm mb-1 pl-4 relative">
                <span className="absolute left-0">{line.trim().match(/^[•\-\d.]+/)?.[0]}</span>
                <span>{line.trim().replace(/^[•\-\d.]+\s*/, "")}</span>
              </p>
            )
          }
          // Regular paragraph
          return line.trim() ? (
            <p key={index} className="text-sm mb-2">
              {line}
            </p>
          ) : (
            <br key={index} />
          )
        })}
      </>
    )
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-4 md:space-y-6">
              <div className="inline-flex items-center rounded-full bg-secondary/20 px-3 py-1 text-sm font-medium mb-2">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-dark opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-dark"></span>
                </span>
                Now with unlimited transcription
              </div>
              <h1 className="text-3xl font-bold tracking-tighter leading-tight sm:text-4xl md:text-5xl lg:text-tight">
                Transform Your Voice Into Text with Scriva Voice
              </h1>
              <p className="text-muted-foreground md:text-xl mb-6 md:mb-8">
                A powerful Chrome extension that lets you dictate text into any field across the web.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2 md:mt-4">
              <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer">
                <Button className="bg-primary hover:bg-primary-dark shadow-md hover:shadow-lg transition-shadow duration-300">
                  Download Extension
                </Button>
              </a>
              <a href="#features">
                <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow duration-300">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-secondary/30 rounded-full blur-3xl" />
              <div className="relative bg-white dark:bg-gray-900 border rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                      >
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                        <line x1="12" x2="12" y1="19" y2="22"></line>
                      </svg>
                    </div>
                    <span className="font-medium">Scriva Voice</span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent-foreground font-medium">
                    Try it now! (20s max)
                  </span>
                </div>
                <div className="h-40 bg-muted rounded-md mb-4 p-3 shadow-inner overflow-y-auto">
                  {isTranscribed ? (
                    <div className="text-left">
                      {formatTranscription(transcription) || (
                        <p className="text-sm text-muted-foreground">
                          No transcription available. Try recording again.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-center text-muted-foreground">
                      Click the microphone button below to start recording and see real-time transcription.
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <div className="text-sm font-medium">
                    {isTranscribed ? "Transcription complete" : "Ready to record"}
                  </div>
                  <div className="flex items-center gap-3">
                    {isTranscribed && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resetTranscription}
                        className="shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        Reset
                      </Button>
                    )}
                    <AudioRecorder onTranscriptionComplete={handleTranscriptionComplete} maxRecordingTime={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

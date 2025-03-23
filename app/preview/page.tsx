"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Mic } from "lucide-react"
import "./preview.css"
import { transcribeWithOpenAI, transcribeWithGemini } from "./api-utils"

interface Settings {
  engine: "browser" | "openai" | "gemini"
  apiKey: string
  customShortcutModifier?: "ctrl" | "alt" | "shift"
  customShortcutKey?: string
}

interface Transcript {
  text: string
  timestamp: string
  engine: string
}

// Declare SpeechRecognition
declare var SpeechRecognition: any
declare var webkitSpeechRecognition: any

export default function PopupPreview() {
  const [activeTab, setActiveTab] = useState<"main" | "settings" | "history">("main")
  const [isRecording, setIsRecording] = useState(false)
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [status, setStatus] = useState("Ready")
  const [recordingTime, setRecordingTime] = useState(0)
  // Add silence detection state
  const [silenceTime, setSilenceTime] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const speakingSimulatorRef = useRef<NodeJS.Timeout | null>(null)
  // Add a new state to track if the cursor is in an input field
  const [isInInputField, setIsInInputField] = useState(true)
  // Add a toggle button to simulate cursor position for demo purposes
  const toggleInputFieldStatus = () => {
    setIsInInputField(!isInInputField)
  }
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings>({
    engine: "browser",
    apiKey: "",
    customShortcutModifier: "alt",
    customShortcutKey: "s",
  })
  const [apiKeyInput, setApiKeyInput] = useState("")
  const [showApiKeySection, setShowApiKeySection] = useState(false)
  const [transcripts, setTranscripts] = useState<Transcript[]>([
    {
      text: "This is a sample transcript to demonstrate how the history tab looks. You can copy or delete this transcript.",
      timestamp: new Date().toISOString(),
      engine: "OpenAI",
    },
    {
      text: "Here's another sample transcript. In a real implementation, these would be your actual transcriptions.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      engine: "Browser API",
    },
  ])

  // Add speech recognition references
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameId = useRef<number | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const silenceIndicatorRef = useRef<HTMLDivElement | null>(null)

  // Define stopRecording function first
  const stopRecording = useCallback(() => {
    try {
      if (settings.engine === "browser") {
        // Stop browser speech recognition
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
      } else {
        // Stop media recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          mediaRecorderRef.current.stop()
        }
      }

      setIsRecording(false)
    } catch (err) {
      console.error("Error stopping recording:", err)
      setError(err instanceof Error ? err.message : "Failed to stop recording")
      setStatus("Error")
    }
  }, [settings.engine])

  // Then define stopOverlayRecording
  const stopOverlayRecording = useCallback(() => {
    // Stop actual recording
    stopRecording()

    // Show processing message in overlay
    if (overlayRef.current) {
      overlayRef.current.innerHTML = ""
      const processingText = document.createElement("span")
      processingText.textContent = "Processing transcript..."
      processingText.style.fontSize = "14px"
      processingText.style.fontWeight = "500"
      overlayRef.current.appendChild(processingText)
    }

    // Hide overlay after processing
    setTimeout(() => {
      setIsOverlayVisible(false)

      // Show different notifications based on cursor position
      if (isInInputField) {
        // Text field focused - insert at cursor
        const notification = document.createElement("div")
        notification.textContent = "Text inserted at cursor position"
        notification.className = "text-insertion-notification"
        document.body.appendChild(notification)

        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 3000)
      } else if (transcript) {
        // No text field focused - we can't directly copy to clipboard due to browser security
        // Instead, show a notification with a copy button
        const notification = document.createElement("div")
        notification.className = "clipboard-manual-notification"

        const message = document.createElement("span")
        message.textContent = "No text field focused. Click to copy text:"
        notification.appendChild(message)

        const copyButton = document.createElement("button")
        copyButton.textContent = "Copy to clipboard"
        copyButton.className = "clipboard-copy-button"
        copyButton.onclick = () => {
          navigator.clipboard
            .writeText(transcript)
            .then(() => {
              copyButton.textContent = "Copied!"
              copyButton.disabled = true
              setTimeout(() => {
                if (document.body.contains(notification)) {
                  document.body.removeChild(notification)
                }
              }, 2000)
            })
            .catch((err) => {
              console.error("Failed to copy text: ", err)
              copyButton.textContent = "Failed to copy"
            })
        }

        notification.appendChild(copyButton)
        document.body.appendChild(notification)

        // Auto-remove after 10 seconds if not clicked
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 10000)
      }
    }, 2000)
  }, [transcript, isInInputField, stopRecording])

  // Initialize browser speech recognition
  const initBrowserSpeechRecognition = useCallback(() => {
    try {
      // Check if the browser supports SpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        throw new Error("Browser speech recognition not supported")
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsRecording(true)
        setStatus("Recording...")
        setError(null)
      }

      recognition.onresult = (event) => {
        // Reset silence timer when speech is detected
        setIsSpeaking(true)
        setSilenceTime(0)

        // Get the transcript
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("")

        setTranscript(transcript)
      }

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        setError(`Speech recognition error: ${event.error}`)
        setStatus("Error")
        stopOverlayRecording()
      }

      recognition.onend = () => {
        setIsRecording(false)
        setStatus("Processing...")

        // Add to transcript history
        if (transcript) {
          const newTranscript = {
            text: transcript,
            timestamp: new Date().toISOString(),
            engine: "Browser API",
          }

          setTranscripts((prev) => [newTranscript, ...prev])
        }
      }

      // Store the recognition instance
      recognitionRef.current = recognition

      return recognition
    } catch (err) {
      console.error("Error initializing speech recognition:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize speech recognition")
      return null
    }
  }, [transcript, stopOverlayRecording])

  // Initialize media recorder for Gemini and OpenAI
  const initMediaRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setStatus("Processing...")

        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })

        try {
          // Process with selected API
          let transcriptText = ""

          if (settings.engine === "gemini") {
            if (!settings.apiKey) {
              throw new Error("Gemini API key is required")
            }

            transcriptText = await transcribeWithGemini(audioBlob, settings.apiKey)
          } else if (settings.engine === "openai") {
            if (!settings.apiKey) {
              throw new Error("OpenAI API key is required")
            }

            transcriptText = await transcribeWithOpenAI(audioBlob, settings.apiKey)
          }

          setTranscript(transcriptText)
          setStatus("Ready")

          // Add to transcript history
          if (transcriptText) {
            const newTranscript = {
              text: transcriptText,
              timestamp: new Date().toISOString(),
              engine: settings.engine === "gemini" ? "Gemini 2.0 Flash" : "OpenAI API",
            }

            setTranscripts((prev) => [newTranscript, ...prev])
          }
        } catch (err) {
          console.error("Error processing audio:", err)
          setError(err instanceof Error ? err.message : "Failed to process audio")
          setStatus("Error")
        } finally {
          // Stop all tracks to release the microphone
          stream.getTracks().forEach((track) => track.stop())
        }
      }

      // Store the media recorder instance
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      return mediaRecorder
    } catch (err) {
      console.error("Error initializing media recorder:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize media recorder")
      return null
    }
  }, [settings.engine, settings.apiKey])

  const startRecording = useCallback(async () => {
    try {
      if (settings.engine === "browser") {
        // Use browser speech recognition
        const recognition = recognitionRef.current || initBrowserSpeechRecognition()

        if (recognition) {
          recognition.start()
        } else {
          throw new Error("Failed to initialize speech recognition")
        }
      } else {
        // Use media recorder for Gemini or OpenAI
        const mediaRecorder = mediaRecorderRef.current || (await initMediaRecorder())

        if (mediaRecorder) {
          audioChunksRef.current = []
          mediaRecorder.start()
          setIsRecording(true)
          setStatus("Recording...")
          setError(null)
        } else {
          throw new Error("Failed to initialize media recorder")
        }
      }
    } catch (err) {
      console.error("Error starting recording:", err)
      setError(err instanceof Error ? err.message : "Failed to start recording")
      setStatus("Error")
    }
  }, [settings.engine, initBrowserSpeechRecognition, initMediaRecorder])

  const startOverlayRecording = useCallback(() => {
    setIsRecording(true)
    setIsOverlayVisible(true)
    setIsSpeaking(true) // Start with speaking state active
    setSilenceTime(0)
    setTranscript("") // Clear previous transcript

    // Start actual recording
    startRecording()
  }, [startRecording])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Ctrl+Q for starting recording
      if (e.ctrlKey && e.key === "q") {
        e.preventDefault()
        if (!isRecording) {
          startOverlayRecording()
        }
      }

      // Handle custom shortcut
      const isCtrl = e.ctrlKey && settings.customShortcutModifier === "ctrl"
      const isAlt = e.altKey && settings.customShortcutModifier === "alt"
      const isShift = e.shiftKey && settings.customShortcutModifier === "shift"

      if ((isCtrl || isAlt || isShift) && e.key.toLowerCase() === settings.customShortcutKey) {
        e.preventDefault()
        if (!isRecording) {
          startOverlayRecording()
        }
      }

      // Handle ESC to stop recording
      if (e.key === "Escape" && isRecording) {
        stopOverlayRecording()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isRecording, settings, stopOverlayRecording, startOverlayRecording])

  // Recording timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      setRecordingTime(0)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isRecording])

  // Silence detection
  useEffect(() => {
    if (isRecording) {
      // Start silence timer
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current)
      }

      silenceTimerRef.current = setInterval(() => {
        if (!isSpeaking) {
          setSilenceTime((prev) => {
            // If silence reaches 4 seconds, stop recording
            if (prev >= 4) {
              if (silenceTimerRef.current) {
                clearInterval(silenceTimerRef.current)
              }
              stopOverlayRecording()
              return 0
            }
            return prev + 0.1
          })
        } else {
          setSilenceTime(0)
        }
      }, 100)

      // Only simulate speaking patterns if we're not using the real browser API
      if (settings.engine !== "browser") {
        if (speakingSimulatorRef.current) {
          clearInterval(speakingSimulatorRef.current)
        }

        speakingSimulatorRef.current = setInterval(() => {
          // Randomly toggle speaking state to simulate speech patterns
          // More likely to be speaking than silent for a realistic simulation
          const shouldBeSpeaking = Math.random() > 0.3
          setIsSpeaking(shouldBeSpeaking)
        }, 500)
      }
    } else {
      // Clear timers when not recording
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current)
        silenceTimerRef.current = null
      }

      if (speakingSimulatorRef.current) {
        clearInterval(speakingSimulatorRef.current)
        speakingSimulatorRef.current = null
      }

      setSilenceTime(0)
      setIsSpeaking(false)
    }

    return () => {
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current)
      }
      if (speakingSimulatorRef.current) {
        clearInterval(speakingSimulatorRef.current)
      }
    }
  }, [isRecording, isSpeaking, settings.engine, stopOverlayRecording])

  // Update silence indicator
  useEffect(() => {
    if (silenceIndicatorRef.current && isRecording) {
      // Update the width of the silence indicator based on silence time
      const percentage = (silenceTime / 4) * 100
      silenceIndicatorRef.current.style.width = `${percentage}%`

      // Update color based on how close to auto-stopping
      if (percentage < 50) {
        silenceIndicatorRef.current.style.backgroundColor = "#10b981" // Green
      } else if (percentage < 75) {
        silenceIndicatorRef.current.style.backgroundColor = "#f59e0b" // Amber
      } else {
        silenceIndicatorRef.current.style.backgroundColor = "#ef4444" // Red
      }
    }
  }, [silenceTime, isRecording])

  // Draw waveform animation
  useEffect(() => {
    if (isRecording && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (ctx) {
        const drawWaveform = () => {
          // Clear canvas
          ctx.fillStyle = "rgba(99, 102, 241, 0.2)"
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Draw waveform
          ctx.lineWidth = 2
          ctx.strokeStyle = "white"
          ctx.beginPath()

          const sliceWidth = canvas.width / 50
          let x = 0

          for (let i = 0; i < 50; i++) {
            // Generate random height for simulation
            // Make the waveform more active when "speaking"
            const amplitude = isSpeaking ? 20 : 5
            const height = Math.random() * amplitude + 5
            const y = canvas.height / 2 + Math.sin(i + recordingTime) * height

            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }

            x += sliceWidth
          }

          ctx.lineTo(canvas.width, canvas.height / 2)
          ctx.stroke()

          animationFrameId.current = requestAnimationFrame(drawWaveform)
        }

        drawWaveform()
      }

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current)
        }
      }
    }
  }, [isRecording, recordingTime, isSpeaking])

  const insertTextAtCursor = () => {
    try {
      setStatus("Text inserted!")
      setTimeout(() => setStatus("Ready"), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setStatus("Error")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleEngineChange = (engine: "browser" | "openai" | "gemini") => {
    // Clean up existing recognition or recorder
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }

    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
      mediaRecorderRef.current = null
    }

    setSettings({
      ...settings,
      engine,
    })

    // Reset API key input when changing engines
    if (engine !== settings.engine) {
      setApiKeyInput(settings.apiKey || "")
    }

    setShowApiKeySection(engine === "openai" || engine === "gemini")
  }

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    } catch (e) {
      return isoString
    }
  }

  const deleteTranscript = (index: number) => {
    const updatedTranscripts = [...transcripts]
    updatedTranscripts.splice(index, 1)
    setTranscripts(updatedTranscripts)
  }

  // Render Main Tab
  const renderMainTab = () => (
    <div className="main-tab">
      <div className="shortcut-info">
        <p>
          Press <span className="keyboard-shortcut">Ctrl+Q</span> to activate speech recognition when focused on a text
          field
        </p>
        {settings.customShortcutModifier && settings.customShortcutKey && (
          <p className="text-xs mt-2">
            Custom in-app shortcut:{" "}
            <span className="keyboard-shortcut">
              {settings.customShortcutModifier.charAt(0).toUpperCase() + settings.customShortcutModifier.slice(1)}+
              {settings.customShortcutKey.toUpperCase()}
            </span>
          </p>
        )}
      </div>

      <div className="buttons-container">
        <button className="tab-button" onClick={() => setActiveTab("settings")}>
          Settings
        </button>
        <button className="tab-button" onClick={() => setActiveTab("history")}>
          Transcript History
        </button>
      </div>

      <div className="engine-indicator">
        <div className="check-icon">✓</div>
        <span>
          {settings.engine === "browser"
            ? "Browser API (faster)"
            : settings.engine === "openai"
              ? "OpenAI API (more accurate)"
              : "Gemini 2.0 Flash (more accurate)"}
        </span>
      </div>

      <div className="version">Version 1.0.0</div>
    </div>
  )

  // Render Settings Tab
  const renderSettingsTab = () => (
    <div className="settings-tab">
      <h2>Speech to Text Assistant Settings</h2>

      <div className="settings-section">
        <h3>Choose Speech Recognition Engine:</h3>

        <div className="engine-options">
          <div
            className={`engine-option ${settings.engine === "browser" ? "selected" : ""}`}
            onClick={() => handleEngineChange("browser")}
          >
            <h4>Browser API</h4>
            <p>Fast and works offline. Good for most cases but may be less accurate.</p>
          </div>

          <div
            className={`engine-option ${settings.engine === "openai" ? "selected" : ""}`}
            onClick={() => handleEngineChange("openai")}
          >
            <h4>OpenAI API</h4>
            <p>More accurate but requires an API key and internet connection.</p>
          </div>

          <div
            className={`engine-option ${settings.engine === "gemini" ? "selected" : ""}`}
            onClick={() => handleEngineChange("gemini")}
          >
            <h4>Gemini 2.0 Flash API</h4>
            <p>Google's advanced AI for high-quality transcriptions.</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Keyboard Shortcut:</h3>

          <div className="shortcut-info">
            <p>
              Current shortcut: <span className="keyboard-shortcut">Ctrl+Q</span>
            </p>
            <p className="text-sm mt-2">
              To change this shortcut, click the button below to open Chrome's shortcuts page.
            </p>
            <button
              className="shortcut-button mt-3"
              onClick={() => {
                alert("In the actual extension, this would open Chrome's extensions shortcuts page")
              }}
            >
              Change Keyboard Shortcut
            </button>
          </div>

          <div className="custom-shortcuts mt-4">
            <h4 className="text-sm font-medium mb-2">Additional Custom Shortcuts:</h4>
            <div className="custom-shortcut-item">
              <label htmlFor="custom-shortcut" className="text-sm">
                Custom in-app shortcut:
              </label>
              <div className="flex gap-2 mt-1">
                <select
                  id="custom-shortcut-modifier"
                  className="shortcut-select"
                  value={settings.customShortcutModifier || "alt"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      customShortcutModifier: e.target.value as "ctrl" | "alt" | "shift",
                    })
                  }
                >
                  <option value="ctrl">Ctrl</option>
                  <option value="alt">Alt</option>
                  <option value="shift">Shift</option>
                </select>
                <span>+</span>
                <select
                  id="custom-shortcut-key"
                  className="shortcut-select"
                  value={settings.customShortcutKey || "s"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      customShortcutKey: e.target.value,
                    })
                  }
                >
                  {Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)).map((letter) => (
                    <option key={letter} value={letter}>
                      {letter.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This shortcut will work when the extension popup is open.
              </p>
            </div>
          </div>
        </div>

        {showApiKeySection && (
          <div className="api-key-section">
            <div className="api-instructions">
              <p>
                To use {settings.engine === "openai" ? "OpenAI's" : "Google's"} more accurate speech recognition, you
                need to provide your own API key.
              </p>

              <p>To get an API key:</p>
              <ol>
                <li>
                  Go to{" "}
                  {settings.engine === "openai" ? (
                    <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">
                      OpenAI Platform
                    </a>
                  ) : (
                    <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">
                      Google AI Studio
                    </a>
                  )}
                </li>
                <li>Sign up or log in to your account</li>
                <li>Navigate to the API keys section</li>
                <li>Create a new API key</li>
              </ol>
            </div>

            <div className="api-key-input">
              <label htmlFor="api-key">{settings.engine === "openai" ? "OpenAI" : "Gemini"} API Key:</label>
              <input
                type="password"
                id="api-key"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Enter your API key"
              />
            </div>
          </div>
        )}

        <button
          id="save-settings-button"
          className="save-button"
          onClick={() => {
            setSettings({
              ...settings,
              apiKey: apiKeyInput,
            })

            // Show success message
            const saveButton = document.getElementById("save-settings-button")
            if (saveButton) {
              const originalText = saveButton.textContent
              saveButton.textContent = "Saved!"
              saveButton.classList.add("success")

              setTimeout(() => {
                if (saveButton) {
                  saveButton.textContent = originalText
                  saveButton.classList.remove("success")
                }
              }, 2000)
            }
          }}
        >
          Save Settings
        </button>
      </div>

      <button className="back-button" onClick={() => setActiveTab("main")}>
        Back
      </button>
    </div>
  )

  // Render History Tab
  const renderHistoryTab = () => (
    <div className="history-tab">
      <div className="history-header">
        <h2>Transcript History</h2>
        <button
          className="clear-button"
          onClick={() => {
            if (confirm("Are you sure you want to clear all transcript history?")) {
              setTranscripts([])
            }
          }}
        >
          Clear History
        </button>
      </div>

      {transcripts.length === 0 ? (
        <div className="empty-history">
          <p>No transcripts yet. Use Ctrl+Q to start recording.</p>
        </div>
      ) : (
        <div className="transcripts-list">
          {transcripts.map((transcript, index) => (
            <div key={index} className="transcript-item">
              <p className="transcript-text">{transcript.text}</p>
              <div className="transcript-meta">
                <span className="transcript-date">{formatDate(transcript.timestamp)}</span>
                <span className="transcript-engine">{transcript.engine}</span>
              </div>
              <div className="transcript-actions">
                <button
                  className="copy-button"
                  onClick={() => {
                    navigator.clipboard.writeText(transcript.text).then(() => {
                      // Show success message
                      const notification = document.createElement("div")
                      notification.textContent = "Copied to clipboard!"
                      notification.className = "clipboard-notification"
                      document.body.appendChild(notification)

                      setTimeout(() => {
                        if (document.body.contains(notification)) {
                          document.body.removeChild(notification)
                        }
                      }, 2000)
                    })
                  }}
                >
                  Copy
                </button>
                <button className="delete-button" onClick={() => deleteTranscript(index)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="back-button" onClick={() => setActiveTab("main")}>
        Back
      </button>
    </div>
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col items-center">
        <h1 className="mb-4 text-2xl font-bold">Popup Preview</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          This is how the extension popup will appear to users. <br />
          <strong>Press Ctrl+Q</strong> to simulate the recording overlay!
        </p>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        <div className="popup-container w-[350px] h-[500px] border border-gray-300 rounded-lg shadow-lg overflow-hidden">
          {/* Popup Content */}
          <div className="popup flex flex-col h-full bg-[#f9fafb]">
            <header className="header p-4 border-b border-[#e5e7eb] bg-white flex items-center gap-2">
              <div className="logo flex items-center gap-2">
                <Mic className="w-6 h-6 text-[#6366f1]" />
                <h1 className="text-lg font-semibold text-[#111827]">SpeakWrite</h1>
              </div>
            </header>

            <main className="main flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
              {activeTab === "main" && <>{renderMainTab()}</>}

              {activeTab === "settings" && <>{renderSettingsTab()}</>}

              {activeTab === "history" && <>{renderHistoryTab()}</>}
            </main>
          </div>
        </div>

        {/* Transcript Display Area */}
        <div className="mt-6 w-full max-w-[500px]">
          <div className="transcript-display-area">
            <h2 className="text-lg font-semibold mb-2">Live Transcript</h2>
            <div className="transcript-box p-4 bg-white border border-gray-300 rounded-lg min-h-[100px] max-h-[200px] overflow-y-auto">
              {transcript ? (
                <p className="text-gray-800">{transcript}</p>
              ) : (
                <p className="text-gray-400 italic">No transcript yet. Press Ctrl+Q to start recording.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 mb-4">
          <div className="cursor-status-indicator">
            <span className="text-sm font-medium mr-2">Cursor status:</span>
            <span className={`status-badge ${isInInputField ? "status-input" : "status-no-input"}`}>
              {isInInputField ? "In text field" : "Not in text field"}
            </span>
            <button onClick={toggleInputFieldStatus} className="toggle-button ml-4">
              Toggle cursor position
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isInInputField
              ? "Text will be inserted at cursor position"
              : "In the actual extension, text would be copied to clipboard. In this preview, you'll need to click the copy button due to browser security."}
          </p>
        </div>

        {/* Recording Overlay */}
        {isOverlayVisible && (
          <div ref={overlayRef} className="recording-overlay">
            <div className="recording-indicator-dot"></div>
            <span>
              {isSpeaking ? (
                "Recording... Press ESC to stop"
              ) : (
                <span className="silence-message">
                  Silence detected...{" "}
                  <span className="silence-countdown">{Math.max(0, 4 - Math.floor(silenceTime))}s</span> until auto-stop
                </span>
              )}
            </span>
            <canvas ref={canvasRef} width="100" height="30" className="waveform-canvas"></canvas>

            {/* Silence progress bar */}
            <div className="silence-progress-container">
              <div ref={silenceIndicatorRef} className="silence-progress-bar"></div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Press Ctrl+Q anywhere on this page to see the recording overlay in action. <br />
            Recording will automatically stop after 4 seconds of silence, or press ESC to stop manually.
          </p>
        </div>
      </div>
    </div>
  )
}


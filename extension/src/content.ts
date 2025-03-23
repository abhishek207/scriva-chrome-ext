// Declare chrome variable for use in non-typescript environments
declare const chrome: any

// Global variables
let isRecording = false
let audioContext: AudioContext | null = null
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let overlayElement: HTMLElement | null = null
let waveformCanvas: HTMLCanvasElement | null = null
let analyser: AnalyserNode | null = null
let animationFrameId: number | null = null
let settings = {
  engine: "browser", // 'browser' or 'openai' or 'gemini'
  apiKey: "",
}

// Load settings from storage
chrome.storage.local.get(["settings"], (result) => {
  if (result.settings) {
    settings = result.settings
  }
})

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startRecording") {
    if (!isRecording) {
      startRecording()
    }
  } else if (message.action === "insertText") {
    insertTextAtCursor(message.text)
  } else if (message.action === "settingsUpdated") {
    // Reload settings
    chrome.storage.local.get(["settings"], (result) => {
      if (result.settings) {
        settings = result.settings
      }
    })
  }
  return true
})

// Create and show the overlay
function createOverlay() {
  // Remove existing overlay if any
  removeOverlay()

  // Create overlay container
  overlayElement = document.createElement("div")
  overlayElement.className = "speakwrite-overlay"
  overlayElement.style.position = "fixed"
  overlayElement.style.bottom = "30px"
  overlayElement.style.left = "50%"
  overlayElement.style.transform = "translateX(-50%)"
  overlayElement.style.backgroundColor = "rgba(99, 102, 241, 0.9)"
  overlayElement.style.color = "white"
  overlayElement.style.padding = "8px 16px"
  overlayElement.style.borderRadius = "24px"
  overlayElement.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"
  overlayElement.style.zIndex = "9999"
  overlayElement.style.display = "flex"
  overlayElement.style.alignItems = "center"
  overlayElement.style.justifyContent = "center"
  overlayElement.style.gap = "12px"
  overlayElement.style.minWidth = "200px"
  overlayElement.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  // Create recording indicator
  const recordingIndicator = document.createElement("div")
  recordingIndicator.style.width = "12px"
  recordingIndicator.style.height = "12px"
  recordingIndicator.style.backgroundColor = "#ef4444"
  recordingIndicator.style.borderRadius = "50%"
  recordingIndicator.style.animation = "speakwrite-pulse 1.5s infinite"

  // Add animation style
  const style = document.createElement("style")
  style.textContent = `
    @keyframes speakwrite-pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `
  document.head.appendChild(style)

  // Create text
  const text = document.createElement("span")
  text.textContent = "Recording... Press ESC to stop"
  text.style.fontSize = "14px"
  text.style.fontWeight = "500"

  // Create waveform canvas
  waveformCanvas = document.createElement("canvas")
  waveformCanvas.width = 100
  waveformCanvas.height = 30
  waveformCanvas.style.marginLeft = "8px"

  // Add elements to overlay
  overlayElement.appendChild(recordingIndicator)
  overlayElement.appendChild(text)
  overlayElement.appendChild(waveformCanvas)

  // Add overlay to body
  document.body.appendChild(overlayElement)
}

// Remove the overlay
function removeOverlay() {
  if (overlayElement && document.body.contains(overlayElement)) {
    document.body.removeChild(overlayElement)
    overlayElement = null
  }

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

// Draw waveform
function drawWaveform() {
  if (!analyser || !waveformCanvas) return

  const canvasCtx = waveformCanvas.getContext("2d")
  if (!canvasCtx) return

  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  function draw() {
    if (!analyser || !canvasCtx || !waveformCanvas) return

    animationFrameId = requestAnimationFrame(draw)
    analyser.getByteTimeDomainData(dataArray)

    canvasCtx.fillStyle = "rgba(99, 102, 241, 0.2)"
    canvasCtx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height)

    canvasCtx.lineWidth = 2
    canvasCtx.strokeStyle = "white"
    canvasCtx.beginPath()

    const sliceWidth = waveformCanvas.width / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const y = (v * waveformCanvas.height) / 2

      if (i === 0) {
        canvasCtx.moveTo(x, y)
      } else {
        canvasCtx.lineTo(x, y)
      }

      x += sliceWidth
    }

    canvasCtx.lineTo(waveformCanvas.width, waveformCanvas.height / 2)
    canvasCtx.stroke()
  }

  draw()
}

// Start recording
async function startRecording() {
  try {
    isRecording = true
    audioChunks = []

    // Create overlay
    createOverlay()

    // Get audio stream
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 44100,
      },
    })

    // Set up audio context and analyser for waveform
    audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(stream)
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)

    // Start drawing waveform
    drawWaveform()

    // Create media recorder with appropriate MIME type
    // Use a format that's compatible with OpenAI's requirements
    const mimeType = "audio/webm"

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      audioBitsPerSecond: 128000,
    })

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = async () => {
      // Show processing notification
      if (overlayElement) {
        overlayElement.innerHTML = ""
        const processingText = document.createElement("span")
        processingText.textContent = "Processing transcript..."
        processingText.style.fontSize = "14px"
        processingText.style.fontWeight = "500"
        overlayElement.appendChild(processingText)
      }

      // Process audio
      const audioBlob = new Blob(audioChunks, { type: mimeType })
      const transcript = await transcribeAudio(audioBlob)

      // Insert text at cursor
      insertTextAtCursor(transcript)

      // Save transcript to history
      chrome.runtime.sendMessage({
        action: "saveTranscript",
        text: transcript,
        engine: settings.engine === "browser" ? "Browser API" : settings.engine === "openai" ? "OpenAI" : "Gemini",
      })

      // Remove overlay
      removeOverlay()

      // Stop all tracks to release the microphone
      stream.getTracks().forEach((track) => track.stop())
    }

    mediaRecorder.start()

    // Listen for ESC key to stop recording
    const escKeyListener = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isRecording) {
        stopRecording()
        document.removeEventListener("keydown", escKeyListener)
      }
    }

    document.addEventListener("keydown", escKeyListener)
  } catch (err) {
    console.error("Error starting recording:", err)
    isRecording = false
    removeOverlay()

    // Show error notification
    const notification = document.createElement("div")
    notification.textContent = "Error accessing microphone"
    notification.style.position = "fixed"
    notification.style.top = "20px"
    notification.style.left = "50%"
    notification.style.transform = "translateX(-50%)"
    notification.style.padding = "10px 20px"
    notification.style.backgroundColor = "rgba(220, 38, 38, 0.9)"
    notification.style.color = "white"
    notification.style.borderRadius = "4px"
    notification.style.zIndex = "9999"

    document.body.appendChild(notification)

    // Remove the notification after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 3000)
  }
}

// Stop recording
function stopRecording() {
  if (mediaRecorder && isRecording) {
    mediaRecorder.stop()
    isRecording = false

    if (audioContext) {
      audioContext.close()
      audioContext = null
    }

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
}

// Transcribe audio
async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    // Get settings from storage
    const result = await new Promise<{ settings?: any }>((resolve) => {
      chrome.storage.local.get(["settings"], resolve)
    })

    const settings = result.settings || { engine: "browser", apiKey: "" }

    if (settings.engine === "browser") {
      // Simulate browser API transcription
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("This is a simulated transcription using the Browser API. It's fast but may be less accurate.")
        }, 1500)
      })
    } else {
      // Use API service for OpenAI or Gemini
      try {
        // In the actual extension, we would import the transcribeAudio function from api-service.ts
        // For this preview, we'll simulate the API call
        if (settings.engine === "openai") {
          if (!settings.apiKey) {
            throw new Error("OpenAI API key is required")
          }

          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 2000))
          return "This is a simulated transcription using OpenAI's GPT-4o transcribe model. In the actual extension, this would call the OpenAI API."
        } else if (settings.engine === "gemini") {
          if (!settings.apiKey) {
            throw new Error("Gemini API key is required")
          }

          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 2000))
          return "This is a simulated transcription using Google's Gemini 2.0 Flash API. In the actual extension, this would call the Gemini API."
        } else {
          throw new Error("Unsupported engine")
        }
      } catch (error) {
        console.error("API transcription error:", error)
        return `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      }
    }
  } catch (err) {
    console.error("Transcription error:", err)
    return `Error: ${err instanceof Error ? err.message : "Unknown error"}`
  }
}

// Function to insert text at the current cursor position
function insertTextAtCursor(text: string) {
  try {
    const activeElement = document.activeElement as HTMLElement

    // Check if the active element is an input or textarea
    if (
      activeElement &&
      (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA" || activeElement.isContentEditable)
    ) {
      if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
        // For standard input and textarea elements
        const inputElement = activeElement as HTMLInputElement | HTMLTextAreaElement
        const startPos = inputElement.selectionStart || 0
        const endPos = inputElement.selectionEnd || 0

        // Get the current value
        const currentValue = inputElement.value

        // Create the new value with the text inserted at the cursor position
        const newValue = currentValue.substring(0, startPos) + text + currentValue.substring(endPos)

        // Set the new value
        inputElement.value = newValue

        // Move the cursor to after the inserted text
        inputElement.selectionStart = inputElement.selectionEnd = startPos + text.length

        // Trigger input event to notify any listeners
        const event = new Event("input", { bubbles: true })
        inputElement.dispatchEvent(event)
      } else if (activeElement.isContentEditable) {
        // For contentEditable elements (like rich text editors)
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          // Get the current selection range
          const range = selection.getRangeAt(0)

          // Delete any selected text
          range.deleteContents()

          // Insert the new text
          const textNode = document.createTextNode(text)
          range.insertNode(textNode)

          // Move the cursor to after the inserted text
          range.setStartAfter(textNode)
          range.setEndAfter(textNode)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      }
    } else {
      // If no appropriate element is focused, show a notification
      const notification = document.createElement("div")
      notification.textContent = "Please click in a text field first"
      notification.style.position = "fixed"
      notification.style.top = "20px"
      notification.style.left = "50%"
      notification.style.transform = "translateX(-50%)"
      notification.style.padding = "10px 20px"
      notification.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
      notification.style.color = "white"
      notification.style.borderRadius = "4px"
      notification.style.zIndex = "9999"

      document.body.appendChild(notification)

      // Remove the notification after 3 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 3000)
    }
  } catch (err) {
    console.error("Error in insertTextAtCursor:", err instanceof Error ? err.message : "Unknown error")
    // Show error notification
    const errorNotification = document.createElement("div")
    errorNotification.textContent = "Error inserting text"
    errorNotification.style.position = "fixed"
    errorNotification.style.top = "20px"
    errorNotification.style.left = "50%"
    errorNotification.style.transform = "translateX(-50%)"
    errorNotification.style.padding = "10px 20px"
    errorNotification.style.backgroundColor = "rgba(220, 38, 38, 0.9)"
    errorNotification.style.color = "white"
    errorNotification.style.borderRadius = "4px"
    errorNotification.style.zIndex = "9999"

    document.body.appendChild(errorNotification)

    // Remove the notification after 3 seconds
    setTimeout(() => {
      if (document.body.contains(errorNotification)) {
        document.body.removeChild(errorNotification)
      }
    }, 3000)
  }
}


"use client"

import type React from "react"
import { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import "./popup.css"

// Declare chrome variable for use in non-typescript environments
declare const chrome: any

// Types
interface Transcript {
  text: string
  timestamp: string
  engine: string
}

interface Settings {
  engine: "browser" | "openai" | "gemini"
  apiKey: string
  customShortcutModifier?: "ctrl" | "alt" | "shift"
  customShortcutKey?: string
}

// Main Popup Component
const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"main" | "settings" | "history">("main")
  const [settings, setSettings] = useState<Settings>({
    engine: "browser",
    apiKey: "",
  })
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [apiKeyInput, setApiKeyInput] = useState("")
  const [showApiKeySection, setShowApiKeySection] = useState(false)

  // Load settings and transcripts on mount
  useEffect(() => {
    chrome.storage.local.get(["settings", "transcripts"], (result) => {
      if (result.settings) {
        setSettings(result.settings)
        setApiKeyInput(result.settings.apiKey || "")
        setShowApiKeySection(result.settings.engine === "openai" || result.settings.engine === "gemini")
      }

      if (result.transcripts) {
        setTranscripts(result.transcripts)
      }
    })

    // Set up custom shortcut listener
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey && settings.customShortcutModifier === "ctrl"
      const isAlt = e.altKey && settings.customShortcutModifier === "alt"
      const isShift = e.shiftKey && settings.customShortcutModifier === "shift"

      if ((isCtrl || isAlt || isShift) && e.key.toLowerCase() === settings.customShortcutKey) {
        // Start recording via message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "startRecording" })
            window.close() // Close the popup
          }
        })
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    // Clean up event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [settings])

  // Save settings
  const saveSettings = () => {
    // Validate API key if needed
    if ((settings.engine === "openai" || settings.engine === "gemini") && !apiKeyInput.trim()) {
      // Show error message
      const errorElement = document.createElement("div")
      errorElement.className = "error-message"
      errorElement.textContent = `${settings.engine === "openai" ? "OpenAI" : "Gemini"} API key is required`

      const saveButton = document.getElementById("save-settings-button")
      if (saveButton && saveButton.parentNode) {
        saveButton.parentNode.insertBefore(errorElement, saveButton)

        // Remove error after 3 seconds
        setTimeout(() => {
          if (errorElement.parentNode) {
            errorElement.parentNode.removeChild(errorElement)
          }
        }, 3000)
      }

      return
    }

    const updatedSettings = {
      ...settings,
      apiKey: apiKeyInput,
    }

    chrome.storage.local.set({ settings: updatedSettings }, () => {
      setSettings(updatedSettings)

      // Notify content script that settings have been updated
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "settingsUpdated" })
        }
      })

      // Show success message
      const saveButton = document.getElementById("save-settings-button")
      if (saveButton) {
        const originalText = saveButton.textContent
        saveButton.textContent = "Saved!"
        saveButton.classList.add("success")

        setTimeout(() => {
          saveButton.textContent = originalText
          saveButton.classList.remove("success")
        }, 2000)
      }
    })
  }

  // Clear transcript history
  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all transcript history?")) {
      chrome.storage.local.set({ transcripts: [] }, () => {
        setTranscripts([])
      })
    }
  }

  // Delete a single transcript
  const deleteTranscript = (index: number) => {
    const updatedTranscripts = [...transcripts]
    updatedTranscripts.splice(index, 1)

    chrome.storage.local.set({ transcripts: updatedTranscripts }, () => {
      setTranscripts(updatedTranscripts)
    })
  }

  // Copy transcript to clipboard
  const copyTranscript = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Show success message
      const notification = document.createElement("div")
      notification.textContent = "Copied to clipboard!"
      notification.className = "copy-notification"
      document.body.appendChild(notification)

      setTimeout(() => {
        document.body.removeChild(notification)
      }, 2000)
    })
  }

  // Format date
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    } catch (e) {
      return isoString
    }
  }

  // Handle engine change
  const handleEngineChange = (engine: "browser" | "openai" | "gemini") => {
    setSettings({
      ...settings,
      engine,
    })

    setShowApiKeySection(engine === "openai" || engine === "gemini")
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
              : "Gemini API (more accurate)"}
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
            <h4>Gemini API</h4>
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
                chrome.tabs.create({ url: "chrome://extensions/shortcuts" })
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

        <button id="save-settings-button" className="save-button" onClick={saveSettings}>
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
        <button className="clear-button" onClick={clearHistory}>
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
                <button className="copy-button" onClick={() => copyTranscript(transcript.text)}>
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

  // Render based on active tab
  return (
    <div className="popup">
      <header className="header">
        <div className="logo">
          <svg className="mic-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
          <h1>SpeakWrite</h1>
        </div>
      </header>

      <main className="main">
        {activeTab === "main" && renderMainTab()}
        {activeTab === "settings" && renderSettingsTab()}
        {activeTab === "history" && renderHistoryTab()}
      </main>
    </div>
  )
}

ReactDOM.render(<Popup />, document.getElementById("root"))


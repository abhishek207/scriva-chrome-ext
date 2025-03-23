// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "start-recording") {
    // Send message to active tab to start recording
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "startRecording" })
      }
    })
  }
})

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveTranscript") {
    // Save transcript to storage
    const transcript = {
      text: message.text,
      timestamp: new Date().toISOString(),
      engine: message.engine || "Browser API",
    }

    chrome.storage.local.get(["transcripts"], (result) => {
      const transcripts = result.transcripts || []
      transcripts.unshift(transcript)
      chrome.storage.local.set({ transcripts })
    })
  }

  return true
})


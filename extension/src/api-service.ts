// Types
interface TranscriptionOptions {
  engine: "browser" | "openai" | "gemini"
  apiKey?: string
}

// Function to convert audio blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
      const base64Data = base64String.split(",")[1]
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// OpenAI API integration
async function transcribeWithOpenAI(audioBlob: Blob, apiKey: string): Promise<string> {
  try {
    // Create form data
    const formData = new FormData()

    // Ensure we're using a supported file format with proper naming
    // OpenAI supports: mp3, mp4, mpeg, mpga, m4a, wav, and webm
    const fileName = `audio.${audioBlob.type.split("/")[1] || "webm"}`
    formData.append("file", audioBlob, fileName)
    formData.append("model", "gpt-4o-transcribe")
    formData.append("response_format", "text")

    // Make API request
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    // Get the transcription text
    const transcription = await response.text()
    return transcription
  } catch (error) {
    console.error("Error transcribing with OpenAI:", error)
    throw error
  }
}

// Gemini API integration - direct API approach for the extension
// Note: We can't use the SDK directly in the extension due to bundling constraints
async function transcribeWithGemini(audioBlob: Blob, apiKey: string): Promise<string> {
  try {
    // Convert audio to base64
    const base64Audio = await blobToBase64(audioBlob)

    // Prepare request payload with the transcription prompt
    const payload = {
      contents: [
        {
          parts: [
            {
              text: "Please transcribe the audio in this file. Return only the transcribed text without any additional commentary, explanations, or notes. Just the transcribed speech.",
            },
            {
              inline_data: {
                mime_type: audioBlob.type,
                data: base64Audio,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 16,
      },
    }

    // Make API request to Gemini using the updated model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`)
    }

    // Parse the response
    const data = await response.json()

    // Extract the transcription text
    const transcription = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    return transcription
  } catch (error) {
    console.error("Error transcribing with Gemini:", error)
    throw error
  }
}

// Main transcription function
export async function transcribeAudio(audioBlob: Blob, options: TranscriptionOptions): Promise<string> {
  try {
    if (options.engine === "openai") {
      if (!options.apiKey) {
        throw new Error("OpenAI API key is required")
      }
      return await transcribeWithOpenAI(audioBlob, options.apiKey)
    } else if (options.engine === "gemini") {
      if (!options.apiKey) {
        throw new Error("Gemini API key is required")
      }
      return await transcribeWithGemini(audioBlob, options.apiKey)
    } else {
      throw new Error("Unsupported engine")
    }
  } catch (error) {
    console.error("Transcription error:", error)
    throw error
  }
}


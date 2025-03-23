// Function to convert audio blob to base64
export async function blobToBase64(blob: Blob): Promise<string> {
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

// Function to convert audio blob to mp3 format (for OpenAI)
export async function convertToMp3(audioBlob: Blob): Promise<Blob> {
  // In a real implementation, we would use a library like ffmpeg.wasm
  // For this preview, we'll just return the original blob
  // as browser compatibility and implementation complexity would be significant

  // Simulate conversion delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return audioBlob
}

// OpenAI API integration
export async function transcribeWithOpenAI(audioBlob: Blob, apiKey: string): Promise<string> {
  try {
    // Create form data
    const formData = new FormData()

    // Ensure we're using a supported file format
    // OpenAI supports: mp3, mp4, mpeg, mpga, m4a, wav, and webm
    formData.append("file", audioBlob, "audio.webm")
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

// Gemini API integration using the official SDK
export async function transcribeWithGemini(audioBlob: Blob, apiKey: string): Promise<string> {
  try {
    // Import the Google Generative AI SDK dynamically
    // In a real extension, you would include this as a dependency
    const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = await import("@google/generative-ai")

    // Convert audio to base64
    const base64Audio = await blobToBase64(audioBlob)

    // Initialize the Google Generative AI with the API key
    const genAI = new GoogleGenerativeAI(apiKey)

    // Use the latest Gemini 2.0 Flash model
    const MODEL_NAME = "gemini-2.0-flash"

    // Generation config for better transcription results
    const generationConfig = {
      temperature: 0.1, // Lower temperature for more deterministic outputs
      topP: 0.8,
      topK: 16,
    }

    // Safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ]

    // Get the model with configuration
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig,
      safetySettings,
    })

    // Create a clear prompt for transcription
    const transcriptionPrompt =
      "Please transcribe the audio in this file. Return only the transcribed text without any additional commentary, explanations, or notes. Just the transcribed speech."

    // Use direct generateContent with a simple prompt
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: transcriptionPrompt },
            {
              inlineData: {
                mimeType: audioBlob.type,
                data: base64Audio,
              },
            },
          ],
        },
      ],
    })

    const response = await result.response
    const text = response.text()

    return text
  } catch (error) {
    console.error("Error transcribing with Gemini:", error)

    // If the error is due to the SDK not being available in the preview,
    // fall back to the direct API approach
    try {
      return await transcribeWithGeminiFallback(audioBlob, apiKey)
    } catch (fallbackError) {
      console.error("Fallback transcription also failed:", fallbackError)
      throw error
    }
  }
}

// Fallback method using direct API calls (for environments where the SDK isn't available)
async function transcribeWithGeminiFallback(audioBlob: Blob, apiKey: string): Promise<string> {
  try {
    // Convert audio to base64
    const base64Audio = await blobToBase64(audioBlob)

    // Prepare request payload
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
    console.error("Error in Gemini fallback transcription:", error)
    throw error
  }
}


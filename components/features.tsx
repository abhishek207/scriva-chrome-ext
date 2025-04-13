export function Features() {
  return (
    <section id="features" className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-secondary/10 px-3 py-1 text-sm text-primary shadow-sm">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Everything You Need for Voice Transcription
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Scriva Voice offers powerful features to make voice-to-text transcription seamless and efficient.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-stretch gap-6 py-12 lg:grid-cols-3">
          {/* Using grid with equal column widths and items-stretch to ensure equal height */}
          <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-white dark:bg-gray-800 h-full shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="rounded-full bg-secondary/30 p-3 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
            </div>
            <h3 className="text-xl font-bold">Unmatched Accuracy</h3>
            <p className="text-sm text-center text-muted-foreground">
              Powered by the most accurate speech-to-text technology available for precise transcription.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-white dark:bg-gray-800 h-full shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="rounded-full bg-secondary/30 p-3 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M18 8a6 6 0 0 0-6-6"></path>
                <path d="M6 8a6 6 0 0 1 6-6"></path>
                <circle cx="12" cy="8" r="7"></circle>
                <path d="M12 15v9"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold">Unlimited Usage</h3>
            <p className="text-sm text-center text-muted-foreground">
              No limits or restrictions - transcribe as much as you need at an affordable rate.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-white dark:bg-gray-800 h-full shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="rounded-full bg-secondary/30 p-3 shadow-inner">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold">Privacy-Focused</h3>
            <p className="text-sm text-center text-muted-foreground">
              All transcriptions are stored locally on your device with no data sent to external servers.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

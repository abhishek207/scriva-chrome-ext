export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-secondary/30 px-3 py-1 text-sm font-medium shadow-sm">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Simple to Use, Powerful Results</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Get started with Scriva Voice in just a few simple steps.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 border border-secondary/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md">
              1
            </div>
            <h3 className="text-xl font-bold">Install the Extension</h3>
            <p className="text-sm text-center text-muted-foreground">
              Download and install Scriva Voice from the Chrome Web Store.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 border border-secondary/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md">
              2
            </div>
            <h3 className="text-xl font-bold">Press Ctrl+Q</h3>
            <p className="text-sm text-center text-muted-foreground">
              Use the keyboard shortcut to start recording your voice.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 border border-secondary/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md">
              3
            </div>
            <h3 className="text-xl font-bold">Speak and Send</h3>
            <p className="text-sm text-center text-muted-foreground">
              Your speech is transcribed and inserted into any text field.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

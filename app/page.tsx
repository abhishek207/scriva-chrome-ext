import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mic, Download, Keyboard, History, Settings } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Mic className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SpeakWrite</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              How It Works
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:underline underline-offset-4">
              FAQ
            </Link>
            <Link href="/preview" className="text-sm font-medium hover:underline underline-offset-4">
              Preview
            </Link>
          </nav>
          <div>
            <Button asChild>
              <Link href="#download">
                Download <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Transform Speech to Text Instantly
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    SpeakWrite is a powerful Chrome extension that converts your speech to text and places it exactly
                    where your cursor is. Save time and boost productivity.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="#download">
                      Download Extension <Download className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/preview">Preview Popup</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto lg:mr-0 relative">
                <div className="relative w-[340px] h-[400px] rounded-xl border bg-background shadow-lg overflow-hidden">
                  <div className="p-4 border-b bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Mic className="h-5 w-5 text-primary" />
                      <span className="font-medium">SpeakWrite</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Press Ctrl+Q to activate</h3>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm">
                          Press <span className="px-2 py-1 bg-gray-100 border rounded text-xs font-mono">Ctrl+Q</span>{" "}
                          to activate speech recognition when focused on a text field
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Choose Your Engine</h3>
                      <div className="p-3 border rounded-md bg-green-50 border-green-200">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                            ✓
                          </div>
                          <p className="text-sm">OpenAI API (more accurate)</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button className="w-full">Settings</Button>
                      <Button className="w-full">History</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Powerful Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to convert speech to text efficiently
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Keyboard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Keyboard Shortcut</h3>
                <p className="text-center text-muted-foreground">
                  Activate speech recognition with a simple Ctrl+Q shortcut from anywhere in Chrome.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Multiple Engines</h3>
                <p className="text-center text-muted-foreground">
                  Choose between Browser API, OpenAI, or Google Gemini for transcription.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <History className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Transcript History</h3>
                <p className="text-center text-muted-foreground">
                  Access, copy, and manage your previous transcriptions easily.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Simple steps to convert your speech to text
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-4 mt-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">1</div>
                <h3 className="text-xl font-bold">Place Your Cursor</h3>
                <p className="text-center text-muted-foreground">
                  Click where you want the text to appear in any text field.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">2</div>
                <h3 className="text-xl font-bold">Press Ctrl+Q</h3>
                <p className="text-center text-muted-foreground">
                  Use the keyboard shortcut to activate speech recognition.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">3</div>
                <h3 className="text-xl font-bold">Speak Clearly</h3>
                <p className="text-center text-muted-foreground">
                  A floating overlay will appear. Speak your message clearly.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">4</div>
                <h3 className="text-xl font-bold">Press ESC</h3>
                <p className="text-center text-muted-foreground">
                  Press ESC to stop recording and the text will appear at your cursor.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="download" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Download SpeakWrite</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get started with SpeakWrite in just a few clicks
                </p>
              </div>
              <div className="space-y-4">
                <Button size="lg" asChild>
                  <a href="/speakwrite-extension.zip" download>
                    Download Extension <Download className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <div className="text-sm text-muted-foreground">Version 1.0.0 | Last updated: March 23, 2025</div>
              </div>
            </div>
            <div className="mx-auto max-w-3xl mt-12 space-y-4 rounded-lg border bg-card p-6 shadow">
              <h3 className="text-xl font-bold">Installation Instructions</h3>
              <ol className="space-y-4 ml-6 list-decimal">
                <li>
                  <p>Download the extension package using the button above</p>
                </li>
                <li>
                  <p>Unzip the downloaded file to a folder on your computer</p>
                </li>
                <li>
                  <p>
                    Open Chrome and navigate to{" "}
                    <code className="text-sm bg-muted p-1 rounded">chrome://extensions</code>
                  </p>
                </li>
                <li>
                  <p>Enable "Developer mode" by toggling the switch in the top-right corner</p>
                </li>
                <li>
                  <p>Click "Load unpacked" and select the unzipped folder</p>
                </li>
                <li>
                  <p>The SpeakWrite icon will appear in your Chrome toolbar</p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Frequently Asked Questions</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Common questions about SpeakWrite
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl mt-8 space-y-4">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-bold">What speech recognition engines are supported?</h3>
                <p className="mt-2 text-muted-foreground">
                  SpeakWrite supports three engines: Browser API (works offline), OpenAI API (high accuracy), and Google
                  Gemini API (advanced AI capabilities).
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-bold">Do I need an API key?</h3>
                <p className="mt-2 text-muted-foreground">
                  The Browser API works without any API key. For OpenAI or Gemini, you'll need to provide your own API
                  key in the settings.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-bold">Can I customize the keyboard shortcut?</h3>
                <p className="mt-2 text-muted-foreground">
                  Yes! You can customize the main keyboard shortcut (Ctrl+Q) by going to Chrome's extension shortcuts
                  settings at chrome://extensions/shortcuts. Additionally, you can set up custom in-app shortcuts in the
                  extension's settings panel.
                </p>
              </div>
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-bold">Is my speech data secure?</h3>
                <p className="mt-2 text-muted-foreground">
                  Yes, we take privacy seriously. When using the Browser API, your audio stays on your device. With
                  OpenAI or Gemini, data is sent securely to their servers for processing but is not stored permanently.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12 px-4 md:px-6">
          <div className="flex flex-col gap-2 md:gap-4 md:flex-1">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold">SpeakWrite</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transform speech to text instantly with our Chrome extension.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:flex-1">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="text-muted-foreground hover:underline">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#download" className="text-muted-foreground hover:underline">
                    Download
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Help</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#faq" className="text-muted-foreground hover:underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:underline">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:underline">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:underline">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 SpeakWrite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}


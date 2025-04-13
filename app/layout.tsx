import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"
import { DebugAuth } from "@/components/auth/debug-auth"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
})

export const metadata: Metadata = {
  title: "Scriva Voice - Speech-to-Text Chrome Extension",
  description: "Transform your voice into text with Scriva Voice, a powerful Chrome extension for voice transcription.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${plusJakartaSans.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <DebugAuth />
        </ThemeProvider>
        <Script
          id="media-recorder-polyfill"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && !window.MediaRecorder) {
                console.warn('MediaRecorder not supported in this browser. Some features may not work.');
              }
            `,
          }}
        />
      </body>
    </html>
  )
}


import './globals.css'
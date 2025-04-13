/**
 * Gets the site URL from environment variables or falls back to localhost in development
 */
export function getSiteUrl(): string {
  // For server-side code
  if (typeof window === "undefined") {
    // Use VERCEL_URL in production, or localhost in development
    const vercelUrl = process.env.VERCEL_URL
    if (vercelUrl) {
      return `https://${vercelUrl}`
    }
    return "http://localhost:3000"
  }

  // For client-side code
  return window.location.origin
}

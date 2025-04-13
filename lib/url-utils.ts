/**
 * Gets the site URL based on the environment
 */
export function getSiteUrl(): string {
  // For server-side code
  if (typeof window === "undefined") {
    // In production, use the actual deployed URL if available
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL
    }
    // Fallback to localhost for development
    return "http://localhost:3000"
  }

  // For client-side code, use the current origin
  return window.location.origin
}

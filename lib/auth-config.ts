/**
 * Auth configuration settings
 */

// Get the site URL based on the environment
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

// Get the callback URL for OAuth providers
export function getCallbackUrl(): string {
  return `${getSiteUrl()}/auth/callback`
}

// OAuth configuration guide
export const oauthConfigGuide = {
  google: {
    redirectUrls: [
      "https://qzdammtmzocjatkinbxe.supabase.co/auth/v1/callback",
      "https://scriva.vercel.app/auth/callback",
      "http://localhost:3000/auth/callback",
    ],
  },
}

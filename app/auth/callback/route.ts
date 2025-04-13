import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  // Get the base URL from the request
  const baseUrl = requestUrl.origin

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code)

      // Get the session to check if the user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Check if user has verified phone number and completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_phone_verified, has_completed_onboarding")
          .eq("id", session.user.id)
          .single()

        // Determine where to redirect based on user's profile status
        if (!profile?.is_phone_verified) {
          return NextResponse.redirect(`${baseUrl}/auth/phone-verification`)
        } else if (!profile?.has_completed_onboarding) {
          return NextResponse.redirect(`${baseUrl}/auth/onboarding`)
        } else {
          return NextResponse.redirect(`${baseUrl}/dashboard`)
        }
      }
    } catch (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(`${baseUrl}/auth/error`)
    }
  }

  // If no code or session, redirect to sign-in
  return NextResponse.redirect(`${baseUrl}/auth/sign-in`)
}

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
        // Check if user profile exists
        let { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        // If profile doesn't exist, create it
        if (!profile) {
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata.full_name || session.user.user_metadata.name,
              avatar_url: session.user.user_metadata.avatar_url || session.user.user_metadata.picture,
              subscription_tier: "free",
              // SIMPLIFIED: Mark as verified and onboarded by default
              is_phone_verified: true,
              has_completed_onboarding: true,
            })
            .select()
            .single()

          if (insertError) {
            console.error("Error creating profile:", insertError)
            return NextResponse.redirect(`${baseUrl}/auth/error`)
          }

          profile = newProfile
        } else {
          // Update existing profile to mark as verified and onboarded
          await supabase
            .from("profiles")
            .update({
              is_phone_verified: true,
              has_completed_onboarding: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", session.user.id)
        }

        // Redirect to dashboard
        return NextResponse.redirect(`${baseUrl}/dashboard`)
      }
    } catch (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(`${baseUrl}/auth/error`)
    }
  }

  // If no code or session, redirect to sign-in
  return NextResponse.redirect(`${baseUrl}/auth/sign-in`)
}

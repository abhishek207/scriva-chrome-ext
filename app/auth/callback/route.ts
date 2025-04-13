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
      const { data } = await supabase.auth.exchangeCodeForSession(code)

      if (data.user) {
        // Check if user has verified phone number
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_phone_verified, has_completed_onboarding")
          .eq("id", data.user.id)
          .single()

        if (!profile?.is_phone_verified) {
          return NextResponse.redirect(new URL("/auth/phone-verification", baseUrl))
        } else if (!profile?.has_completed_onboarding) {
          return NextResponse.redirect(new URL("/auth/onboarding", baseUrl))
        }
      }
    } catch (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(new URL("/auth/error", baseUrl))
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/dashboard", baseUrl))
}

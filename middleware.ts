import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname from the URL
  const path = req.nextUrl.pathname

  // If user is signed in
  if (session) {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_phone_verified, has_completed_onboarding")
      .eq("id", session.user.id)
      .single()

    // If on auth pages but should be redirected based on profile status
    if (path.startsWith("/auth") && path !== "/auth/callback") {
      if (!profile?.is_phone_verified && path !== "/auth/phone-verification") {
        return NextResponse.redirect(new URL("/auth/phone-verification", req.url))
      } else if (!profile?.has_completed_onboarding && path !== "/auth/onboarding" && profile?.is_phone_verified) {
        return NextResponse.redirect(new URL("/auth/onboarding", req.url))
      } else if (profile?.is_phone_verified && profile?.has_completed_onboarding) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // If trying to access protected routes without completing required steps
    if (path.startsWith("/dashboard")) {
      if (!profile?.is_phone_verified) {
        return NextResponse.redirect(new URL("/auth/phone-verification", req.url))
      } else if (!profile?.has_completed_onboarding) {
        return NextResponse.redirect(new URL("/auth/onboarding", req.url))
      }
    }
  }
  // If user is not signed in and trying to access protected routes
  else if (!session && !path.startsWith("/auth") && path !== "/" && !path.startsWith("/api")) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

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

  // If user is signed in and the current path is /auth/*, redirect to /dashboard
  if (session && path.startsWith("/auth")) {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_phone_verified, has_completed_onboarding")
      .eq("id", session.user.id)
      .single()

    // Determine where to redirect based on user's profile status
    let redirectPath = "/dashboard"

    if (!profile?.is_phone_verified && path !== "/auth/phone-verification") {
      redirectPath = "/auth/phone-verification"
    } else if (!profile?.has_completed_onboarding && path !== "/auth/onboarding") {
      redirectPath = "/auth/onboarding"
    } else if (path.startsWith("/auth")) {
      // Only redirect if they're on an auth page and have completed all steps
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
  }

  // If user is not signed in and the current path is not /auth/* or /, redirect to /auth/sign-in
  if (!session && !path.startsWith("/auth") && path !== "/") {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/auth/sign-in"
    redirectUrl.searchParams.set("redirectedFrom", path)
    return NextResponse.redirect(redirectUrl)
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
     * - / (home page)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
}

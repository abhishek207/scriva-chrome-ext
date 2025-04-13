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
    console.log("Middleware: User is authenticated", session.user.id)

    try {
      // Check if user has completed onboarding
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_phone_verified, has_completed_onboarding")
        .eq("id", session.user.id)
        .single()

      if (error) {
        console.error("Middleware: Error fetching profile", error)
        return res
      }

      console.log("Middleware: User profile", profile)

      // Handle redirects based on profile status
      if (profile) {
        // If on home page or auth pages but should be redirected based on profile status
        if (path === "/" || path.startsWith("/auth")) {
          if (path !== "/auth/callback") {
            if (!profile.is_phone_verified) {
              console.log("Middleware: Redirecting to phone verification")
              return NextResponse.redirect(new URL("/auth/phone-verification", req.url))
            } else if (!profile.has_completed_onboarding) {
              console.log("Middleware: Redirecting to onboarding")
              return NextResponse.redirect(new URL("/auth/onboarding", req.url))
            } else {
              console.log("Middleware: Redirecting to dashboard")
              return NextResponse.redirect(new URL("/dashboard", req.url))
            }
          }
        }

        // If trying to access protected routes without completing required steps
        if (path.startsWith("/dashboard")) {
          if (!profile.is_phone_verified) {
            console.log("Middleware: Redirecting to phone verification from dashboard")
            return NextResponse.redirect(new URL("/auth/phone-verification", req.url))
          } else if (!profile.has_completed_onboarding) {
            console.log("Middleware: Redirecting to onboarding from dashboard")
            return NextResponse.redirect(new URL("/auth/onboarding", req.url))
          }
        }
      }
    } catch (error) {
      console.error("Middleware: Unexpected error", error)
    }
  }
  // If user is not signed in and trying to access protected routes
  else if (!session && !path.startsWith("/auth") && path !== "/" && !path.startsWith("/api")) {
    console.log("Middleware: User not authenticated, redirecting to sign-in")
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

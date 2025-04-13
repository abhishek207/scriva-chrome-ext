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
    // SIMPLIFIED FLOW: If user is on auth pages or home page, redirect to dashboard
    if ((path === "/" || path.startsWith("/auth")) && path !== "/auth/callback") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }
  // If user is not signed in and trying to access protected routes
  else if (!session && path.startsWith("/dashboard")) {
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

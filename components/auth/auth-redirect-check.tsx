"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

export function AuthRedirectCheck() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Skip if we're already on the callback page
      if (pathname === "/auth/callback") {
        return
      }

      try {
        // Check if user is authenticated
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // SIMPLIFIED: If user is on auth pages or home page, redirect to dashboard
          if (pathname === "/" || (pathname.startsWith("/auth") && pathname !== "/auth/callback")) {
            router.push("/dashboard")
          }
        } else if (pathname.startsWith("/dashboard")) {
          // If not authenticated and trying to access dashboard, redirect to sign in
          router.push("/auth/sign-in")
        }
      } catch (error) {
        console.error("AuthRedirectCheck: Unexpected error", error)
      }
    }

    checkAuthAndRedirect()
  }, [pathname, router])

  return null
}

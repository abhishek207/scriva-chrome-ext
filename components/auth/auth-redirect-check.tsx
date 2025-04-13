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
          console.log("AuthRedirectCheck: User is authenticated", session.user.id)

          // Check user profile
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("is_phone_verified, has_completed_onboarding")
            .eq("id", session.user.id)
            .single()

          if (error) {
            console.error("AuthRedirectCheck: Error fetching profile", error)
            return
          }

          console.log("AuthRedirectCheck: User profile", profile)

          // Determine where to redirect based on profile status
          if (!profile.is_phone_verified && pathname !== "/auth/phone-verification") {
            console.log("AuthRedirectCheck: Redirecting to phone verification")
            router.push("/auth/phone-verification")
            return
          }

          if (profile.is_phone_verified && !profile.has_completed_onboarding && pathname !== "/auth/onboarding") {
            console.log("AuthRedirectCheck: Redirecting to onboarding")
            router.push("/auth/onboarding")
            return
          }

          if (
            profile.is_phone_verified &&
            profile.has_completed_onboarding &&
            (pathname === "/" || (pathname.startsWith("/auth") && pathname !== "/auth/callback"))
          ) {
            console.log("AuthRedirectCheck: Redirecting to dashboard")
            router.push("/dashboard")
            return
          }
        }
      } catch (error) {
        console.error("AuthRedirectCheck: Unexpected error", error)
      }
    }

    checkAuthAndRedirect()
  }, [pathname, router])

  return null
}

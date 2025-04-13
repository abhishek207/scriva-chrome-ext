import { OnboardingForm } from "@/components/auth/onboarding-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function OnboardingPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/sign-in")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // If user has already completed onboarding, redirect to dashboard
  if (profile?.has_completed_onboarding) {
    redirect("/dashboard")
  }

  // Extract first and last name from full_name if available
  let firstName = ""
  let lastName = ""

  if (profile?.full_name) {
    const nameParts = profile.full_name.split(" ")
    firstName = nameParts[0] || ""
    lastName = nameParts.slice(1).join(" ") || ""
  }

  const initialData = {
    firstName,
    lastName,
    email: session.user.email || "",
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Image
              src="/scriva_logo.png"
              alt="Scriva Voice Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>Tell us a bit more about yourself</CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm userId={session.user.id} initialData={initialData} />
        </CardContent>
      </Card>
    </div>
  )
}

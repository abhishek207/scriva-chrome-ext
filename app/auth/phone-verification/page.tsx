import { PhoneVerificationForm } from "@/components/auth/phone-verification-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function PhoneVerificationPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/sign-in")
  }

  // Check if user has already verified their phone
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_phone_verified")
    .eq("id", session.user.id)
    .single()

  // If phone is already verified, redirect to onboarding
  if (profile?.is_phone_verified) {
    redirect("/auth/onboarding")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
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
          <CardTitle className="text-2xl">Verify Your Phone</CardTitle>
          <CardDescription>Add your phone number for account security</CardDescription>
        </CardHeader>
        <CardContent>
          <PhoneVerificationForm userId={session.user.id} isRequired={true} />
        </CardContent>
      </Card>
    </div>
  )
}

import type React from "react"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/sign-in")
  }

  // Get profile data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // If profile doesn't exist, create a basic one
  if (!profile) {
    await supabase.from("profiles").insert({
      id: session.user.id,
      email: session.user.email!,
      full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || "User",
      subscription_tier: "free",
      is_phone_verified: true,
      has_completed_onboarding: true,
    })
  }

  const user = {
    id: session.user.id,
    email: session.user.email!,
    fullName: profile?.full_name || session.user.user_metadata.full_name || session.user.user_metadata.name || "User",
    avatarUrl: profile?.avatar_url || session.user.user_metadata.avatar_url || session.user.user_metadata.picture,
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 container py-6">{children}</main>
      </div>
    </div>
  )
}

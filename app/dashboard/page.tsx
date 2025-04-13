import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsageStats } from "@/components/user/usage-stats"
import { SubscriptionInfo } from "@/components/user/subscription-info"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get usage statistics
  const { data: usageData } = await supabase
    .from("usage_logs")
    .select("feature, count")
    .eq("user_id", session.user.id)
    .eq("feature", "transcription_minutes")
    .single()

  // Calculate transcription limits based on subscription tier
  const transcriptionLimits = {
    free: 50,
    plus: Number.POSITIVE_INFINITY,
    pro: Number.POSITIVE_INFINITY,
  }

  const transcriptionMinutes = usageData?.count || 0
  const transcriptionLimit = transcriptionLimits[profile?.subscription_tier as keyof typeof transcriptionLimits] || 50

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.full_name || "User"}!</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <UsageStats transcriptionMinutes={transcriptionMinutes} transcriptionLimit={transcriptionLimit} />
        <SubscriptionInfo
          tier={profile?.subscription_tier as "free" | "plus" | "pro"}
          status={profile?.subscription_status}
          endDate={profile?.subscription_end_date}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent transcription activity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity to display.</p>
        </CardContent>
      </Card>
    </div>
  )
}

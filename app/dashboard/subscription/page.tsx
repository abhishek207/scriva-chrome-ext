import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function SubscriptionPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", session.user.id)
    .single()

  const currentTier = profile?.subscription_tier || "free"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription plan</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {/* Free Plan */}
        <Card className={`flex flex-col border-2 ${currentTier === "free" ? "border-primary" : "border-muted"}`}>
          <CardHeader>
            <CardTitle className="text-xl">Free</CardTitle>
            <CardDescription>Get started with basic transcription</CardDescription>
            <div className="mt-4 flex items-baseline text-primary">
              <span className="text-4xl font-extrabold tracking-tight">$0</span>
              <span className="ml-1 text-sm font-medium text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 flex-1">
            <div className="space-y-2">
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Unlimited transcripts with browser API</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>50 minutes of premium model transcription</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Basic keyboard shortcuts</span>
              </div>
            </div>
          </CardContent>
          <div className="p-6 pt-0 mt-auto">
            <Button
              className="w-full"
              variant={currentTier === "free" ? "outline" : "default"}
              disabled={currentTier === "free"}
            >
              {currentTier === "free" ? "Current Plan" : "Downgrade"}
            </Button>
          </div>
        </Card>

        {/* Plus Plan */}
        <Card className={`flex flex-col border-2 ${currentTier === "plus" ? "border-primary" : "border-muted"}`}>
          <CardHeader>
            <CardTitle className="text-xl">Plus</CardTitle>
            <CardDescription>For users who need premium accuracy</CardDescription>
            <div className="mt-4 flex items-baseline text-primary">
              <span className="text-4xl font-extrabold tracking-tight">$3.99</span>
              <span className="ml-1 text-sm font-medium text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 flex-1">
            <div className="space-y-2">
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Unlimited premium model transcription</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>95% accuracy rate</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>All keyboard shortcuts</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Priority support</span>
              </div>
            </div>
          </CardContent>
          <div className="p-6 pt-0 mt-auto">
            <Button
              className="w-full"
              variant={currentTier === "plus" ? "outline" : "default"}
              disabled={currentTier === "plus"}
            >
              {currentTier === "plus" ? "Current Plan" : currentTier === "pro" ? "Downgrade" : "Upgrade"}
            </Button>
          </div>
        </Card>

        {/* Pro Plan */}
        <Card className={`flex flex-col border-2 ${currentTier === "pro" ? "border-primary" : "border-muted"}`}>
          <CardHeader>
            <CardTitle className="text-xl">Pro</CardTitle>
            <CardDescription>Advanced features for power users</CardDescription>
            <div className="mt-4 flex items-baseline text-primary">
              <span className="text-4xl font-extrabold tracking-tight">$9.99</span>
              <span className="ml-1 text-sm font-medium text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 flex-1">
            <div className="space-y-2">
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Real-time transcription with 100% accuracy</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Unlimited usage</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>External commands support</span>
              </div>
              <div className="flex items-center">
                <Check className="mr-2 h-4 w-4 text-primary" />
                <span>Voice notes without switching apps</span>
              </div>
            </div>
          </CardContent>
          <div className="p-6 pt-0 mt-auto">
            <Button
              className="w-full"
              variant={currentTier === "pro" ? "outline" : "default"}
              disabled={currentTier === "pro"}
            >
              {currentTier === "pro" ? "Current Plan" : "Upgrade"}
            </Button>
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            PayPal integration will be added soon. For now, please contact support to change your subscription.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

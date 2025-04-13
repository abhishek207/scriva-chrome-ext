"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface SubscriptionInfoProps {
  tier: "free" | "plus" | "pro"
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | null
  endDate: string | null
}

export function SubscriptionInfo({ tier, status, endDate }: SubscriptionInfoProps) {
  const router = useRouter()

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const getTierName = (tier: string) => {
    switch (tier) {
      case "free":
        return "Free"
      case "plus":
        return "Plus"
      case "pro":
        return "Pro"
      default:
        return "Unknown"
    }
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return null

    const variants: Record<string, { variant: "default" | "outline" | "secondary" | "destructive"; label: string }> = {
      active: { variant: "default", label: "Active" },
      trialing: { variant: "secondary", label: "Trial" },
      past_due: { variant: "destructive", label: "Past Due" },
      canceled: { variant: "outline", label: "Canceled" },
      incomplete: { variant: "outline", label: "Incomplete" },
    }

    const { variant, label } = variants[status] || { variant: "outline", label: status }

    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Subscription</CardTitle>
          {status && getStatusBadge(status)}
        </div>
        <CardDescription>Manage your subscription</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">Current Plan:</span>
          <span>{getTierName(tier)}</span>
        </div>
        {endDate && (
          <div className="flex justify-between items-center">
            <span className="font-medium">Renewal Date:</span>
            <span>{formatDate(endDate)}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant={tier === "free" ? "default" : "outline"}
          className="w-full"
          onClick={() => router.push("/dashboard/subscription")}
        >
          {tier === "free" ? "Upgrade Plan" : "Manage Subscription"}
        </Button>
      </CardFooter>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface UsageStatsProps {
  transcriptionMinutes: number
  transcriptionLimit: number
}

export function UsageStats({ transcriptionMinutes, transcriptionLimit }: UsageStatsProps) {
  const percentUsed = Math.min(100, Math.round((transcriptionMinutes / transcriptionLimit) * 100))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <CardDescription>Your current usage this month</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Transcription Minutes</span>
            <span className="text-sm">
              {transcriptionMinutes} / {transcriptionLimit}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${percentUsed}%` }}
              role="progressbar"
              aria-valuenow={percentUsed}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground">
            {percentUsed >= 80
              ? "You're approaching your limit. Consider upgrading your plan."
              : "You have plenty of transcription minutes left this month."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

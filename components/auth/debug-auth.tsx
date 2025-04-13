"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export function DebugAuth() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [profileInfo, setProfileInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSessionInfo(data)

      if (data.session?.user?.id) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single()

        setProfileInfo(profile)
      }
    }

    checkSession()
  }, [])

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button variant="outline" size="sm" onClick={() => setShowDebug(true)} className="opacity-50 hover:opacity-100">
          Debug Auth
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-background border rounded-lg shadow-lg max-w-md max-h-[80vh] overflow-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Auth Debug</h3>
        <Button variant="ghost" size="sm" onClick={() => setShowDebug(false)}>
          Close
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-1">Session:</h4>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="font-semibold mb-1">Profile:</h4>
          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(profileInfo, null, 2)}
          </pre>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = "/auth/sign-in"
            }}
          >
            Sign Out
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const { data } = await supabase.auth.getSession()
              setSessionInfo(data)

              if (data.session?.user?.id) {
                const { data: profile } = await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", data.session.user.id)
                  .single()

                setProfileInfo(profile)
              }
            }}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  )
}

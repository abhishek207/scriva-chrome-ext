"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ProfileFormProps {
  userId: string
  initialData?: {
    email: string
    fullName: string | null
    avatarUrl: string | null
  }
}

export function ProfileForm({ userId, initialData }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName || "")
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || "")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        throw error
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your profile.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={initialData?.email || ""} disabled />
        <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="full-name">Full Name</Label>
        <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatar-url">Avatar URL</Label>
        <Input
          id="avatar-url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.png"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Update Profile
      </Button>
    </form>
  )
}

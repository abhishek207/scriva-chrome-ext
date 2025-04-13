"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface PhoneVerificationFormProps {
  userId: string
  onSkip?: () => void
  isRequired?: boolean
}

export function PhoneVerificationForm({ userId, onSkip, isRequired = false }: PhoneVerificationFormProps) {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const router = useRouter()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      // Format phone number to E.164 format
      let formattedPhone = phone
      if (!phone.startsWith("+")) {
        formattedPhone = `+${phone}`
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) {
        setError(error.message)
        return
      }

      setOtpSent(true)
      setMessage("OTP sent to your phone. Please enter the code.")
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifying(true)
    setError(null)

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      })

      if (error) {
        setError(error.message)
        return
      }

      // Update the user's profile with the verified phone number
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          phone,
          is_phone_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.error("Error updating profile:", updateError)
        setError("Failed to update profile. Please try again.")
        return
      }

      setMessage("Phone verified successfully! Redirecting...")

      // Redirect to onboarding form after a short delay
      setTimeout(() => {
        router.push("/auth/onboarding")
        router.refresh()
      }, 1500)
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(err)
    } finally {
      setVerifying(false)
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else {
      router.push("/auth/onboarding")
    }
  }

  return (
    <div className="space-y-4 py-2 pb-4">
      {error && <div className="bg-red-50 text-red-500 px-4 py-2 rounded-md text-sm">{error}</div>}
      {message && <div className="bg-green-50 text-green-500 px-4 py-2 rounded-md text-sm">{message}</div>}

      {!otpSent ? (
        <form onSubmit={handleSendOTP}>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Enter your phone number with country code (e.g., +1 for US)</p>
          </div>
          <div className="flex gap-3 mt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send Verification Code
            </Button>
            {!isRequired && (
              <Button type="button" variant="outline" onClick={handleSkip}>
                Skip for now
              </Button>
            )}
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button type="submit" disabled={verifying} className="flex-1">
              {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verify
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOtpSent(false)
                setMessage(null)
              }}
            >
              Back
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

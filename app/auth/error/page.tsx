import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Image
              src="/logo.png"
              alt="Scriva Voice Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold">Scriva Voice</span>
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>There was a problem with the authentication process</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-center text-muted-foreground">
            We encountered an error while trying to authenticate you. Please try again or contact support if the problem
            persists.
          </p>
          <div className="flex gap-4">
            <Link href="/auth/sign-in">
              <Button variant="outline">Back to Sign In</Button>
            </Link>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

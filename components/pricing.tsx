"use client"

import { Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function Pricing() {
  return (
    <section id="pricing" className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-secondary/20 px-3 py-1 text-sm font-medium shadow-sm">
              Pricing
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Choose Your Plan</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Simple, transparent pricing to get you started with voice transcription.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
          {/* Free Plan */}
          <Card className="flex flex-col border-2 border-muted shadow-md transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] hover:border-secondary/30 hover:bg-secondary/5 dark:hover:bg-secondary/10">
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
            <CardFooter>
              <Button className="w-full shadow-sm transition-all duration-300 hover:shadow-md" variant="outline">
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* Plus Plan */}
          <Card className="flex flex-col border-2 border-primary relative shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] hover:border-primary/70 hover:bg-primary/5 dark:hover:bg-primary/10">
            <div className="absolute -top-3 left-0 right-0 mx-auto w-fit">
              <Badge className="bg-secondary hover:bg-secondary-dark text-secondary-foreground shadow-md">
                Popular
              </Badge>
            </div>
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
            <CardFooter>
              <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary-dark shadow-md transition-all duration-300 hover:shadow-lg">
                  Subscribe Now
                </Button>
              </a>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="flex flex-col border-2 border-muted bg-muted/30 relative shadow-md transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.02] hover:border-secondary/30 hover:bg-secondary/5 dark:hover:bg-secondary/10">
            <div className="absolute -top-3 left-0 right-0 mx-auto w-fit">
              <Badge variant="outline" className="border-secondary text-secondary-dark shadow-sm">
                Coming Soon
              </Badge>
            </div>
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
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 text-secondary-dark" />
                  <span className="text-muted-foreground">More features coming soon</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full shadow-sm transition-all duration-300 hover:shadow-md"
                variant="outline"
                disabled
              >
                Coming Soon
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}

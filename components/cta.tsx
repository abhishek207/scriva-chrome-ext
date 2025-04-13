import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-12 md:py-16 bg-secondary/10">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Transform How You Input Text?</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Download Scriva Voice today and experience the power of voice-to-text transcription.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-2 md:mt-4">
            <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer">
              <Button className="bg-primary hover:bg-primary-dark shadow-md hover:shadow-lg transition-shadow duration-300">
                Download Extension
              </Button>
            </a>
            <a href="#features">
              <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow duration-300">
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Scriva Voice Logo" width={24} height={24} className="w-6 h-6 object-contain" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Scriva Voice. All rights reserved.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="#" className="text-xs text-muted-foreground hover:underline">
            Privacy Policy
          </Link>
          <Link href="#" className="text-xs text-muted-foreground hover:underline">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs text-muted-foreground hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}

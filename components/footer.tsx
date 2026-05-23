import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">S</span>
              </div>
              <span className="text-lg font-semibold">Smart Citizen</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Empowering citizens to discover and access government schemes they are
              eligible for. A digital initiative for transparent governance.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/schemes" className="hover:text-foreground">
                  Browse Schemes
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="hover:text-foreground">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Smart Citizen Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

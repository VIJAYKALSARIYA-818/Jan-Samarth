"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import { Moon, Sun, Menu, X, LogOut, User, Settings } from "lucide-react"
import { useState } from "react"

interface DashboardHeaderProps {
  userName?: string | null
  userEmail?: string | null
}

export function DashboardHeader({ userName, userEmail }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail?.[0]?.toUpperCase() || "U"

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <span className="text-lg font-semibold">Smart Citizen</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/recommendations"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Recommendations
          </Link>
          <Link
            href="/dashboard/saved"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Saved Schemes
          </Link>
          <Link
            href="/schemes"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse All
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative size-8 rounded-full">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userName || "User"}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <User className="mr-2 size-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                <LogOut className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-background p-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/recommendations"
              className="text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Recommendations
            </Link>
            <Link
              href="/dashboard/saved"
              className="text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Saved Schemes
            </Link>
            <Link
              href="/schemes"
              className="text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse All
            </Link>
            <div className="border-t pt-4">
              <Button variant="destructive" onClick={handleLogout} className="w-full">
                <LogOut className="mr-2 size-4" />
                Log out
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

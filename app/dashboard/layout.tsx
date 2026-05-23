import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Check if onboarding is complete
  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userName={profile?.full_name} userEmail={user.email} />
      <main className="flex-1">{children}</main>
    </div>
  )
}

import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { SAMPLE_SCHEMES } from "@/lib/schemes-data"
import { sortSchemesByRelevance } from "@/lib/eligibility"
import { Scheme, Profile } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowRight,
  Bookmark,
  CheckCircle,
  FileText,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  // Fetch schemes
  let schemes: Scheme[] = []
  const { data: schemesData } = await supabase.from("schemes").select("*")

  if (schemesData && schemesData.length > 0) {
    schemes = schemesData
  } else {
    schemes = SAMPLE_SCHEMES.map((s, i) => ({
      ...s,
      id: `sample-${i}`,
      created_at: new Date().toISOString(),
    })) as Scheme[]
  }

  // Get recommended schemes
  const recommendedSchemes = profile
    ? sortSchemesByRelevance(profile as Profile, schemes).slice(0, 5)
    : []

  // Fetch saved schemes count
  const { count: savedCount } = await supabase
    .from("saved_schemes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)

  // Fetch checklist progress
  const { data: checklistData } = await supabase
    .from("checklist_items")
    .select("is_completed")
    .eq("user_id", user!.id)

  const totalChecklist = checklistData?.length || 0
  const completedChecklist = checklistData?.filter((c) => c.is_completed).length || 0
  const checklistProgress = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0

  // Profile completion
  const profileFields = [
    profile?.full_name,
    profile?.age,
    profile?.gender,
    profile?.state,
    profile?.category,
    profile?.education_level,
    profile?.annual_income,
  ]
  const filledFields = profileFields.filter(Boolean).length
  const profileProgress = (filledFields / profileFields.length) * 100

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name?.split(" ")[0] || "User"}!</h1>
        <p className="mt-2 text-muted-foreground">
          Here&apos;s an overview of your government scheme journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eligible Schemes</CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendedSchemes.length}</div>
            <p className="text-xs text-muted-foreground">Based on your profile</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saved Schemes</CardTitle>
            <Bookmark className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedCount || 0}</div>
            <p className="text-xs text-muted-foreground">In your bookmarks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedChecklist}/{totalChecklist}
            </div>
            <Progress value={checklistProgress} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(profileProgress)}%</div>
            <Progress value={profileProgress} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recommended Schemes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    Recommended for You
                  </CardTitle>
                  <CardDescription>
                    Schemes you may be eligible for based on your profile
                  </CardDescription>
                </div>
                <Link href="/dashboard/recommendations">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recommendedSchemes.length > 0 ? (
                <div className="space-y-4">
                  {recommendedSchemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      className="flex items-start justify-between gap-4 rounded-lg border p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {scheme.category}
                          </Badge>
                        </div>
                        <h4 className="font-medium">{scheme.name}</h4>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {scheme.benefits}
                        </p>
                      </div>
                      <Link href={`/schemes?highlight=${scheme.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Complete your profile to get personalized recommendations.</p>
                  <Link href="/dashboard/profile">
                    <Button variant="link">Update Profile</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary & Quick Actions */}
        <div className="space-y-6">
          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{profile?.profile_type?.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">State</span>
                <span className="font-medium">{profile?.state || "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium uppercase">{profile?.category || "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Income</span>
                <span className="font-medium">
                  {profile?.annual_income
                    ? `Rs. ${(profile.annual_income / 100000).toFixed(1)}L`
                    : "-"}
                </span>
              </div>
              <Link href="/dashboard/profile" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/recommendations" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Sparkles className="size-4" />
                  View Recommendations
                </Button>
              </Link>
              <Link href="/dashboard/saved" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Bookmark className="size-4" />
                  Saved Schemes
                </Button>
              </Link>
              <Link href="/schemes" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <CheckCircle className="size-4" />
                  Browse All Schemes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { SAMPLE_SCHEMES } from "@/lib/schemes-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
  Users,
  FileText,
  Bookmark,
  TrendingUp,
  ArrowLeft,
  Database,
} from "lucide-react"

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export default async function AdminPage() {
  const supabase = await createClient()

  // Fetch stats
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: schemeCount } = await supabase
    .from("schemes")
    .select("*", { count: "exact", head: true })

  const { count: savedCount } = await supabase
    .from("saved_schemes")
    .select("*", { count: "exact", head: true })

  const { count: checklistCount } = await supabase
    .from("checklist_items")
    .select("*", { count: "exact", head: true })

  // Fetch profile type distribution
  const { data: profileTypes } = await supabase
    .from("profiles")
    .select("profile_type")

  const profileTypeDistribution = profileTypes?.reduce(
    (acc, profile) => {
      const type = profile.profile_type || "general"
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const profileChartData = Object.entries(profileTypeDistribution || {}).map(
    ([name, value]) => ({
      name: name.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value,
    })
  )

  // Fetch category distribution
  const { data: categoryData } = await supabase
    .from("profiles")
    .select("category")

  const categoryDistribution = categoryData?.reduce(
    (acc, profile) => {
      const cat = profile.category?.toUpperCase() || "General"
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const categoryChartData = Object.entries(categoryDistribution || {}).map(
    ([name, value]) => ({ name, value })
  )

  // Fetch most saved schemes
  const { data: popularSchemes } = await supabase
    .from("saved_schemes")
    .select("scheme_id, schemes(name, category)")
    .limit(100)

  const schemePopularity = popularSchemes?.reduce(
    (acc, item) => {
      const schemeId = item.scheme_id
      if (!acc[schemeId]) {
        acc[schemeId] = {
          name: (item.schemes as { name: string; category: string })?.name || "Unknown",
          category: (item.schemes as { name: string; category: string })?.category || "General",
          count: 0,
        }
      }
      acc[schemeId].count++
      return acc
    },
    {} as Record<string, { name: string; category: string; count: number }>
  )

  const topSchemes = Object.values(schemePopularity || {})
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Fallback if no data
  const hasData = (userCount || 0) > 0

  const chartConfig = {
    value: {
      label: "Count",
      color: "var(--chart-1)",
    },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="size-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">S</span>
              </div>
              <span className="text-lg font-semibold">Admin Dashboard</span>
            </div>
          </div>
          <Badge variant="secondary">Admin</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Overview</h1>
          <p className="mt-2 text-muted-foreground">
            Monitor platform usage and user engagement
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCount || 0}</div>
              <p className="text-xs text-muted-foreground">Registered citizens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Schemes</CardTitle>
              <FileText className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schemeCount || SAMPLE_SCHEMES.length}</div>
              <p className="text-xs text-muted-foreground">Available schemes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
              <Bookmark className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{savedCount || 0}</div>
              <p className="text-xs text-muted-foreground">Schemes saved by users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Checklist Items</CardTitle>
              <TrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checklistCount || 0}</div>
              <p className="text-xs text-muted-foreground">Document tracking entries</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* User Profile Types */}
          <Card>
            <CardHeader>
              <CardTitle>User Profile Types</CardTitle>
              <CardDescription>Distribution of users by profile type</CardDescription>
            </CardHeader>
            <CardContent>
              {hasData && profileChartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profileChartData}>
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="var(--color-chart-1)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Database className="mx-auto size-12 opacity-50" />
                    <p className="mt-2">No user data yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Users by reservation category</CardDescription>
            </CardHeader>
            <CardContent>
              {hasData && categoryChartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {categoryChartData.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Database className="mx-auto size-12 opacity-50" />
                    <p className="mt-2">No category data yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Schemes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Schemes</CardTitle>
            <CardDescription>Schemes with the most bookmarks</CardDescription>
          </CardHeader>
          <CardContent>
            {topSchemes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Scheme Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Bookmarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSchemes.map((scheme, index) => (
                    <TableRow key={scheme.name}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell>{scheme.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{scheme.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{scheme.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No bookmark data yet. Users will start saving schemes soon!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database Setup Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Database Setup</CardTitle>
            <CardDescription>
              If tables are not set up, use the setup endpoint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <form action="/api/setup-db" method="POST">
                <Button type="submit" variant="outline">
                  <Database className="mr-2 size-4" />
                  Setup Database Tables
                </Button>
              </form>
              <form action="/api/seed-schemes" method="POST">
                <Button type="submit" variant="outline">
                  <FileText className="mr-2 size-4" />
                  Seed Sample Schemes
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

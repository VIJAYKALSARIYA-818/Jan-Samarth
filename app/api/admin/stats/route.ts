import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    // Get total schemes
    const { count: totalSchemes } = await supabase
      .from("schemes")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)

    // Get total saved schemes
    const { count: totalSaved } = await supabase
      .from("saved_schemes")
      .select("*", { count: "exact", head: true })

    // Get most saved schemes
    const { data: mostSaved } = await supabase
      .from("saved_schemes")
      .select("scheme_id, schemes(name, category)")
      .order("created_at", { ascending: false })
      .limit(100)

    const schemeStats: Record<string, number> = {}
    mostSaved?.forEach((item: any) => {
      const schemeName = item.schemes?.name || "Unknown"
      schemeStats[schemeName] = (schemeStats[schemeName] || 0) + 1
    })

    const mostSavedSchemes = Object.entries(schemeStats)
      .map(([name, count]) => ({
        name,
        saves: count,
      }))
      .sort((a, b) => b.saves - a.saves)
      .slice(0, 10)

    // Get user registrations by category
    const { data: usersByCategory } = await supabase
      .from("profiles")
      .select("profile_type")

    const categoryStats: Record<string, number> = {}
    usersByCategory?.forEach((profile: any) => {
      const type = profile.profile_type || "general"
      categoryStats[type] = (categoryStats[type] || 0) + 1
    })

    const usersByType = Object.entries(categoryStats).map(([name, count]) => ({
      name,
      users: count,
    }))

    // Get income distribution
    const { data: incomeData } = await supabase
      .from("profiles")
      .select("annual_income")

    const incomeRanges: Record<string, number> = {
      "Below 3L": 0,
      "3L - 5L": 0,
      "5L - 10L": 0,
      "10L - 20L": 0,
      "Above 20L": 0,
    }

    incomeData?.forEach((profile: any) => {
      if (!profile.annual_income) return
      const income = profile.annual_income
      if (income < 300000) incomeRanges["Below 3L"]++
      else if (income < 500000) incomeRanges["3L - 5L"]++
      else if (income < 1000000) incomeRanges["5L - 10L"]++
      else if (income < 2000000) incomeRanges["10L - 20L"]++
      else incomeRanges["Above 20L"]++
    })

    const incomeDistribution = Object.entries(incomeRanges).map(([range, count]) => ({
      range,
      count,
    }))

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalSchemes: totalSchemes || 0,
      totalSaved: totalSaved || 0,
      mostSavedSchemes,
      usersByType,
      incomeDistribution,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}

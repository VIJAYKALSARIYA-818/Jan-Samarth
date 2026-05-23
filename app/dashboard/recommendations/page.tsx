"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { SchemeList } from "@/components/scheme-list"
import { sortSchemesByRelevance } from "@/lib/eligibility"
import { Scheme, Profile } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles } from "lucide-react"

export default function RecommendationsPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    // Fetch all schemes
    const { data: schemesData } = await supabase.from("schemes").select("*")

    if (schemesData && profile) {
      const recommended = sortSchemesByRelevance(profile as Profile, schemesData)
      setSchemes(recommended)
    }

    // Fetch saved schemes
    const { data: savedData } = await supabase
      .from("saved_schemes")
      .select("scheme_id")
      .eq("user_id", user.id)

    if (savedData) {
      setSavedSchemeIds(savedData.map((s) => s.scheme_id))
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveScheme = async (schemeId: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("saved_schemes").insert({
      user_id: user.id,
      scheme_id: schemeId,
    })

    if (!error) {
      setSavedSchemeIds((prev) => [...prev, schemeId])
    }
  }

  const handleUnsaveScheme = async (schemeId: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("saved_schemes")
      .delete()
      .eq("user_id", user.id)
      .eq("scheme_id", schemeId)

    if (!error) {
      setSavedSchemeIds((prev) => prev.filter((id) => id !== schemeId))
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="mb-8 h-6 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Sparkles className="size-8 text-primary" />
          Recommended Schemes
        </h1>
        <p className="mt-2 text-muted-foreground">
          Schemes personalized for you based on your profile - sorted by relevance
        </p>
      </div>
      <SchemeList
        schemes={schemes}
        savedSchemeIds={savedSchemeIds}
        onSaveScheme={handleSaveScheme}
        onUnsaveScheme={handleUnsaveScheme}
        showEligibility
        isLoggedIn
      />
    </div>
  )
}

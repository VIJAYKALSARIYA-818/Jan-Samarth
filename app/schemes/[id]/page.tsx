"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ExternalLink, Heart, Bookmark, Check } from "lucide-react"
import { toast } from "sonner"
import { saveScheme, removeSavedScheme, getSavedSchemes } from "@/lib/api"
import type { Scheme } from "@/lib/types"

export default function SchemeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const schemeId = params.id as string

  const [scheme, setScheme] = useState<any>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [savedSchemeId, setSavedSchemeId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadScheme = async () => {
      try {
        const response = await fetch(`/api/schemes?search=${schemeId}`)
        const schemes = await response.json()
        const found = schemes.find((s: any) => s.id === schemeId)
        if (found) {
          setScheme(found)
        }

        // Check if already saved
        const saved = await getSavedSchemes()
        const foundSaved = saved.find((s: any) => s.scheme_id === schemeId)
        if (foundSaved) {
          setIsSaved(true)
          setSavedSchemeId(foundSaved.id)
        }
      } catch (error) {
        console.error("Error loading scheme:", error)
        toast.error("Failed to load scheme")
      } finally {
        setLoading(false)
      }
    }

    loadScheme()
  }, [schemeId])

  const handleSaveScheme = async () => {
    try {
      await saveScheme(schemeId, "saved")
      setIsSaved(true)
      toast.success("Scheme saved to your collection")
    } catch (error) {
      toast.error("Failed to save scheme")
    }
  }

  const handleRemoveSavedScheme = async () => {
    if (!savedSchemeId) return

    try {
      await removeSavedScheme(savedSchemeId)
      setIsSaved(false)
      setSavedSchemeId(null)
      toast.success("Scheme removed from your collection")
    } catch (error) {
      toast.error("Failed to remove scheme")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="space-y-4">
            <div className="h-8 w-1/3 rounded bg-muted animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-8"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Scheme not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                      {scheme.name}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {scheme.ministry}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-4">
                    {scheme.category}
                  </Badge>
                </div>
                <p className="text-base leading-relaxed text-foreground">
                  {scheme.description}
                </p>
              </div>

              <Separator />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">
                    {scheme.benefits}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Eligibility Criteria</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scheme.eligibility_criteria && (
                    <div className="space-y-2 text-sm">
                      {scheme.eligibility_criteria.age_min && (
                        <div className="flex justify-between">
                          <span className="font-medium">Minimum Age:</span>
                          <span>{scheme.eligibility_criteria.age_min} years</span>
                        </div>
                      )}
                      {scheme.eligibility_criteria.age_max && (
                        <div className="flex justify-between">
                          <span className="font-medium">Maximum Age:</span>
                          <span>{scheme.eligibility_criteria.age_max} years</span>
                        </div>
                      )}
                      {scheme.eligibility_criteria.income_max && (
                        <div className="flex justify-between">
                          <span className="font-medium">Income Limit:</span>
                          <span>
                            ₹{(scheme.eligibility_criteria.income_max / 100000).toFixed(1)}L
                          </span>
                        </div>
                      )}
                      {scheme.eligibility_criteria.categories &&
                        scheme.eligibility_criteria.categories.length > 0 && (
                          <div>
                            <p className="font-medium mb-2">Categories:</p>
                            <div className="flex flex-wrap gap-2">
                              {scheme.eligibility_criteria.categories.map(
                                (cat: string) => (
                                  <Badge key={cat} variant="secondary">
                                    {cat}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {scheme.documents_required && scheme.documents_required.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Documents Required</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {scheme.documents_required.map(
                        (doc: string, idx: number) => (
                          <li key={idx} className="flex items-center text-sm">
                            <Check className="h-4 w-4 mr-2 text-primary" />
                            {doc}
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isSaved ? (
                  <>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleRemoveSavedScheme}
                    >
                      <Bookmark className="mr-2 h-4 w-4 fill-current" />
                      Remove from Saved
                    </Button>
                    <Link href="/dashboard/saved" className="block">
                      <Button className="w-full" variant="secondary">
                        View in Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button
                    className="w-full"
                    onClick={handleSaveScheme}
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    Save Scheme
                  </Button>
                )}

                {scheme.apply_link && (
                  <a href={scheme.apply_link} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full" variant="secondary">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Apply on Official Site
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Ministry</p>
                  <p className="text-foreground">{scheme.ministry}</p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-muted-foreground">Category</p>
                  <Badge>{scheme.category}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

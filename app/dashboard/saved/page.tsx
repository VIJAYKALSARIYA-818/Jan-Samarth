"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Scheme, ChecklistItem } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Bookmark,
  BookmarkX,
  ExternalLink,
  FileText,
  Trash2,
} from "lucide-react"

interface SavedSchemeWithDetails {
  id: string
  scheme_id: string
  created_at: string
  scheme: Scheme
}

export default function SavedSchemesPage() {
  const [savedSchemes, setSavedSchemes] = useState<SavedSchemeWithDetails[]>([])
  const [checklistItems, setChecklistItems] = useState<Record<string, ChecklistItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null)

  const loadData = useCallback(async () => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    // Fetch saved schemes with scheme details
    const { data: savedData } = await supabase
      .from("saved_schemes")
      .select("*, scheme:schemes(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (savedData) {
      setSavedSchemes(savedData as unknown as SavedSchemeWithDetails[])
    }

    // Fetch checklist items
    const { data: checklistData } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("user_id", user.id)

    if (checklistData) {
      const grouped: Record<string, ChecklistItem[]> = {}
      checklistData.forEach((item) => {
        if (!grouped[item.scheme_id]) {
          grouped[item.scheme_id] = []
        }
        grouped[item.scheme_id].push(item)
      })
      setChecklistItems(grouped)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUnsave = async (schemeId: string) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from("saved_schemes")
      .delete()
      .eq("user_id", user.id)
      .eq("scheme_id", schemeId)

    setSavedSchemes((prev) => prev.filter((s) => s.scheme_id !== schemeId))
  }

  const handleInitChecklist = async (scheme: Scheme) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !scheme.documents_required) return

    const items = scheme.documents_required.map((doc) => ({
      user_id: user.id,
      scheme_id: scheme.id,
      document_name: doc,
      is_completed: false,
    }))

    await supabase.from("checklist_items").upsert(items, {
      onConflict: "user_id,scheme_id,document_name",
    })

    loadData()
  }

  const handleToggleChecklistItem = async (itemId: string, isCompleted: boolean) => {
    const supabase = createClient()

    await supabase
      .from("checklist_items")
      .update({ is_completed: !isCompleted })
      .eq("id", itemId)

    setChecklistItems((prev) => {
      const updated = { ...prev }
      Object.keys(updated).forEach((schemeId) => {
        updated[schemeId] = updated[schemeId].map((item) =>
          item.id === itemId ? { ...item, is_completed: !isCompleted } : item
        )
      })
      return updated
    })
  }

  const getChecklistProgress = (schemeId: string) => {
    const items = checklistItems[schemeId] || []
    if (items.length === 0) return 0
    return (items.filter((i) => i.is_completed).length / items.length) * 100
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="mb-8 h-6 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Bookmark className="size-8 text-primary" />
          Saved Schemes
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your saved schemes and manage your document checklists
        </p>
      </div>

      {savedSchemes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookmarkX className="mx-auto size-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No saved schemes yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse schemes and save the ones you&apos;re interested in
            </p>
            <Button className="mt-4" asChild>
              <a href="/schemes">Browse Schemes</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedSchemes.map(({ scheme_id, scheme }) => {
            const progress = getChecklistProgress(scheme_id)
            const hasChecklist = checklistItems[scheme_id]?.length > 0

            return (
              <Card key={scheme_id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary">{scheme.category}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive"
                      onClick={() => handleUnsave(scheme_id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <CardTitle className="line-clamp-2 text-base">{scheme.name}</CardTitle>
                  <CardDescription className="text-xs">{scheme.ministry}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {scheme.benefits}
                  </p>

                  {hasChecklist ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <FileText className="size-3" />
                          Document Checklist
                        </span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleInitChecklist(scheme)}
                    >
                      <FileText className="mr-2 size-4" />
                      Start Checklist
                    </Button>
                  )}
                </CardContent>
                <div className="flex gap-2 border-t p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedScheme(scheme)}
                  >
                    Details
                  </Button>
                  {scheme.application_url && (
                    <a
                      href={scheme.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="gap-1">
                        Apply
                        <ExternalLink className="size-3" />
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Scheme Detail Dialog with Checklist */}
      <Dialog open={!!selectedScheme} onOpenChange={() => setSelectedScheme(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selectedScheme && (
            <>
              <DialogHeader>
                <Badge variant="outline" className="w-fit">
                  {selectedScheme.category}
                </Badge>
                <DialogTitle>{selectedScheme.name}</DialogTitle>
                <DialogDescription>{selectedScheme.ministry}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Benefits</h4>
                  <p className="text-sm text-muted-foreground">{selectedScheme.benefits}</p>
                </div>

                {checklistItems[selectedScheme.id]?.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-medium">Document Checklist</h4>
                    <div className="space-y-2">
                      {checklistItems[selectedScheme.id].map((item) => (
                        <label
                          key={item.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                        >
                          <Checkbox
                            checked={item.is_completed}
                            onCheckedChange={() =>
                              handleToggleChecklistItem(item.id, item.is_completed)
                            }
                          />
                          <span
                            className={`text-sm ${item.is_completed ? "text-muted-foreground line-through" : ""}`}
                          >
                            {item.document_name}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3">
                      <Progress
                        value={getChecklistProgress(selectedScheme.id)}
                        className="h-2"
                      />
                      <p className="mt-1 text-center text-xs text-muted-foreground">
                        {Math.round(getChecklistProgress(selectedScheme.id))}% complete
                      </p>
                    </div>
                  </div>
                )}

                {selectedScheme.application_url && (
                  <a
                    href={selectedScheme.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full gap-2">
                      Apply Now
                      <ExternalLink className="size-4" />
                    </Button>
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

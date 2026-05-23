"use client"

import { useState } from "react"
import Link from "next/link"
import { Scheme } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  ExternalLink,
  CheckCircle,
  Bookmark,
  BookmarkCheck,
  Filter,
} from "lucide-react"

interface SchemeListProps {
  schemes: Scheme[]
  savedSchemeIds?: string[]
  onSaveScheme?: (schemeId: string) => Promise<void>
  onUnsaveScheme?: (schemeId: string) => Promise<void>
  showEligibility?: boolean
  isLoggedIn?: boolean
}

const getCardColor = (category: string | null) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    Agriculture: { bg: "bg-green-500/10", text: "text-green-600", border: "border-green-500/30" },
    Education: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/30" },
    Healthcare: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/30" },
    Business: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/30" },
    Housing: { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/30" },
    Employment: { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/30" },
    Savings: { bg: "bg-pink-500/10", text: "text-pink-600", border: "border-pink-500/30" },
    Pension: { bg: "bg-teal-500/10", text: "text-teal-600", border: "border-teal-500/30" },
    Skills: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/30" },
  }
  return colors[category || ""] || { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" }
}

export function SchemeList({
  schemes,
  savedSchemeIds = [],
  onSaveScheme,
  onUnsaveScheme,
  showEligibility = false,
  isLoggedIn = false,
}: SchemeListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null)
  const [savingScheme, setSavingScheme] = useState<string | null>(null)

  // Get unique categories
  const categories = Array.from(new Set(schemes.map((s) => s.category).filter(Boolean))) as string[]

  // Filter schemes
  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.ministry?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || scheme.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleSaveToggle = async (scheme: Scheme) => {
    if (!isLoggedIn) return

    setSavingScheme(scheme.id)
    try {
      if (savedSchemeIds.includes(scheme.id)) {
        await onUnsaveScheme?.(scheme.id)
      } else {
        await onSaveScheme?.(scheme.id)
      }
    } finally {
      setSavingScheme(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search schemes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 size-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredSchemes.length} of {schemes.length} schemes
        {showEligibility && " you may be eligible for"}
      </p>

      {/* Scheme Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSchemes.map((scheme) => {
          const colors = getCardColor(scheme.category)
          const isSaved = savedSchemeIds.includes(scheme.id)

          return (
            <Card
              key={scheme.id}
              className={`group relative overflow-hidden transition-all hover:shadow-md ${colors.border}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary" className={`${colors.bg} ${colors.text}`}>
                    {scheme.category || "General"}
                  </Badge>
                  {isLoggedIn && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      onClick={() => handleSaveToggle(scheme)}
                      disabled={savingScheme === scheme.id}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="size-4 text-primary" />
                      ) : (
                        <Bookmark className="size-4" />
                      )}
                    </Button>
                  )}
                </div>
                <CardTitle className="line-clamp-2 text-base group-hover:text-primary">
                  {scheme.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {scheme.ministry}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {scheme.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedScheme(scheme)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No schemes found matching your criteria.</p>
        </div>
      )}

      {/* Scheme Detail Dialog */}
      <Dialog open={!!selectedScheme} onOpenChange={() => setSelectedScheme(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selectedScheme && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <Badge
                    variant="outline"
                    className={`${getCardColor(selectedScheme.category).bg} ${getCardColor(selectedScheme.category).text}`}
                  >
                    {selectedScheme.category}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{selectedScheme.name}</DialogTitle>
                <DialogDescription className="text-sm">
                  {selectedScheme.ministry}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedScheme.description}</p>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Benefits</h4>
                  <p className="text-sm text-muted-foreground">{selectedScheme.benefits}</p>
                </div>

                {selectedScheme.documents_required &&
                  selectedScheme.documents_required.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-medium">Documents Required</h4>
                      <ul className="space-y-1">
                        {selectedScheme.documents_required.map((doc, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle className="size-4 text-primary" />
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {selectedScheme.min_age && (
                    <Badge variant="secondary">Min Age: {selectedScheme.min_age}</Badge>
                  )}
                  {selectedScheme.max_age && (
                    <Badge variant="secondary">Max Age: {selectedScheme.max_age}</Badge>
                  )}
                  {selectedScheme.max_income && (
                    <Badge variant="secondary">
                      Max Income: Rs. {(selectedScheme.max_income / 100000).toFixed(1)}L
                    </Badge>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  {isLoggedIn ? (
                    <Button
                      className="flex-1"
                      onClick={() => handleSaveToggle(selectedScheme)}
                      disabled={savingScheme === selectedScheme.id}
                    >
                      {savedSchemeIds.includes(selectedScheme.id) ? (
                        <>
                          <BookmarkCheck className="mr-2 size-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="mr-2 size-4" />
                          Save Scheme
                        </>
                      )}
                    </Button>
                  ) : (
                    <Link href="/auth/signup" className="flex-1">
                      <Button className="w-full">Sign Up to Save</Button>
                    </Link>
                  )}
                  {selectedScheme.application_url && (
                    <a
                      href={selectedScheme.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="gap-2">
                        Apply
                        <ExternalLink className="size-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

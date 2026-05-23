"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  INDIAN_STATES,
  EDUCATION_LEVELS,
  PROFILE_TYPES,
  CATEGORIES,
  Profile,
} from "@/lib/types"
import { AlertCircle, CheckCircle, User } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const loadProfile = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      setError(error.message)
    } else {
      setProfile(data)
    }

    setLoading(false)
  }, [router])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const updateField = (field: keyof Profile, value: string | number | null) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        profile_type: profile.profile_type,
        full_name: profile.full_name,
        age: profile.age,
        gender: profile.gender,
        state: profile.state,
        category: profile.category,
        education_level: profile.education_level,
        annual_income: profile.annual_income,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      toast.success("Profile updated successfully")
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="mb-8 h-10 w-48" />
        <Skeleton className="h-[600px]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <User className="size-8 text-primary" />
          Your Profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          Keep your profile updated for accurate scheme recommendations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            This information helps us find schemes you may be eligible for
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="profileType">Profile Type</Label>
            <Select
              value={profile?.profile_type || ""}
              onValueChange={(value) => updateField("profile_type", value)}
            >
              <SelectTrigger id="profileType">
                <SelectValue placeholder="Select profile type" />
              </SelectTrigger>
              <SelectContent>
                {PROFILE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profile?.full_name || ""}
              onChange={(e) => updateField("full_name", e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="120"
                value={profile?.age || ""}
                onChange={(e) => updateField("age", parseInt(e.target.value) || null)}
                placeholder="Your age"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={profile?.gender || ""}
                onValueChange={(value) => updateField("gender", value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select
              value={profile?.state || ""}
              onValueChange={(value) => updateField("state", value)}
            >
              <SelectTrigger id="state">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={profile?.category || ""}
              onValueChange={(value) => updateField("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education Level</Label>
            <Select
              value={profile?.education_level || ""}
              onValueChange={(value) => updateField("education_level", value)}
            >
              <SelectTrigger id="education">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="income">Annual Family Income (Rs.)</Label>
            <Input
              id="income"
              type="number"
              min="0"
              value={profile?.annual_income || ""}
              onChange={(e) => updateField("annual_income", parseInt(e.target.value) || null)}
              placeholder="e.g., 500000"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
            {saving ? (
              <Spinner className="size-4" />
            ) : (
              <>
                <CheckCircle className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

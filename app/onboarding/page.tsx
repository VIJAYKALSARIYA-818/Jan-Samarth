"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import {
  INDIAN_STATES,
  EDUCATION_LEVELS,
  PROFILE_TYPES,
  CATEGORIES,
} from "@/lib/types"
import {
  User,
  MapPin,
  GraduationCap,
  Wallet,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
} from "lucide-react"

interface FormData {
  profileType: string
  fullName: string
  age: string
  gender: string
  state: string
  category: string
  educationLevel: string
  annualIncome: string
}

const STEPS = [
  { id: 1, title: "Profile Type", icon: User },
  { id: 2, title: "Personal Info", icon: MapPin },
  { id: 3, title: "Education", icon: GraduationCap },
  { id: 4, title: "Income", icon: Wallet },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    profileType: "",
    fullName: "",
    age: "",
    gender: "",
    state: "",
    category: "",
    educationLevel: "",
    annualIncome: "",
  })

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const progress = (step / STEPS.length) * 100

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.profileType
      case 2:
        return !!formData.fullName && !!formData.age && !!formData.gender && !!formData.state
      case 3:
        return !!formData.educationLevel && !!formData.category
      case 4:
        return !!formData.annualIncome
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step < STEPS.length) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in to complete onboarding")
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        profile_type: formData.profileType,
        full_name: formData.fullName,
        age: parseInt(formData.age),
        gender: formData.gender,
        state: formData.state,
        category: formData.category,
        education_level: formData.educationLevel,
        annual_income: parseInt(formData.annualIncome),
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      // If update fails, try insert (for new profiles)
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        profile_type: formData.profileType,
        full_name: formData.fullName,
        age: parseInt(formData.age),
        gender: formData.gender,
        state: formData.state,
        category: formData.category,
        education_level: formData.educationLevel,
        annual_income: parseInt(formData.annualIncome),
        onboarding_completed: true,
      })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
        return
      }
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Progress Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">S</span>
              </div>
              <span className="font-semibold">Complete Your Profile</span>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    step === s.id
                      ? "bg-primary text-primary-foreground"
                      : step > s.id
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s.id ? (
                    <CheckCircle className="size-3.5" />
                  ) : (
                    <s.icon className="size-3.5" />
                  )}
                  {s.title}
                </div>
              ))}
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-1" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          {/* Step 1: Profile Type */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>What describes you best?</CardTitle>
                <CardDescription>
                  This helps us find the most relevant schemes for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.profileType}
                  onValueChange={(value) => updateField("profileType", value)}
                  className="grid gap-3"
                >
                  {PROFILE_TYPES.map((type) => (
                    <Label
                      key={type.value}
                      htmlFor={type.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                        formData.profileType === type.value
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      <RadioGroupItem value={type.value} id={type.value} />
                      <span className="font-medium">{type.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </CardContent>
            </>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Tell us a bit about yourself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Your age"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) => updateField("age", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
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
                    value={formData.state}
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
              </CardContent>
            </>
          )}

          {/* Step 3: Education & Category */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Education & Category</CardTitle>
                <CardDescription>
                  This helps determine your eligibility for various schemes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="education">Education Level</Label>
                  <Select
                    value={formData.educationLevel}
                    onValueChange={(value) => updateField("educationLevel", value)}
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
                  <Label>Category</Label>
                  <RadioGroup
                    value={formData.category}
                    onValueChange={(value) => updateField("category", value)}
                    className="grid gap-2"
                  >
                    {CATEGORIES.map((cat) => (
                      <Label
                        key={cat.value}
                        htmlFor={`cat-${cat.value}`}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                          formData.category === cat.value
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted"
                        }`}
                      >
                        <RadioGroupItem value={cat.value} id={`cat-${cat.value}`} />
                        <span className="text-sm">{cat.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Income */}
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Annual Income</CardTitle>
                <CardDescription>
                  Your family&apos;s annual income determines eligibility for many
                  schemes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="income">Annual Family Income (in Rs.)</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="e.g., 500000"
                    min="0"
                    value={formData.annualIncome}
                    onChange={(e) => updateField("annualIncome", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your total annual family income before taxes
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="mb-2 font-medium">Income Brackets Reference:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>Below Rs. 2.5 Lakh - EWS eligible</li>
                    <li>Below Rs. 5 Lakh - Many welfare schemes</li>
                    <li>Below Rs. 8 Lakh - Education scholarships</li>
                    <li>Below Rs. 18 Lakh - Housing subsidies</li>
                  </ul>
                </div>
              </CardContent>
            </>
          )}

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            {step < STEPS.length ? (
              <Button onClick={handleNext} disabled={!canProceed()} className="gap-2">
                Next
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="gap-2"
              >
                {loading ? (
                  <Spinner className="size-4" />
                ) : (
                  <>
                    Complete
                    <CheckCircle className="size-4" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}

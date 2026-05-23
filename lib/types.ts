export interface Profile {
  id: string
  profile_type: "student" | "farmer" | "business_owner" | "job_seeker" | "general"
  full_name: string | null
  age: number | null
  state: string | null
  category: "general" | "obc" | "sc" | "st" | "ews" | null
  annual_income: number | null
  education_level: string | null
  gender: "male" | "female" | "other" | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Scheme {
  id: string
  name: string
  description: string | null
  ministry: string | null
  eligibility_criteria: Record<string, unknown>
  benefits: string | null
  application_url: string | null
  documents_required: string[]
  category: string | null
  target_audience: string[]
  min_age: number | null
  max_age: number | null
  min_income: number | null
  max_income: number | null
  applicable_states: string[]
  applicable_categories: string[]
  created_at: string
}

export interface SavedScheme {
  id: string
  user_id: string
  scheme_id: string
  created_at: string
  scheme?: Scheme
}

export interface ChecklistItem {
  id: string
  user_id: string
  scheme_id: string
  document_name: string
  is_completed: boolean
  created_at: string
}

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
] as const

export const EDUCATION_LEVELS = [
  "Below 10th",
  "10th Pass",
  "12th Pass",
  "Graduate",
  "Post Graduate",
  "Doctorate",
] as const

export const PROFILE_TYPES = [
  { value: "student", label: "Student" },
  { value: "farmer", label: "Farmer" },
  { value: "business_owner", label: "Business Owner" },
  { value: "job_seeker", label: "Job Seeker" },
  { value: "general", label: "General Citizen" },
] as const

export const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "obc", label: "OBC (Other Backward Class)" },
  { value: "sc", label: "SC (Scheduled Caste)" },
  { value: "st", label: "ST (Scheduled Tribe)" },
  { value: "ews", label: "EWS (Economically Weaker Section)" },
] as const

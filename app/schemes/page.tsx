import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SchemeList } from "@/components/scheme-list"
import { createClient } from "@/lib/supabase/server"
import { SAMPLE_SCHEMES } from "@/lib/schemes-data"
import { Scheme } from "@/lib/types"

export default async function SchemesPage() {
  let schemes: Scheme[] = []
  let savedSchemeIds: string[] = []
  let isLoggedIn = false

  const supabase = await createClient()

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()
  isLoggedIn = !!user

  try {
    // Fetch schemes
    const { data: schemesData, error } = await supabase
      .from("schemes")
      .select("*")
      .order("name")

    if (error || !schemesData || schemesData.length === 0) {
      schemes = SAMPLE_SCHEMES.map((s, i) => ({
        ...s,
        id: `sample-${i}`,
        created_at: new Date().toISOString(),
      })) as Scheme[]
    } else {
      schemes = schemesData
    }

    // Fetch saved schemes if logged in
    if (user) {
      const { data: savedData } = await supabase
        .from("saved_schemes")
        .select("scheme_id")
        .eq("user_id", user.id)

      if (savedData) {
        savedSchemeIds = savedData.map((s) => s.scheme_id)
      }
    }
  } catch {
    schemes = SAMPLE_SCHEMES.map((s, i) => ({
      ...s,
      id: `sample-${i}`,
      created_at: new Date().toISOString(),
    })) as Scheme[]
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Browse All Schemes</h1>
            <p className="mt-2 text-muted-foreground">
              Discover government schemes across education, healthcare, business, and more
            </p>
          </div>
          <SchemeList
            schemes={schemes}
            savedSchemeIds={savedSchemeIds}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}

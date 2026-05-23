import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { Footer } from "@/components/footer"
import { createClient } from "@/lib/supabase/server"
import { SAMPLE_SCHEMES } from "@/lib/schemes-data"
import { Scheme } from "@/lib/types"

export default async function HomePage() {
  let schemes: Scheme[] = []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("schemes")
      .select("*")
      .limit(12)

    if (error) {
      console.log("[v0] Database not set up yet, using sample data")
      // Use sample data with generated IDs
      schemes = SAMPLE_SCHEMES.map((s, i) => ({
        ...s,
        id: `sample-${i}`,
        created_at: new Date().toISOString(),
      })) as Scheme[]
    } else {
      schemes = data || []
      // Fallback to sample data if no schemes in database
      if (schemes.length === 0) {
        schemes = SAMPLE_SCHEMES.map((s, i) => ({
          ...s,
          id: `sample-${i}`,
          created_at: new Date().toISOString(),
        })) as Scheme[]
      }
    }
  } catch {
    // Fallback to sample data
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
        <HeroSection schemes={schemes} />
        <CategoriesSection />
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  )
}

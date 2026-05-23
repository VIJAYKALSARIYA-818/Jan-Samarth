import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import { SAMPLE_SCHEMES } from "@/lib/schemes-data"

export async function POST() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )

  // Check if schemes already exist
  const { data: existingSchemes } = await supabase
    .from("schemes")
    .select("id")
    .limit(1)

  if (existingSchemes && existingSchemes.length > 0) {
    return NextResponse.json({ 
      message: "Schemes already seeded",
      count: existingSchemes.length 
    })
  }

  // Insert sample schemes
  const { data, error } = await supabase
    .from("schemes")
    .insert(SAMPLE_SCHEMES)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    message: "Schemes seeded successfully",
    count: data?.length || 0
  })
}

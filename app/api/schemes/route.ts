import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const state = searchParams.get("state")
  const search = searchParams.get("search")

  let query = supabase.from("schemes").select("*").eq("is_active", true)

  if (category) {
    query = query.eq("category", category)
  }

  if (state) {
    query = query.contains("eligibility_criteria", { states: [state] })
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%`
    )
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check if user is admin (could add role check here)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const schemeData = await request.json()

  const { data, error } = await supabase
    .from("schemes")
    .insert(schemeData)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0], { status: 201 })
}

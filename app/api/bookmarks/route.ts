import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: saved_schemes, error } = await supabase
    .from("saved_schemes")
    .select("*, schemes(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(saved_schemes)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { scheme_id, status = "saved", notes = "" } = await request.json()

  const { data, error } = await supabase
    .from("saved_schemes")
    .insert({
      user_id: user.id,
      scheme_id,
      status,
      notes,
    })
    .select()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Scheme already saved" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0], { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, status, notes } = await request.json()

  const { data, error } = await supabase
    .from("saved_schemes")
    .update({
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const saved_scheme_id = searchParams.get("id")

  if (!saved_scheme_id) {
    return NextResponse.json(
      { error: "Missing saved_scheme_id" },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from("saved_schemes")
    .delete()
    .eq("id", saved_scheme_id)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

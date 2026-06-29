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

  const { searchParams } = new URL(request.url)
  const saved_scheme_id = searchParams.get("saved_scheme_id")

  if (!saved_scheme_id) {
    return NextResponse.json(
      { error: "Missing saved_scheme_id" },
      { status: 400 }
    )
  }

  const { data: items, error } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("saved_scheme_id", saved_scheme_id)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(items)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, is_completed } = await request.json()

  if (!id) {
    return NextResponse.json({ error: "Missing checklist item id" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("checklist_items")
    .update({ is_completed })
    .eq("id", id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { saved_scheme_id, document_name } = await request.json()

  const { data, error } = await supabase
    .from("checklist_items")
    .insert({
      saved_scheme_id,
      document_name,
      is_completed: false,
    })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0], { status: 201 })
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
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json(
      { error: "Missing checklist item id" },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

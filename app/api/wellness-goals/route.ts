import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, category, targetFrequency } = await request.json()

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: goal, error } = await supabase
      .from("wellness_goals")
      .insert({
        user_id: user.id,
        title,
        description,
        category,
        target_frequency: targetFrequency ?? null,
        progress: 0,
        status: "active",
        ai_generated: false,
      })
      .select("*")
      .single()

    if (error) {
      console.error("[v0] Create wellness goal error:", error)
      return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
    }

    return NextResponse.json({ goal })
  } catch (error) {
    console.error("[v0] Wellness goals POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


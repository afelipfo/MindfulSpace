import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { recommendationId, feedback } = await request.json()

    // Update recommendation feedback
    const { error } = await supabase
      .from("recommendations")
      .update({ user_feedback: feedback })
      .eq("id", recommendationId)
      .eq("user_id", user.id)

    if (error) {
      console.error("[v0] Feedback save error:", error)
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Feedback API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

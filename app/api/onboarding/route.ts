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

    const body = await request.json()

    // Remove userId from body as we'll use the authenticated user's ID
    const { userId, ...onboardingData } = body

    // Check if onboarding data already exists
    const { data: existing } = await supabase
      .from("onboarding_data")
      .select("id")
      .eq("user_id", user.id)
      .single()

    let error = null

    if (existing) {
      // Update existing record
      const result = await supabase
        .from("onboarding_data")
        .update({
          ...onboardingData,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
      error = result.error
    } else {
      // Insert new record
      const result = await supabase.from("onboarding_data").insert({
        user_id: user.id,
        ...onboardingData,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      error = result.error
    }

    if (error) {
      console.error("[v0] Onboarding save error:", error)
      return NextResponse.json({ error: "Failed to save onboarding data", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Onboarding API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

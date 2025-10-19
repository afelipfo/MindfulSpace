import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

interface RouteContext {
  params: { id: string }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { progress, status } = await request.json()

    if (progress === undefined && status === undefined) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof progress === "number" && Number.isFinite(progress)) {
      updates.progress = Math.max(0, Math.min(100, Math.round(progress)))
    }

    if (typeof status === "string") {
      updates.status = status
    } else if (typeof progress === "number" && progress >= 100) {
      updates.status = "completed"
    }

    const { data: goal, error } = await supabase
      .from("wellness_goals")
      .update(updates)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*")
      .single()

    if (error) {
      console.error("[v0] Update wellness goal error:", error)
      return NextResponse.json({ error: "Failed to update goal" }, { status: 500 })
    }

    return NextResponse.json({ goal })
  } catch (error) {
    console.error("[v0] Wellness goals PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("wellness_goals")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) {
      console.error("[v0] Delete wellness goal error:", error)
      return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Wellness goals DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


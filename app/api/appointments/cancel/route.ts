import { revalidatePath } from "next/cache"
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

    const { appointmentId } = await request.json()

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID required" }, { status: 400 })
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appointmentId)
      .eq("user_id", user.id)
      .select(
        `id, scheduled_at, duration_minutes, status, meeting_type, meeting_link, meeting_notes, created_at,
         therapists (id, full_name, credentials, profile_image_url, timezone)`
      )
      .single()

    if (error) {
      console.error("[v0] Cancel appointment error:", error)
      return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 })
    }

    revalidatePath("/appointments")
    revalidatePath("/dashboard")

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error("[v0] Cancel appointment API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


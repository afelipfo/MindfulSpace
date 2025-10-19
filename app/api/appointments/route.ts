import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"
import { normalizeAppointment } from "@/components/appointments/appointments-types"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const therapistId = request.nextUrl.searchParams.get("therapistId")

    let query = supabase
      .from("appointments")
      .select(
        "id, scheduled_at, duration_minutes, status, meeting_type, meeting_link, meeting_notes, created_at, therapists (id, full_name, credentials, profile_image_url, timezone)",
      )
      .eq("user_id", user.id)
      .order("scheduled_at", { ascending: true })

    if (therapistId) {
      query = query.eq("therapist_id", therapistId)
    }

    const { data: appointments, error } = await query

    if (error) throw error

    return NextResponse.json({
      appointments: (appointments || []).map((appointment) => normalizeAppointment(appointment)),
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { therapistId, scheduledAt, durationMinutes, notes, meetingType } = await request.json()

    if (!therapistId || !scheduledAt || !durationMinutes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert appointment
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        user_id: user.id,
        therapist_id: therapistId,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        status: "scheduled",
        meeting_type: meetingType ?? null,
        meeting_notes: notes,
      })
      .select(
        "id, scheduled_at, duration_minutes, status, meeting_type, meeting_link, meeting_notes, created_at, therapists (id, full_name, credentials, profile_image_url, timezone)",
      )
      .single()

    if (error) throw error

    // TODO: Send calendar invite via Google Calendar API
    // TODO: Send email notification to both user and therapist

    revalidatePath("/appointments")
    revalidatePath("/dashboard")

    return NextResponse.json({ appointment: normalizeAppointment(appointment) })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}

import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AppointmentsPageClient } from "@/components/appointments/appointments-page-client"
import {
  normalizeAppointment,
  sortAppointments,
  type AppointmentRecord,
  type TherapistSummary,
} from "@/components/appointments/appointments-types"

type SearchParams = Record<string, string | string[] | undefined>

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const resolvedSearchParams = await searchParams
  const defaultTherapistId =
    typeof resolvedSearchParams?.therapist === "string" ? resolvedSearchParams.therapist : undefined

  const [{ data: profile }, { data: appointmentsData }, { data: therapistRows }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("appointments")
      .select(
        "id, scheduled_at, duration_minutes, status, meeting_type, meeting_link, meeting_notes, created_at, therapists (id, full_name, credentials, profile_image_url, timezone)",
      )
      .eq("user_id", user.id)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("therapists")
      .select("id, full_name, credentials, profile_image_url, timezone")
      .order("full_name", { ascending: true }),
  ])

  const normalizedAppointments: AppointmentRecord[] = sortAppointments(
    (appointmentsData ?? []).map(normalizeAppointment),
  )

  const therapists: TherapistSummary[] = (therapistRows ?? []).map((therapist) => ({
    id: String(therapist.id),
    full_name: therapist.full_name ?? "Therapist",
    credentials: therapist.credentials ?? null,
    profile_image_url: therapist.profile_image_url ?? null,
    timezone: therapist.timezone ?? null,
  }))

  return (
    <AppointmentsPageClient
      initialAppointments={normalizedAppointments}
      therapists={therapists}
      userName={profile?.full_name || "User"}
      defaultTherapistId={defaultTherapistId}
    />
  )
}

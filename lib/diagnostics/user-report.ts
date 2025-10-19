import { createServerClient } from "@/lib/supabase/server"

export interface DiagnosticsReport {
  profile: Record<string, unknown> | null
  onboarding: Record<string, unknown> | null
  moodLogs: Array<Record<string, unknown>>
  wellnessGoals: Array<Record<string, unknown>>
  appointments: Array<Record<string, unknown>>
}

export async function fetchDiagnosticsReport(userId: string): Promise<DiagnosticsReport> {
  const supabase = await createServerClient()

  const [{ data: profile }, { data: onboarding }, { data: moodLogs }, { data: wellnessGoals }, { data: appointments }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("onboarding_data").select("*").eq("user_id", userId).single(),
      supabase
        .from("mood_logs")
        .select("created_at, mood_score, energy_level, stress_level, notes")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("wellness_goals")
        .select("title, description, category, progress, target_frequency, status, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("appointments")
        .select(
          `scheduled_at,
           duration_minutes,
           status,
           meeting_type,
           meeting_link,
           meeting_notes,
           therapists (full_name, credentials)`
        )
        .eq("user_id", userId)
        .order("scheduled_at", { ascending: false })
        .limit(20),
    ])

  return {
    profile: profile ?? null,
    onboarding: onboarding ?? null,
    moodLogs: moodLogs ?? [],
    wellnessGoals: wellnessGoals ?? [],
    appointments: appointments ?? [],
  }
}

export function buildDiagnosticsSummary(report: DiagnosticsReport): string {
  const lines: string[] = []
  lines.push("MindfulSpace Diagnostics Summary")
  lines.push("============================")
  lines.push("")

  if (report.profile) {
    lines.push("Profile")
    lines.push(`Name: ${report.profile.full_name ?? "Not provided"}`)
    lines.push(`Email: ${report.profile.email ?? "Not provided"}`)
    if (report.profile.timezone) lines.push(`Timezone: ${report.profile.timezone}`)
    lines.push("")
  }

  if (report.onboarding) {
    lines.push("Onboarding Highlights")
    if (Array.isArray(report.onboarding.concerns)) {
      lines.push(`Concerns: ${report.onboarding.concerns.join(", ") || "Not provided"}`)
    }
    if (Array.isArray(report.onboarding.therapy_goals)) {
      lines.push(`Goals: ${report.onboarding.therapy_goals.join(", ") || "Not provided"}`)
    }
    if (report.onboarding.additional_notes) {
      lines.push(`Notes: ${report.onboarding.additional_notes}`)
    }
    lines.push("")
  }

  if (report.moodLogs.length > 0) {
    lines.push("Recent Mood Logs")
    report.moodLogs.slice(0, 5).forEach((log) => {
      lines.push(
        `${new Date(log.created_at as string).toLocaleString()} — Mood ${log.mood_score}/10, Energy ${log.energy_level}/10, Stress ${log.stress_level}/10${
          log.notes ? ` | Notes: ${log.notes}` : ""
        }`,
      )
    })
    lines.push("")
  }

  if (report.wellnessGoals.length > 0) {
    lines.push("Wellness Goals")
    report.wellnessGoals.forEach((goal) => {
      lines.push(`• ${goal.title} (${goal.status ?? "active"}) — ${goal.progress ?? 0}% complete`)
      if (goal.description) lines.push(`  ${goal.description}`)
    })
    lines.push("")
  }

  if (report.appointments.length > 0) {
    lines.push("Appointments")
    report.appointments.forEach((apt) => {
      const therapistName = apt.therapists?.full_name ?? "Therapist"
      lines.push(
        `• ${new Date(apt.scheduled_at as string).toLocaleString()} with ${therapistName} (${apt.status ?? "scheduled"})`,
      )
    })
  }

  return lines.join("\n")
}


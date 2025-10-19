export type TherapistSummary = {
  id: string
  full_name: string
  credentials: string | null
  profile_image_url: string | null
  timezone: string | null
}

export type AppointmentRecord = {
  id: string
  scheduled_at: string
  duration_minutes: number
  status: string
  meeting_type: string | null
  meeting_link: string | null
  meeting_notes: string | null
  created_at: string | null
  therapist: TherapistSummary | null
}

const UPCOMING_STATUSES = new Set(["scheduled", "confirmed"])

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

const toStringOrNull = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }
  return null
}

export function normalizeAppointment(raw: any): AppointmentRecord {
  const therapistRaw = raw?.therapist ?? raw?.therapists ?? null

  const therapist: TherapistSummary | null = therapistRaw
    ? {
        id: String(therapistRaw.id),
        full_name: therapistRaw.full_name ?? "Therapist",
        credentials: toStringOrNull(therapistRaw.credentials),
        profile_image_url: toStringOrNull(therapistRaw.profile_image_url),
        timezone: toStringOrNull(therapistRaw.timezone),
      }
    : null

  return {
    id: String(raw?.id ?? ""),
    scheduled_at: raw?.scheduled_at ?? "",
    duration_minutes: toNumber(raw?.duration_minutes ?? 0),
    status: raw?.status ?? "scheduled",
    meeting_type: toStringOrNull(raw?.meeting_type),
    meeting_link: toStringOrNull(raw?.meeting_link),
    meeting_notes: toStringOrNull(raw?.meeting_notes ?? raw?.notes),
    created_at: raw?.created_at ?? null,
    therapist,
  }
}

export function sortAppointments(list: AppointmentRecord[]): AppointmentRecord[] {
  return [...list].sort((a, b) => {
    const aTime = new Date(a.scheduled_at).getTime()
    const bTime = new Date(b.scheduled_at).getTime()
    return aTime - bTime
  })
}

export function isUpcomingAppointment(appointment: AppointmentRecord, now = new Date()): boolean {
  const time = new Date(appointment.scheduled_at).getTime()
  if (Number.isNaN(time)) return false
  return time >= now.getTime() && UPCOMING_STATUSES.has(appointment.status)
}

export function isPastAppointment(appointment: AppointmentRecord, now = new Date()): boolean {
  const time = new Date(appointment.scheduled_at).getTime()
  if (Number.isNaN(time)) return true
  return time < now.getTime() || !UPCOMING_STATUSES.has(appointment.status)
}

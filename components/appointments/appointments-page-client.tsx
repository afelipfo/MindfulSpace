"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  FileText,
  Link2,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  XCircle,
  Video,
} from "lucide-react"
import { ScheduleAppointmentDialog } from "./schedule-appointment-dialog"
import {
  type AppointmentRecord,
  type TherapistSummary,
  isPastAppointment,
  isUpcomingAppointment,
  normalizeAppointment,
  sortAppointments,
} from "./appointments-types"

const statusStyles: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  scheduled: { label: "Scheduled", variant: "secondary" },
  confirmed: { label: "Confirmed", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  no_show: { label: "No show", variant: "destructive" },
}

const meetingTypeDisplay: Record<
  string,
  { icon: typeof Video; label: string }
> = {
  video: { icon: Video, label: "Video session" },
  phone: { icon: Phone, label: "Phone session" },
  in_person: { icon: MapPin, label: "In person" },
}

interface AppointmentsPageClientProps {
  initialAppointments: AppointmentRecord[]
  therapists: TherapistSummary[]
  userName: string
  defaultTherapistId?: string | null
}

const formatDateTime = (isoDate: string) => {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: "Unknown date", timeLabel: "" }
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  return {
    dateLabel: dateFormatter.format(date),
    timeLabel: timeFormatter.format(date),
  }
}

const getStatusDisplay = (status: string) => statusStyles[status] ?? { label: status, variant: "outline" }

const getInitials = (fullName: string) =>
  fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

export function AppointmentsPageClient({
  initialAppointments,
  therapists,
  userName,
  defaultTherapistId,
}: AppointmentsPageClientProps) {
  const router = useRouter()
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() => sortAppointments(initialAppointments))
  const [isDialogOpen, setIsDialogOpen] = useState(Boolean(defaultTherapistId))
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | undefined>(
    defaultTherapistId ?? undefined,
  )
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">("upcoming")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelAppointment, setCancelAppointment] = useState<AppointmentRecord | null>(null)
  const [cancelMessage, setCancelMessage] = useState("")
  const [isGeneratingCancelMessage, setIsGeneratingCancelMessage] = useState(false)
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [shareTherapistId, setShareTherapistId] = useState<string | null>(null)
  const [shareSummary, setShareSummary] = useState("")
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isGeneratingShareSummary, setIsGeneratingShareSummary] = useState(false)
  const [shareDiagnosticsError, setShareDiagnosticsError] = useState<string | null>(null)
  const [isSendingShareSummary, setIsSendingShareSummary] = useState(false)

  useEffect(() => {
    if (defaultTherapistId) {
      setIsDialogOpen(true)
      setSelectedTherapistId(defaultTherapistId)
      router.replace("/appointments", { scroll: false })
    }
  }, [defaultTherapistId, router])

  const openCancelDialog = async (appointment: AppointmentRecord) => {
    setCancelAppointment(appointment)
    setCancelMessage("")
    setCancelError(null)
    if (!appointment.therapist) {
      setCancelMessage("Hello, I need to cancel our upcoming session. Thank you for understanding.")
      return
    }

    setIsGeneratingCancelMessage(true)
    try {
      const response = await fetch("/api/appointments/cancellation-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistName: appointment.therapist.full_name,
          appointmentDate: appointment.scheduled_at,
          reason: appointment.meeting_notes,
        }),
      })

      if (!response.ok) {
        const fallback = await response.json().catch(() => ({}))
        setCancelMessage(
          fallback.message ||
            `Hello ${appointment.therapist.full_name}, I need to cancel our upcoming session scheduled for ${new Date(
              appointment.scheduled_at,
            ).toLocaleString()}. Thank you for understanding.`,
        )
        return
      }

      const data = await response.json()
      setCancelMessage(
        typeof data.message === "string" && data.message.trim().length > 0
          ? data.message.trim()
          : `Hello ${appointment.therapist.full_name}, I need to cancel our upcoming session scheduled for ${new Date(
              appointment.scheduled_at,
            ).toLocaleString()}. Thank you for understanding.`,
      )
    } catch (err) {
      console.error("[v0] Generate cancellation message error:", err)
      setCancelMessage(
        `Hello ${appointment.therapist.full_name}, I need to cancel our upcoming session scheduled for ${new Date(
          appointment.scheduled_at,
        ).toLocaleString()}. Thank you for understanding.`,
      )
    } finally {
      setIsGeneratingCancelMessage(false)
    }
  }

  const closeCancelDialog = () => {
    setCancelAppointment(null)
    setCancelMessage("")
    setCancelError(null)
    setIsGeneratingCancelMessage(false)
    setIsSubmittingCancel(false)
  }

  const handleCancelSubmit = async () => {
    if (!cancelAppointment) return
    const messageToSend = cancelMessage.trim()

    setIsSubmittingCancel(true)
    setCancelError(null)

    try {
      if (cancelAppointment.therapist?.id && messageToSend.length > 0) {
        const messageResponse = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            therapistId: cancelAppointment.therapist.id,
            content: messageToSend,
          }),
        })

        if (!messageResponse.ok) {
          throw new Error("Failed to send cancellation message")
        }
      }

      const cancelResponse = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: cancelAppointment.id }),
      })

      if (!cancelResponse.ok) {
        const payload = await cancelResponse.json().catch(() => ({}))
        throw new Error(payload.error || "Unable to cancel appointment")
      }

      const data = await cancelResponse.json()
      if (data.appointment) {
        const normalized = normalizeAppointment(data.appointment)
        setAppointments((prev) =>
          sortAppointments(prev.map((appointment) => (appointment.id === normalized.id ? normalized : appointment))),
        )
        setActiveTab("all")
      }

      closeCancelDialog()
    } catch (err) {
      console.error("[v0] Cancel appointment flow error:", err)
      setCancelError(err instanceof Error ? err.message : "Unable to cancel appointment right now.")
    } finally {
      setIsSubmittingCancel(false)
      void handleRefresh()
    }
  }

  const shareDiagnostics = async (therapistId: string) => {
    setShareTherapistId(therapistId)
    setShareSummary("")
    setShareDiagnosticsError(null)
    setIsShareDialogOpen(true)
    setIsGeneratingShareSummary(true)
    try {
      const response = await fetch("/api/diagnostics/share", { method: "POST" })
      const data = await response.json()
      if (!response.ok || !data.summary) {
        throw new Error(data.error || "Unable to prepare diagnostics summary")
      }
      setShareSummary(data.summary)
    } catch (err) {
      console.error("[v0] Share diagnostics from appointments error:", err)
      setShareDiagnosticsError(err instanceof Error ? err.message : "Unable to prepare diagnostics right now.")
    } finally {
      setIsGeneratingShareSummary(false)
    }
  }

  const closeShareDialog = () => {
    setIsShareDialogOpen(false)
    setShareSummary("")
    setShareTherapistId(null)
    setShareDiagnosticsError(null)
    setIsGeneratingShareSummary(false)
    setIsSendingShareSummary(false)
  }

  const copySummaryToClipboard = async () => {
    if (!shareSummary) return
    try {
      await navigator.clipboard.writeText(shareSummary)
      alert("Diagnostics summary copied to clipboard.")
    } catch (err) {
      console.error("[v0] Copy summary error:", err)
      setShareDiagnosticsError("Unable to copy summary. Please copy manually.")
    }
  }

  const sendSummaryToTherapist = async () => {
    if (!shareTherapistId || !shareSummary.trim()) return
    setIsSendingShareSummary(true)
    setShareDiagnosticsError(null)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId: shareTherapistId,
          content: shareSummary,
          includeGreeting: false,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || "Unable to send diagnostics summary")
      }

      closeShareDialog()
      alert("Diagnostics summary sent to your therapist.")
    } catch (error) {
      console.error("[v0] Send diagnostics summary error:", error)
      setShareDiagnosticsError(error instanceof Error ? error.message : "Unable to send summary right now.")
    } finally {
      setIsSendingShareSummary(false)
    }
  }

  const now = useMemo(() => new Date(), [appointments])

  const upcomingAppointments = useMemo(
    () => appointments.filter((apt) => isUpcomingAppointment(apt, now)),
    [appointments, now],
  )

  const pastAppointments = useMemo(
    () => appointments.filter((apt) => isPastAppointment(apt, now)),
    [appointments, now],
  )

  const activeAppointments = useMemo(() => {
    if (activeTab === "upcoming") return upcomingAppointments
    if (activeTab === "past") return pastAppointments.slice().reverse()
    return appointments
  }, [activeTab, appointments, upcomingAppointments, pastAppointments])

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      const response = await fetch("/api/appointments", { cache: "no-store" })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Unable to load appointments.")
      }
      const data = await response.json()
      const normalized = Array.isArray(data.appointments)
        ? sortAppointments(data.appointments.map(normalizeAppointment))
        : []
      setAppointments(normalized)
    } catch (err) {
      console.error("[v0] Refresh appointments error:", err)
      setError(err instanceof Error ? err.message : "Unable to refresh appointments.")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDialogOpen = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setSelectedTherapistId(undefined)
    }
  }

  const handleAppointmentBooked = (appointment: AppointmentRecord) => {
    setAppointments((prev) => {
      const filtered = prev.filter((existing) => existing.id !== appointment.id)
      return sortAppointments([...filtered, appointment])
    })
    setActiveTab("upcoming")
    setError(null)
    void handleRefresh()
  }

  const renderAppointmentCard = (appointment: AppointmentRecord) => {
    const { dateLabel, timeLabel } = formatDateTime(appointment.scheduled_at)
    const statusDisplay = getStatusDisplay(appointment.status)
    const meetingDisplay =
      appointment.meeting_type && meetingTypeDisplay[appointment.meeting_type]
        ? meetingTypeDisplay[appointment.meeting_type]
        : null

    return (
      <Card key={appointment.id} className="border-blue-100 shadow-sm">
        <CardHeader className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg text-blue-900">{dateLabel}</CardTitle>
            <p className="text-sm text-blue-800">{timeLabel}</p>
          </div>
          <Badge variant={statusDisplay.variant} className="w-fit">
            {statusDisplay.label}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12 border border-blue-200">
              {appointment.therapist?.profile_image_url ? (
                <AvatarImage
                  src={appointment.therapist.profile_image_url}
                  alt={appointment.therapist.full_name}
                />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {appointment.therapist ? getInitials(appointment.therapist.full_name) : "TH"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {appointment.therapist?.full_name || "Therapist"}
              </p>
              {appointment.therapist?.credentials && (
                <p className="text-sm text-muted-foreground">{appointment.therapist.credentials}</p>
              )}
              {appointment.therapist?.timezone && (
                <p className="text-xs text-blue-700 mt-1">Timezone: {appointment.therapist.timezone}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              {appointment.duration_minutes} minutes
            </span>
            {meetingDisplay && (
              <span className="inline-flex items-center gap-2">
                <meetingDisplay.icon className="h-4 w-4 text-blue-600" />
                {meetingDisplay.label}
              </span>
            )}
          </div>

          {appointment.meeting_link && (
            <Link
              href={appointment.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              <Link2 className="h-4 w-4" />
              Join session link
            </Link>
          )}

          {appointment.meeting_notes && (
            <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
              <p className="font-medium mb-1">Session notes</p>
              <p className="text-blue-800">{appointment.meeting_notes}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {appointment.therapist?.id && (
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                asChild
              >
                <Link href={`/messages/${appointment.therapist.id}`}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message therapist
                </Link>
              </Button>
            )}
            {appointment.therapist?.id && (
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => void shareDiagnostics(appointment.therapist!.id)}
                disabled={
                  isGeneratingShareSummary && shareTherapistId === appointment.therapist?.id
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                Share diagnostics
              </Button>
            )}
            {isUpcomingAppointment(appointment) && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => void openCancelDialog(appointment)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col items-start justify-between gap-4 px-4 py-8 md:flex-row md:items-center">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 text-blue-700 hover:text-blue-900"
          >
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Back to dashboard
            </Link>
          </Button>
          <div>
            <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Appointments</p>
            <h1 className="mt-1 text-3xl font-bold text-blue-900">Your session plan</h1>
            <p className="text-sm text-muted-foreground">
              Manage upcoming therapy sessions, review past conversations, and schedule new time with your care team.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing
                </>
              ) : (
                "Refresh"
              )}
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setSelectedTherapistId(undefined)
                setIsDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Schedule session
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
              <TabsList>
                <TabsTrigger value="upcoming">
                  Upcoming
                  <Badge variant="outline" className="ml-2">
                    {upcomingAppointments.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past
                  <Badge variant="outline" className="ml-2">
                    {pastAppointments.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="all">
                  All
                  <Badge variant="outline" className="ml-2">
                    {appointments.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <Card className="border-dashed border-blue-200 bg-blue-50/60">
                    <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                      <CalendarIcon className="h-10 w-10 text-blue-300" />
                      <p className="text-blue-900 font-medium">No upcoming sessions yet</p>
                      <p className="text-sm text-muted-foreground">
                        Schedule time with a therapist to keep your wellness plan on track.
                      </p>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule session
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => renderAppointmentCard(appointment))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastAppointments.length === 0 ? (
                  <Card className="border-dashed border-blue-200 bg-blue-50/60">
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                      Completed sessions will appear here for easy reference.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pastAppointments
                      .slice()
                      .reverse()
                      .map((appointment) => renderAppointmentCard(appointment))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                {appointments.length === 0 ? (
                  <Card className="border-dashed border-blue-200 bg-blue-50/60">
                    <CardContent className="py-10 text-center text-sm text-muted-foreground">
                      Once you schedule a session you will see the timeline here.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => renderAppointmentCard(appointment))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>

          <aside className="space-y-4">
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Stay prepared</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Sessions are most effective when you arrive with a focus. Jot down a few notes before you join.
                </p>
                <p>
                  Need to reschedule? Send a message to your therapist or contact support at{" "}
                  <Link href="mailto:support@mindfulspace.app" className="text-blue-700 hover:underline">
                    support@mindfulspace.app
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="text-blue-900">Therapists you can meet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {therapists.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    We&apos;re expanding our network. Browse therapists to explore options for your next session.
                  </p>
                ) : (
                  therapists.slice(0, 4).map((therapist) => (
                    <div key={therapist.id} className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-blue-900">{therapist.full_name}</p>
                        {therapist.credentials && (
                          <p className="text-xs text-muted-foreground">{therapist.credentials}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={() => {
                          setSelectedTherapistId(therapist.id)
                          setIsDialogOpen(true)
                        }}
                      >
                        Schedule
                      </Button>
                    </div>
                  ))
                )}
                <Button asChild variant="ghost" className="px-0 text-blue-700 hover:text-blue-900">
                  <Link href="/therapists">Browse all therapists</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-green-50/60">
              <CardHeader>
                <CardTitle className="text-green-900">Next steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-green-900">
                <p>• Add MindfulSpace to your calendar for quick access before each session.</p>
                <p>• Capture post-session reflections in your mood log to track progress.</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <ScheduleAppointmentDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpen}
        therapists={therapists}
        defaultTherapistId={selectedTherapistId}
        onBooked={handleAppointmentBooked}
      />
      <Dialog open={isShareDialogOpen} onOpenChange={(open) => (!open ? closeShareDialog() : undefined)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share diagnostics summary</DialogTitle>
            <DialogDescription>
              Review your current diagnostics summary. Copy it or open your messages to share it directly with your therapist.
            </DialogDescription>
          </DialogHeader>
          {shareDiagnosticsError && (
            <Alert variant="destructive" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{shareDiagnosticsError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-3">
            {isGeneratingShareSummary ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing summary…
              </div>
            ) : shareSummary ? (
              <>
                <Textarea value={shareSummary} readOnly className="min-h-48" />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => void copySummaryToClipboard()}>
                    Copy summary
                  </Button>
                  {shareTherapistId && (
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                      <Link href={`/messages/${shareTherapistId}`}>Open messages</Link>
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: Paste this summary into your next message so your therapist has the latest context.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">We couldn&apos;t prepare your summary. Please try again later.</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeShareDialog} disabled={isSendingShareSummary}>
              Close
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => void sendSummaryToTherapist()}
              disabled={!shareSummary || isSendingShareSummary || isGeneratingShareSummary}
            >
              {isSendingShareSummary ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send to therapist"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={cancelAppointment !== null} onOpenChange={(open) => (!open ? closeCancelDialog() : undefined)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cancel session</DialogTitle>
            <DialogDescription>
              Let {cancelAppointment?.therapist?.full_name ?? "your therapist"} know you need to cancel. We’ll send a brief
              message on your behalf.
            </DialogDescription>
          </DialogHeader>
          {cancelError && (
            <Alert variant="destructive" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cancelError}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-3">
            <label className="text-sm font-medium text-blue-900" htmlFor="cancel-message">
              Message to therapist
            </label>
            <Textarea
              id="cancel-message"
              value={cancelMessage}
              onChange={(event) => setCancelMessage(event.target.value)}
              disabled={isGeneratingCancelMessage || isSubmittingCancel}
              className="min-h-32"
              placeholder="Share a quick note about why you need to cancel."
            />
            {isGeneratingCancelMessage && (
              <p className="text-xs text-muted-foreground">Preparing a thoughtful message…</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeCancelDialog} disabled={isSubmittingCancel}>
              Keep session
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => void handleCancelSubmit()}
              disabled={isSubmittingCancel || isGeneratingCancelMessage}
            >
              {isSubmittingCancel ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling…
                </>
              ) : (
                "Send & cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

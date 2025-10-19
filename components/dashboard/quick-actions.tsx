import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Calendar, Users, Sparkles, Clock, Download } from "lucide-react"

type QuickActionsProps = {
  nextAppointment?: {
    scheduled_at: string
    therapistName: string | null
    status: string | null
  } | null
}

const formatDateTime = (isoDate: string) => {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) {
    return { dateLabel: "—", timeLabel: "" }
  }
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
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

const formatStatus = (status?: string | null) => {
  if (!status) return null
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function QuickActions({ nextAppointment }: QuickActionsProps) {
  return (
    <Card className="border-blue-100">
      <CardHeader>
        <CardTitle className="text-blue-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {nextAppointment ? (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Next session</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {formatDateTime(nextAppointment.scheduled_at).dateLabel}
                </p>
                <p className="flex items-center gap-1 text-xs text-blue-700">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDateTime(nextAppointment.scheduled_at).timeLabel}
                </p>
                {nextAppointment.therapistName && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    with {nextAppointment.therapistName}
                  </p>
                )}
              </div>
              {(() => {
                const statusText = formatStatus(nextAppointment.status)
                return statusText ? (
                  <Badge variant="secondary" className="shrink-0">
                    {statusText}
                  </Badge>
                ) : null
              })()}
            </div>
            <Button
              asChild
              variant="link"
              className="h-auto px-0 text-xs text-blue-700 hover:text-blue-900"
            >
              <Link href="/appointments">Manage appointments</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            <p className="font-semibold">No sessions booked</p>
            <p className="text-xs text-muted-foreground">
              Schedule time with a therapist to stay on track.
            </p>
          </div>
        )}

        <Button
          asChild
          variant="outline"
          className="w-full justify-start border-blue-200 hover:bg-blue-50 bg-transparent"
        >
          <Link href="/therapists">
            <Users className="mr-2 h-4 w-4" />
            Find a Therapist
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full justify-start border-blue-200 hover:bg-blue-50 bg-transparent"
        >
          <Link href="/messages">
            <MessageCircle className="mr-2 h-4 w-4" />
            View Messages
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full justify-start border-blue-200 hover:bg-blue-50 bg-transparent"
        >
          <Link href="/appointments">
            <Calendar className="mr-2 h-4 w-4" />
            My Appointments
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full justify-start border-blue-200 hover:bg-blue-50 bg-transparent"
        >
          <Link href="/recommendations">
            <Sparkles className="mr-2 h-4 w-4" />
            Get Recommendations
          </Link>
        </Button>
        <Button asChild className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
          <Link href="/api/diagnostics/export">
            <Download className="mr-2 h-4 w-4" />
            Export diagnostics
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

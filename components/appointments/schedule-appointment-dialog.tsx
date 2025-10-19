"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { AppointmentRecord, TherapistSummary } from "./appointments-types"
import { normalizeAppointment } from "./appointments-types"

const meetingTypeOptions = [
  { value: "video", label: "Video session" },
  { value: "phone", label: "Phone call" },
  { value: "in_person", label: "In person" },
]

const scheduleSchema = z.object({
  therapistId: z.string().min(1, "Please choose a therapist"),
  date: z.string().min(1, "Select a date"),
  time: z.string().min(1, "Select a time"),
  duration: z.string().min(1, "Select a duration"),
  meetingType: z.enum(["video", "phone", "in_person"]),
  notes: z
    .string()
    .max(500, "Keep notes under 500 characters")
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : "")),
})

type ScheduleFormValues = z.infer<typeof scheduleSchema>

interface ScheduleAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  therapists: TherapistSummary[]
  defaultTherapistId?: string
  onBooked: (appointment: AppointmentRecord) => void
}

export function ScheduleAppointmentDialog({
  open,
  onOpenChange,
  therapists,
  defaultTherapistId,
  onBooked,
}: ScheduleAppointmentDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sortedTherapists = useMemo(
    () =>
      [...therapists].sort((a, b) =>
        a.full_name.localeCompare(b.full_name, undefined, { sensitivity: "base" }),
      ),
    [therapists],
  )

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      therapistId: defaultTherapistId ?? "",
      date: "",
      time: "",
      duration: "50",
      meetingType: "video",
      notes: "",
    },
  })

  useEffect(() => {
    if (defaultTherapistId) {
      form.setValue("therapistId", defaultTherapistId)
    }
  }, [defaultTherapistId, form])

  useEffect(() => {
    if (!open) {
      form.reset({
        therapistId: defaultTherapistId ?? "",
        date: "",
        time: "",
        duration: "50",
        meetingType: "video",
        notes: "",
      })
      setError(null)
      setSubmitting(false)
    }
  }, [open, form, defaultTherapistId])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitting(true)
      setError(null)

      const scheduledAtLocal = new Date(`${values.date}T${values.time}`)
      if (Number.isNaN(scheduledAtLocal.getTime())) {
        throw new Error("Invalid date or time")
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId: values.therapistId,
          scheduledAt: scheduledAtLocal.toISOString(),
          durationMinutes: Number.parseInt(values.duration, 10),
          notes: values.notes || null,
          meetingType: values.meetingType,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "We could not schedule that session. Try again.")
      }

      const data = await response.json()
      onBooked(normalizeAppointment(data.appointment))
      onOpenChange(false)
    } catch (err) {
      console.error("[v0] Schedule appointment error:", err)
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  })

  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule a session</DialogTitle>
          <DialogDescription>
            Select a therapist, date, and time. You&apos;ll receive a reminder once it is confirmed.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="therapistId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Therapist</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={sortedTherapists.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a therapist" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sortedTherapists.length === 0 ? (
                        <SelectItem value="" disabled>
                          No therapists available
                        </SelectItem>
                      ) : (
                        sortedTherapists.map((therapist) => (
                          <SelectItem key={therapist.id} value={therapist.id}>
                            {therapist.full_name}
                            {therapist.credentials ? ` · ${therapist.credentials}` : ""}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" min={today} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="50">50 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meetingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {meetingTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Share any goals for the session or context your therapist should know."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling…
                  </>
                ) : (
                  "Schedule session"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

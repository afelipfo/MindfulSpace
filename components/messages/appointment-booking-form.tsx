"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AppointmentBookingFormProps {
  therapistId: string
  therapistName: string
  onSuccess: () => void
  onCancel: () => void
}

export function AppointmentBookingForm({
  therapistId,
  therapistName,
  onSuccess,
  onCancel,
}: AppointmentBookingFormProps) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("60")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const scheduledAt = new Date(`${date}T${time}`)

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId,
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: Number.parseInt(duration),
          notes: notes || null,
          meetingType: "video",
        }),
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white border rounded-lg">
      <div>
        <Label htmlFor="date">Date</Label>
        <input
          id="date"
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full mt-1 px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <Label htmlFor="time">Time</Label>
        <input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="w-full mt-1 px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <Label htmlFor="duration">Duration</Label>
        <select
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-md"
        >
          <option value="30">30 minutes</option>
          <option value="60">60 minutes</option>
          <option value="90">90 minutes</option>
        </select>
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any specific topics you'd like to discuss?"
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting} className="flex-1 bg-green-600 hover:bg-green-700">
          {submitting ? "Booking..." : "Book Appointment"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

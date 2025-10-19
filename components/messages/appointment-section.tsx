"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Plus } from "lucide-react"
import { AppointmentBookingForm } from "./appointment-booking-form"

interface Appointment {
  id: string
  scheduled_at: string
  duration_minutes: number
  status: string
  notes: string | null
}

interface AppointmentSectionProps {
  userId: string
  therapistId: string
  therapistName: string
}

export function AppointmentSection({ userId, therapistId, therapistName }: AppointmentSectionProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showBooking, setShowBooking] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [therapistId])

  async function fetchAppointments() {
    try {
      const response = await fetch(`/api/appointments?therapistId=${therapistId}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleAppointmentBooked() {
    setShowBooking(false)
    fetchAppointments()
  }

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.scheduled_at) > new Date() && apt.status === "scheduled",
  )

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
          <Button onClick={() => setShowBooking(!showBooking)} size="sm" className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-1" />
            Book
          </Button>
        </div>

        {showBooking && (
          <div className="mb-4">
            <AppointmentBookingForm
              therapistId={therapistId}
              therapistName={therapistName}
              onSuccess={handleAppointmentBooked}
              onCancel={() => setShowBooking(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading appointments...</div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(appointment.scheduled_at).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <Clock className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-gray-600">
                    {new Date(appointment.scheduled_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    ({appointment.duration_minutes} min)
                  </p>
                </div>
                {appointment.notes && <p className="text-xs text-gray-500 mt-2 ml-6">{appointment.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-2">Session Info</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Video sessions via secure link</li>
          <li>• 24-hour cancellation policy</li>
          <li>• Session notes available after</li>
        </ul>
      </Card>
    </div>
  )
}

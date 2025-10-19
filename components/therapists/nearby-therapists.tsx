"use client"

import { useCallback, useMemo, useState } from "react"
import { Sparkles, MapPin, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TherapistCard, type TherapistSummary } from "@/components/therapists/therapist-card"

type NearbyTherapist = TherapistSummary & { distance_km?: number | null }

interface NearbyTherapistsProps {
  fallbackTherapists: TherapistSummary[]
}

type LocationState = "idle" | "locating" | "fetching" | "ready" | "error"

const formatError = (message: string | null, fallback: string) => message ?? fallback

export function NearbyTherapists({ fallbackTherapists }: NearbyTherapistsProps) {
  const [status, setStatus] = useState<LocationState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [therapists, setTherapists] = useState<NearbyTherapist[]>([])

  const hasResults = therapists.length > 0

  const sortedFallback = useMemo(() => fallbackTherapists.slice(0, 3), [fallbackTherapists])

  const handleLocate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported in this browser.")
      setStatus("error")
      return
    }

    setStatus("locating")
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setStatus("fetching")
        try {
          const response = await fetch(
            `/api/therapists/nearby?lat=${latitude.toFixed(6)}&lng=${longitude.toFixed(6)}`,
          )
          if (!response.ok) {
            const payload = await response.json().catch(() => ({}))
            throw new Error(payload.error || "Unable to find nearby therapists.")
          }
          const data = await response.json()
          setTherapists(data.therapists ?? [])
          setStatus("ready")
        } catch (err) {
          setError(formatError(err instanceof Error ? err.message : null, "Unable to locate professionals nearby."))
          setStatus("error")
        }
      },
      (geoError) => {
        const message =
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location access was declined. Enable location permissions to see nearby professionals."
            : "We couldn't determine your location. Please try again."
        setError(message)
        setStatus("error")
      },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }, [])

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Nearby Professionals
          </CardTitle>
          <CardDescription>Find therapists closest to you in real time</CardDescription>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleLocate}
          disabled={status === "locating" || status === "fetching"}
        >
          {status === "locating" || status === "fetching" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Locating…
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              Use my location
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "error" && error && (
          <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {status === "idle" && (
          <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/60 p-4 text-sm text-muted-foreground">
            Share your current location to surface licensed therapists closest to you and reduce travel time when scheduling in-person sessions.
          </div>
        )}

        {status === "ready" && hasResults && (
          <div className="grid gap-4 lg:grid-cols-2">
            {therapists.map((therapist) => (
              <TherapistCard key={therapist.id} therapist={therapist} />
            ))}
          </div>
        )}

        {status === "ready" && !hasResults && (
          <div className="rounded-lg border border-blue-100 bg-white p-4 text-sm text-muted-foreground">
            We couldn't find verified therapists with a listed location near you yet. We're expanding our directory frequently—try widening your search filters.
          </div>
        )}

        {status === "idle" && sortedFallback.length > 0 && (
          <div className="space-y-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-blue-700">Featured therapists</p>
            <div className="grid gap-3 lg:grid-cols-2">
              {sortedFallback.map((therapist) => (
                <TherapistCard key={therapist.id} therapist={therapist} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


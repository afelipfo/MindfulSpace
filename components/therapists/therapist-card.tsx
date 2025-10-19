import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, DollarSign, Globe, MapPin, MessageCircle } from "lucide-react"
import Link from "next/link"

export interface TherapistSummary {
  id: string
  full_name: string
  credentials: string
  specializations: string[]
  bio: string
  years_experience: number
  gender: string
  languages: string[]
  therapy_approaches: string[]
  session_rate_min: number
  session_rate_max: number
  accepts_insurance: boolean
  verified: boolean
  city?: string | null
  state?: string | null
  latitude?: number | null
  longitude?: number | null
  distance_km?: number | null
}

const formatDistance = (distanceKm: number) => {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000)
    return `${meters} m away`
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km away`
  }
  return `${Math.round(distanceKm)} km away`
}

export function TherapistCard({ therapist }: { therapist: TherapistSummary }) {
  return (
    <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl text-blue-900">
              {therapist.full_name}
              {therapist.verified && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            </CardTitle>
            <CardDescription className="mt-1">{therapist.credentials}</CardDescription>
            {(therapist.city || therapist.state || therapist.distance_km != null) && (
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                <span>
                  {[therapist.city, therapist.state].filter(Boolean).join(", ")}
                  {therapist.distance_km != null && (
                    <>
                      {" "}
                      • <span className="font-medium text-blue-700">{formatDistance(therapist.distance_km)}</span>
                    </>
                  )}
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {therapist.specializations.slice(0, 3).map((spec) => (
            <Badge key={spec} variant="secondary" className="bg-blue-100 text-blue-700">
              {spec}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{therapist.bio}</p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>
              ${therapist.session_rate_min}-${therapist.session_rate_max} per session
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>{therapist.languages.join(", ")}</span>
          </div>
          {therapist.accepts_insurance && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Accepts Insurance</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Link href={`/therapists/${therapist.id}`}>View Profile</Link>
          </Button>
          <Button asChild variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent">
            <Link href={`/therapists/${therapist.id}/connect`}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Connect
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

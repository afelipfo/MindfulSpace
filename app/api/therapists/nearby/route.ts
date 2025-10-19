import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

const EARTH_RADIUS_KM = 6371

interface TherapistRow {
  id: string
  full_name: string
  credentials: string | null
  specializations: string[] | null
  bio: string | null
  years_experience: number | null
  gender: string | null
  languages: string[] | null
  therapy_approaches: string[] | null
  session_rate_min: number | null
  session_rate_max: number | null
  accepts_insurance: boolean | null
  verified: boolean | null
  city: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
}

const toRadians = (value: number) => (value * Math.PI) / 180

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl
    const latParam = url.searchParams.get("lat")
    const lngParam = url.searchParams.get("lng")

    if (!latParam || !lngParam) {
      return NextResponse.json({ error: "Latitude and longitude are required." }, { status: 400 })
    }

    const latitude = Number.parseFloat(latParam)
    const longitude = Number.parseFloat(lngParam)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json({ error: "Invalid coordinates provided." }, { status: 400 })
    }

    const supabase = await createServerClient()

    let therapistsQuery = await supabase
      .from("therapists")
      .select(
        `id,
        full_name,
        credentials,
        specializations,
        bio,
        years_experience,
        gender,
        languages,
        therapy_approaches,
        session_rate_min,
        session_rate_max,
        accepts_insurance,
        verified,
        city,
        state,
        latitude,
        longitude`,
      )
      .eq("is_accepting_clients", true)
      .eq("verified", true)

    if (therapistsQuery.error?.code === "42703") {
      therapistsQuery = await supabase
        .from("therapists")
        .select(
          `id,
          full_name,
          credentials,
          specializations,
          bio,
          years_experience,
          gender,
          languages,
          therapy_approaches,
          session_rate_min,
          session_rate_max,
          accepts_insurance,
          verified`,
        )
        .eq("is_accepting_clients", true)
        .eq("verified", true)

      if (therapistsQuery.data) {
        return NextResponse.json({ therapists: [] })
      }
    }

    if (therapistsQuery.error) {
      console.error("[v0] Nearby therapists query error:", therapistsQuery.error)
      return NextResponse.json({ error: "Unable to fetch therapists." }, { status: 500 })
    }

    const therapists = therapistsQuery.data

    const withDistance =
      therapists
        ?.filter((therapist): therapist is TherapistRow => therapist.latitude != null && therapist.longitude != null)
        .map((therapist) => ({
          ...therapist,
          distance_km: haversineDistance(latitude, longitude, therapist.latitude!, therapist.longitude!),
          credentials: therapist.credentials ?? "",
          specializations: therapist.specializations ?? [],
          languages: therapist.languages ?? [],
          therapy_approaches: therapist.therapy_approaches ?? [],
          bio: therapist.bio ?? "",
          years_experience: therapist.years_experience ?? 0,
          session_rate_min: therapist.session_rate_min ?? 0,
          session_rate_max: therapist.session_rate_max ?? 0,
          accepts_insurance: therapist.accepts_insurance ?? false,
          verified: therapist.verified ?? false,
        }))
        .sort((a, b) => a.distance_km - b.distance_km)
        .slice(0, 6) ?? []

    return NextResponse.json({ therapists: withDistance })
  } catch (error) {
    console.error("[v0] Nearby therapists API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


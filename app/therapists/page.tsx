import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { TherapistFilters } from "@/components/therapists/therapist-filters"
import { TherapistGrid } from "@/components/therapists/therapist-grid"
import type { TherapistSummary } from "@/components/therapists/therapist-card"
import { NearbyTherapists } from "@/components/therapists/nearby-therapists"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function TherapistsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const params = await searchParams

  // Build query based on filters
  const baseSelect = `id,
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
      is_accepting_clients,
      city,
      state,
      latitude,
      longitude`

  const applyFilters = <T>(query: T) => {
    let filtered = query
    if (params.specialization) {
      filtered = filtered.contains("specializations", [params.specialization])
    }
    if (params.gender && params.gender !== "any") {
      filtered = filtered.eq("gender", params.gender)
    }
    if (params.approach) {
      filtered = filtered.contains("therapy_approaches", [params.approach])
    }
    if (params.insurance === "true") {
      filtered = filtered.eq("accepts_insurance", true)
    }
    return filtered
  }

  let therapistsQuery = applyFilters(
    supabase
      .from("therapists")
      .select(baseSelect)
      .eq("is_accepting_clients", true)
      .eq("verified", true),
  )

  let { data: therapistsData, error: therapistError } = await therapistsQuery.order("full_name")

  if (therapistError?.code === "42703") {
    const fallbackQuery = await applyFilters(
      supabase
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
          is_accepting_clients`,
        )
        .eq("is_accepting_clients", true)
        .eq("verified", true),
    ).order("full_name")

    therapistsData = fallbackQuery.data
    therapistError = fallbackQuery.error
  }

  if (therapistError) {
    console.error("[v0] therapists page query error:", therapistError)
  }
  const therapists: TherapistSummary[] =
    (therapistsData ?? []).map((therapist) => ({
      ...therapist,
      specializations: therapist.specializations ?? [],
      languages: therapist.languages ?? [],
      therapy_approaches: therapist.therapy_approaches ?? [],
      distance_km: therapist.distance_km ?? null,
    }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DashboardHeader userName={profile?.full_name || "User"} />

      <main className="container mx-auto px-4 py-8">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2 text-blue-700 hover:text-blue-900"
        >
          <Link href="/dashboard" className="inline-flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-blue-900">Find Your Therapist</h1>
          <p className="text-muted-foreground">
            Browse verified mental health professionals and find the right match for your needs
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <TherapistFilters />
          </aside>

          <div className="lg:col-span-3">
            <div className="space-y-6">
              <NearbyTherapists fallbackTherapists={therapists} />
              <TherapistGrid therapists={therapists} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

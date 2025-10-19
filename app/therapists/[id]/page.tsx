import { redirect, notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, DollarSign, Globe, Calendar, MessageCircle, Award, Clock } from "lucide-react"
import Link from "next/link"

export default async function TherapistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: therapist } = await supabase.from("therapists").select("*").eq("id", id).single()

  if (!therapist) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DashboardHeader userName={profile?.full_name || "User"} />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header Card */}
          <Card className="border-blue-100 shadow-lg">
            <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-3xl text-blue-900">
                    {therapist.full_name}
                    {therapist.verified && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">{therapist.credentials}</CardDescription>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {therapist.specializations.map((spec: string) => (
                      <Badge key={spec} variant="secondary" className="bg-blue-100 text-blue-700">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Link href={`/therapists/${therapist.id}/connect`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send Message
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                >
                  <Link href={`/appointments?therapist=${therapist.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{therapist.bio}</p>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Award className="h-5 w-5" />
                  Experience & Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{therapist.years_experience} years of experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Languages: {therapist.languages.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Gender: {therapist.gender}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <DollarSign className="h-5 w-5" />
                  Rates & Insurance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Session Rate</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${therapist.session_rate_min}-${therapist.session_rate_max}
                  </p>
                </div>
                {therapist.accepts_insurance ? (
                  <div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Accepts Insurance</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{therapist.insurance_providers.join(", ")}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Does not accept insurance</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Therapy Approaches */}
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900">Therapy Approaches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {therapist.therapy_approaches.map((approach: string) => (
                  <Badge key={approach} variant="outline" className="border-blue-300 text-blue-700">
                    {approach}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

import { redirect, notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { ConnectForm } from "@/components/therapists/connect-form"

export default async function ConnectPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Fetch user's onboarding data for AI context
  const { data: onboarding } = await supabase.from("onboarding_data").select("*").eq("user_id", user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DashboardHeader userName={profile?.full_name || "User"} />

      <main className="container mx-auto px-4 py-8">
        <ConnectForm therapist={therapist} userId={user.id} onboarding={onboarding} />
      </main>
    </div>
  )
}

import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { RecommendationsView } from "@/components/recommendations/recommendations-view"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function RecommendationsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch recent mood logs for AI context
  const { data: recentMoods } = await supabase
    .from("mood_logs")
    .select("mood_score, energy_level, stress_level, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(7)

  // Fetch onboarding data for personalization
  const { data: onboarding } = await supabase.from("onboarding_data").select("*").eq("user_id", user.id).single()

  // Fetch existing recommendations
  const { data: recommendations } = await supabase
    .from("recommendations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DashboardHeader userName={profile?.full_name || "User"} />

      <main className="container mx-auto px-4 py-8">
        <RecommendationsView
          userId={user.id}
          recentMoods={recentMoods || []}
          onboarding={onboarding}
          existingRecommendations={recommendations || []}
        />
      </main>
    </div>
  )
}

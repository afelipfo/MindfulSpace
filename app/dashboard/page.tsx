import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { MoodLogger } from "@/components/dashboard/mood-logger"
import { MoodTrends } from "@/components/dashboard/mood-trends"
import { MoodHeatmap } from "@/components/dashboard/mood-heatmap"
import { WellnessGoals } from "@/components/dashboard/wellness-goals"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentMoodLogs } from "@/components/dashboard/recent-mood-logs"
import { generateWellnessGoalRecommendations } from "@/lib/wellness/recommend-goals"

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch recent mood logs (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: moodLogs } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false })

  // Fetch wellness goals
  const { data: goals } = await supabase
    .from("wellness_goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5)

  const upcomingAppointmentsResponse = await supabase
    .from("appointments")
    .select("id, scheduled_at, status, therapists(full_name)")
    .eq("user_id", user.id)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(1)

  const nextAppointmentData = upcomingAppointmentsResponse.data?.[0] ?? null
  const nextAppointment = nextAppointmentData
    ? {
        id: nextAppointmentData.id,
        scheduled_at: nextAppointmentData.scheduled_at,
        status: nextAppointmentData.status,
        therapistName: nextAppointmentData.therapists?.full_name ?? null,
      }
    : null

  const recommendedGoals = await generateWellnessGoalRecommendations(moodLogs || [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DashboardHeader userName={profile?.full_name || "User"} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <MoodLogger userId={user.id} />
            <MoodTrends moodLogs={moodLogs || []} />
            <MoodHeatmap moodLogs={moodLogs || []} />
            <RecentMoodLogs moodLogs={moodLogs?.slice(0, 5) || []} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <QuickActions nextAppointment={nextAppointment} />
            <WellnessGoals
              goals={goals || []}
              userId={user.id}
              recommendedGoals={recommendedGoals}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

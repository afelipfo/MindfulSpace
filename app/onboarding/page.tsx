import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { OnboardingFlow } from "@/components/onboarding-flow"

type SearchParams = Record<string, string | string[] | undefined>

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const modeParam = typeof searchParams?.mode === "string" ? searchParams.mode.toLowerCase() : undefined
  const isReviewMode = modeParam === "review"

  // Check if user has already completed onboarding
  const { data: existingOnboarding } = await supabase
    .from("onboarding_data")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!isReviewMode && existingOnboarding?.completed_at) {
    redirect("/dashboard")
  }

  const initialData = existingOnboarding
    ? {
        concerns: existingOnboarding.concerns ?? [],
        concerns_other: existingOnboarding.concerns_other ?? undefined,
        symptoms: existingOnboarding.symptoms ?? [],
        symptoms_other: existingOnboarding.symptoms_other ?? undefined,
        symptom_duration: existingOnboarding.symptom_duration ?? undefined,
        symptom_frequency: existingOnboarding.symptom_frequency ?? undefined,
        previous_treatment: existingOnboarding.previous_treatment ?? undefined,
        current_medications: existingOnboarding.current_medications ?? undefined,
        therapy_history: existingOnboarding.therapy_history ?? undefined,
        therapy_goals: existingOnboarding.therapy_goals ?? [],
        goals_other: existingOnboarding.goals_other ?? undefined,
        therapist_gender_preference: existingOnboarding.therapist_gender_preference ?? undefined,
        therapy_type_preference: existingOnboarding.therapy_type_preference ?? [],
        session_frequency_preference: existingOnboarding.session_frequency_preference ?? undefined,
        additional_notes: existingOnboarding.additional_notes ?? undefined,
      }
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <OnboardingFlow userId={user.id} mode={isReviewMode ? "review" : "new"} initialData={initialData} />
    </div>
  )
}

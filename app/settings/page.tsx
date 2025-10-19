import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { SettingsPageClient } from "@/components/settings/settings-page-client"

export default async function SettingsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const initialSettings = {
    privacyLevel: (profile?.privacy_level as "public" | "encrypted" | "anonymized") || "encrypted",
    timezone: profile?.timezone || "UTC",
    emailNotifications: profile?.email_notifications ?? true,
    smsNotifications: profile?.sms_notifications ?? false,
    productUpdates: profile?.product_updates ?? true,
    aiRecommendations: profile?.ai_recommendations ?? true,
    shareAnonymizedData: profile?.share_anonymized_data ?? false,
  }

  return (
    <SettingsPageClient
      userName={profile?.full_name || "User"}
      userEmail={user.email || profile?.email || "Not available"}
      lastSignIn={user.last_sign_in_at}
      initialSettings={initialSettings}
    />
  )
}

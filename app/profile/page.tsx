import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { ProfilePageClient } from "@/components/profile/profile-page-client"

export default async function ProfilePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const safeProfile = {
    full_name: profile?.full_name ?? null,
    email: profile?.email ?? user.email ?? null,
    date_of_birth: profile?.date_of_birth ?? null,
    phone: profile?.phone ?? null,
    emergency_contact_name: profile?.emergency_contact_name ?? null,
    emergency_contact_phone: profile?.emergency_contact_phone ?? null,
    privacy_level: profile?.privacy_level ?? null,
  }

  return <ProfilePageClient initialProfile={safeProfile} userEmail={user.email || profile?.email || "Not available"} />
}

"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProfileForm } from "@/components/profile/profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HeartHandshake, ShieldCheck, UserCheck } from "lucide-react"

type ProfileRecord = {
  full_name: string | null
  email: string | null
  date_of_birth: string | null
  phone: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  privacy_level: string | null
}

interface ProfilePageClientProps {
  initialProfile: ProfileRecord
  userEmail: string
}

export function ProfilePageClient({ initialProfile, userEmail }: ProfilePageClientProps) {
  const [profile, setProfile] = useState<ProfileRecord>(initialProfile)

  const completion = useMemo(() => {
    const checks = [
      { label: "Full name", value: profile.full_name },
      { label: "Date of birth", value: profile.date_of_birth },
      { label: "Mobile phone", value: profile.phone },
      {
        label: "Emergency contact",
        value: profile.emergency_contact_name && profile.emergency_contact_phone,
      },
    ]

    const completed = checks.filter((item) => Boolean(item.value)).length
    const score = checks.length > 0 ? Math.round((completed / checks.length) * 100) : 0

    return {
      checks,
      score,
    }
  }, [
    profile.date_of_birth,
    profile.emergency_contact_name,
    profile.emergency_contact_phone,
    profile.full_name,
    profile.phone,
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DashboardHeader userName={profile.full_name || "User"} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ProfileForm
              email={userEmail || profile.email || "Not available"}
              initialValues={{
                fullName: profile.full_name || "",
                dateOfBirth: profile.date_of_birth || "",
                phone: profile.phone || "",
                emergencyContactName: profile.emergency_contact_name || "",
                emergencyContactPhone: profile.emergency_contact_phone || "",
              }}
              onProfileSaved={(updates) =>
                setProfile((prev) => ({
                  ...prev,
                  ...updates,
                }))
              }
            />

            <Card className="border-blue-100 shadow-md">
              <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <HeartHandshake className="h-5 w-5 text-blue-700" />
                  Your care preferences
                </CardTitle>
                <CardDescription>
                  Tell us more about the support you are seeking so we can fine-tune your recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                <p>
                  Update your onboarding details to capture new goals, preferences, or any recent changes in your health
                  journey.
                </p>
                <Button asChild variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Link href="/onboarding?mode=review">Review onboarding</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="border-blue-100 shadow-md">
              <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
                <CardTitle className="text-blue-900">Profile strength</CardTitle>
                <CardDescription>Complete these steps to help therapists understand your context.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                    style={{ width: `${completion.score}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-blue-900">Profile completion: {completion.score}%</p>
                <ul className="space-y-3 text-sm">
                  {completion.checks.map((item) => (
                    <li key={item.label} className="flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.value ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <UserCheck className="h-4 w-4" />
                          Done
                        </span>
                      ) : (
                        <span className="text-blue-600">Add</span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-md">
              <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <ShieldCheck className="h-5 w-5 text-blue-700" />
                  Data protection
                </CardTitle>
                <CardDescription>
                  Your privacy level is currently set to {profile.privacy_level || "encrypted"}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 text-sm text-muted-foreground">
                <p>
                  We encrypt your personal information using industry standards. Adjust visibility and sharing controls
                  in{" "}
                  <Link href="/settings" className="text-blue-600 underline underline-offset-4">
                    account settings
                  </Link>
                  .
                </p>
                <p>
                  Need to update your therapist team or revoke access? Our support team can help within 24 hours.
                </p>
                <Button asChild variant="ghost" className="justify-start px-0 text-blue-700 hover:text-blue-900">
                  <Link href="mailto:support@mindfulspace.app">Contact support</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}

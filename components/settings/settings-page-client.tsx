"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard/header"
import { SettingsForm, type SettingsFormValues } from "@/components/settings/settings-form"
import { PasswordCard } from "@/components/settings/password-card"
import { McpServerCard } from "@/components/settings/mcp-server-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BellRing, FileOutput, Shield } from "lucide-react"

interface SettingsPageClientProps {
  userName: string
  userEmail: string
  lastSignIn: string | null
  initialSettings: SettingsFormValues
}

export function SettingsPageClient({
  userName,
  userEmail,
  lastSignIn,
  initialSettings,
}: SettingsPageClientProps) {
  const [settings, setSettings] = useState<SettingsFormValues>(initialSettings)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <DashboardHeader userName={userName || "User"} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SettingsForm initialValues={settings} onPreferencesSaved={(values) => setSettings(values)} />
            <PasswordCard email={userEmail} lastSignIn={lastSignIn} />
          </div>

          <aside className="space-y-6">
            <Card className="border-blue-100 shadow-md">
              <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Shield className="h-5 w-5 text-blue-700" />
                  Privacy at a glance
                </CardTitle>
                <CardDescription>
                  You are sharing data in <span className="font-medium">{settings.privacyLevel}</span> mode.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 text-sm text-muted-foreground">
                <p>
                  MindfulSpace protects your information with encryption in transit and at rest. Only professionals
                  assigned to your care team can access identifying details.
                </p>
                <p>
                  Need a full export of your information? We can prepare a secure download within 48 hours.
                </p>
                <Link href="mailto:privacy@mindfulspace.app" className="inline-flex items-center gap-2 text-blue-700">
                  <FileOutput className="h-4 w-4" />
                  Request data export
                </Link>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-md">
              <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <BellRing className="h-5 w-5 text-blue-700" />
                  Notification summary
                </CardTitle>
                <CardDescription>
                  Email alerts are{" "}
                  <span className="font-medium">{settings.emailNotifications ? "on" : "off"}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                  <span>SMS alerts</span>
                  <Badge variant={settings.smsNotifications ? "default" : "outline"}>
                    {settings.smsNotifications ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                  <span>Product updates</span>
                  <Badge variant={settings.productUpdates ? "default" : "outline"}>
                    {settings.productUpdates ? "Subscribed" : "Muted"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                  <span>AI recommendations</span>
                  <Badge variant={settings.aiRecommendations ? "default" : "outline"}>
                    {settings.aiRecommendations ? "On" : "Off"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                  <span>Anonymized insights</span>
                  <Badge variant={settings.shareAnonymizedData ? "default" : "outline"}>
                    {settings.shareAnonymizedData ? "Sharing" : "Private"}
                  </Badge>
                </div>
                <p>
                  Changes take effect immediately across MindfulSpace web and mobile. You can fine-tune preferences any
                  time.
                </p>
              </CardContent>
            </Card>

            <McpServerCard />
          </aside>
        </div>
      </main>
    </div>
  )
}

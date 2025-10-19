"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2 } from "lucide-react"

const settingsSchema = z.object({
  privacyLevel: z.enum(["public", "encrypted", "anonymized"]),
  timezone: z.string().min(2, "Choose the timezone you primarily live in").max(64),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  productUpdates: z.boolean(),
  aiRecommendations: z.boolean(),
  shareAnonymizedData: z.boolean(),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>

interface SettingsFormProps {
  initialValues: SettingsFormValues
  onPreferencesSaved?: (values: SettingsFormValues) => void
}

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "Europe/London", label: "Greenwich Mean Time" },
  { value: "Europe/Madrid", label: "Central European Time" },
  { value: "Asia/Singapore", label: "Singapore Standard Time" },
  { value: "Australia/Sydney", label: "Australian Eastern Time" },
]

export function SettingsForm({ initialValues, onPreferencesSaved }: SettingsFormProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const timezoneOptions = useMemo(() => {
    if (!initialValues.timezone) return timezones
    const exists = timezones.some((tz) => tz.value === initialValues.timezone)
    return exists ? timezones : [...timezones, { value: initialValues.timezone, label: initialValues.timezone }]
  }, [initialValues.timezone])

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialValues,
  })

  const { isDirty } = form.formState

  useEffect(() => {
    form.reset(initialValues)
  }, [
    form,
    initialValues.aiRecommendations,
    initialValues.emailNotifications,
    initialValues.privacyLevel,
    initialValues.productUpdates,
    initialValues.shareAnonymizedData,
    initialValues.smsNotifications,
    initialValues.timezone,
  ])

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  const scheduleStatusReset = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
    }
    resetTimerRef.current = setTimeout(() => setStatus("idle"), 4000)
  }

  const onSubmit = async (values: SettingsFormValues) => {
    setStatus("saving")
    setErrorMessage(null)

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Unable to save settings. Please try again.")
      }

      setStatus("success")
      form.reset(values)
      onPreferencesSaved?.(values)
      router.refresh()
      scheduleStatusReset()
    } catch (error) {
      console.error("[v0] Settings form submit error:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.")
      scheduleStatusReset()
    }
  }

  return (
    <Card className="border-blue-100 shadow-md">
      <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
        <CardTitle className="text-2xl text-blue-900">Privacy & Preferences</CardTitle>
        <CardDescription>Decide how MindfulSpace communicates with you and how your data is protected.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        {status === "success" && (
          <Alert className="border-green-200 bg-green-50 text-green-900">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Your preferences have been saved.</AlertDescription>
          </Alert>
        )}

        {status === "error" && errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="privacyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy mode</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full md:w-80">
                          <SelectValue placeholder="Select privacy mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public — share my profile with matched therapists</SelectItem>
                          <SelectItem value="encrypted">Encrypted — only visible to my care team</SelectItem>
                          <SelectItem value="anonymized">Anonymized — share data without personal details</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Control how much of your profile is visible to care providers when they review your case.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem className="w-full md:w-96">
                    <FormLabel>Primary timezone</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezoneOptions.map((timezone) => (
                            <SelectItem key={timezone.value} value={timezone.value}>
                              {timezone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      We use this timezone for reminders, live sessions, and personalized recommendations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-blue-900">Communication</h3>

              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-start justify-between gap-4 rounded-lg border border-blue-100 p-4">
                    <div>
                      <FormLabel>Email notifications</FormLabel>
                      <FormDescription>Session reminders, care team messages, and wellbeing nudges.</FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <span className="text-sm font-medium text-blue-900">{field.value ? "On" : "Off"}</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smsNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-start justify-between gap-4 rounded-lg border border-blue-100 p-4">
                    <div>
                      <FormLabel>SMS alerts</FormLabel>
                      <FormDescription>Urgent notifications and last-minute updates from your care team.</FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <span className="text-sm font-medium text-blue-900">{field.value ? "On" : "Off"}</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productUpdates"
                render={({ field }) => (
                  <FormItem className="flex items-start justify-between gap-4 rounded-lg border border-blue-100 p-4">
                    <div>
                      <FormLabel>Product updates</FormLabel>
                      <FormDescription>Occasional announcements about new programs and features.</FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <span className="text-sm font-medium text-blue-900">{field.value ? "On" : "Off"}</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-blue-900">Intelligent insights</h3>

              <FormField
                control={form.control}
                name="aiRecommendations"
                render={({ field }) => (
                  <FormItem className="flex items-start justify-between gap-4 rounded-lg border border-blue-100 p-4">
                    <div>
                      <FormLabel>Personalized recommendations</FormLabel>
                      <FormDescription>
                        Allow MindfulSpace to surface routines, therapists, and exercises tailored to you.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <span className="text-sm font-medium text-blue-900">{field.value ? "On" : "Off"}</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shareAnonymizedData"
                render={({ field }) => (
                  <FormItem className="flex items-start justify-between gap-4 rounded-lg border border-blue-100 p-4">
                    <div>
                      <FormLabel>Contribute anonymized insights</FormLabel>
                      <FormDescription>
                        Help us improve the platform by sharing anonymized patterns from your progress data.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        <span className="text-sm font-medium text-blue-900">{field.value ? "On" : "Off"}</span>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                These changes apply instantly and you can adjust them whenever your needs shift.
              </p>
              <Button type="submit" disabled={!isDirty || status === "saving"} className="w-full md:w-auto">
                {status === "saving" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save preferences"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

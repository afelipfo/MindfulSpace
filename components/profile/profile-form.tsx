"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2 } from "lucide-react"

const phoneRegex = /^[\d+()\s-]{6,}$/i

const profileSchema = z.object({
  fullName: z.string().min(2, "Please enter at least 2 characters").max(120, "Name is too long"),
  dateOfBirth: z
    .string()
    .nullable()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Please use the YYYY-MM-DD format",
    }),
  phone: z
    .string()
    .nullable()
    .refine((value) => !value || phoneRegex.test(value), {
      message: "Please enter a valid phone number",
    }),
  emergencyContactName: z
    .string()
    .nullable()
    .refine((value) => !value || value.length <= 120, {
      message: "Contact name is too long",
    }),
  emergencyContactPhone: z
    .string()
    .nullable()
    .refine((value) => !value || phoneRegex.test(value), {
      message: "Please enter a valid phone number",
    }),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  email: string
  initialValues: {
    fullName: string | null
    dateOfBirth: string | null
    phone: string | null
    emergencyContactName: string | null
    emergencyContactPhone: string | null
  }
  onProfileSaved?: (updates: {
    full_name: string
    date_of_birth: string | null
    phone: string | null
    emergency_contact_name: string | null
    emergency_contact_phone: string | null
  }) => void
}

export function ProfileForm({ email, initialValues, onProfileSaved }: ProfileFormProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialValues.fullName || "",
      dateOfBirth: initialValues.dateOfBirth || "",
      phone: initialValues.phone || "",
      emergencyContactName: initialValues.emergencyContactName || "",
      emergencyContactPhone: initialValues.emergencyContactPhone || "",
    },
  })

  const { isDirty } = form.formState

  useEffect(() => {
    form.reset({
      fullName: initialValues.fullName || "",
      dateOfBirth: initialValues.dateOfBirth || "",
      phone: initialValues.phone || "",
      emergencyContactName: initialValues.emergencyContactName || "",
      emergencyContactPhone: initialValues.emergencyContactPhone || "",
    })
  }, [
    form,
    initialValues.dateOfBirth,
    initialValues.emergencyContactName,
    initialValues.emergencyContactPhone,
    initialValues.fullName,
    initialValues.phone,
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

  const onSubmit = async (values: ProfileFormValues) => {
    setStatus("saving")
    setErrorMessage(null)

    const payload = {
      fullName: values.fullName.trim(),
      dateOfBirth: values.dateOfBirth || null,
      phone: values.phone?.trim() || null,
      emergencyContactName: values.emergencyContactName?.trim() || null,
      emergencyContactPhone: values.emergencyContactPhone?.trim() || null,
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "We couldn't save your changes. Please try again.")
      }

      setStatus("success")
      form.reset({
        fullName: payload.fullName,
        dateOfBirth: payload.dateOfBirth || "",
        phone: payload.phone || "",
        emergencyContactName: payload.emergencyContactName || "",
        emergencyContactPhone: payload.emergencyContactPhone || "",
      })
      onProfileSaved?.({
        full_name: payload.fullName,
        date_of_birth: payload.dateOfBirth,
        phone: payload.phone,
        emergency_contact_name: payload.emergencyContactName,
        emergency_contact_phone: payload.emergencyContactPhone,
      })
      router.refresh()
      scheduleStatusReset()
    } catch (error) {
      console.error("[v0] Profile form submit error:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.")
      scheduleStatusReset()
    }
  }

  return (
    <Card className="border-blue-100 shadow-md">
      <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
        <CardTitle className="text-2xl text-blue-900">Personal Information</CardTitle>
        <CardDescription>
          Keep your contact details up to date so your care team can reach you when it matters most.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">
          <p className="text-sm text-blue-900">
            MindfulSpace uses this information to personalize your experience and coordinate support. Only verified
            members of your care team can view these details.
          </p>
        </div>

        {status === "success" && (
          <Alert className="border-green-200 bg-green-50 text-green-900">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Your profile has been updated.</AlertDescription>
          </Alert>
        )}

        {status === "error" && errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Alex Johnson" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-2">
                <FormLabel>Email address</FormLabel>
                <Input value={email} disabled className="bg-slate-100" />
                <FormDescription>This is the email associated with your secure MindfulSpace account.</FormDescription>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl>
                      <Input type="date" max={new Date().toISOString().split("T")[0]} {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 000-0000" autoComplete="tel" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>We send appointment reminders and urgent updates to this number.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Emergency contact</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jamie Jordan" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 111-1111" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormDescription>We only reach out in urgent situations affecting your wellbeing.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Changes are saved to your secure profile and synchronized across MindfulSpace services.
              </p>
              <Button type="submit" disabled={!isDirty || status === "saving"} className="w-full md:w-auto">
                {status === "saving" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

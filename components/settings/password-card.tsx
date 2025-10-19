"use client"

import { useMemo, useRef, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Passwords need at least 8 characters")
      .max(64, "Passwords should be under 64 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

interface PasswordCardProps {
  email: string
  lastSignIn: string | null
}

export function PasswordCard({ email, lastSignIn }: PasswordCardProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const formattedLastSignIn = lastSignIn
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(lastSignIn))
    : "Not available"

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

  const onSubmit = async (values: PasswordFormValues) => {
    setStatus("saving")
    setErrorMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({ password: values.newPassword })

      if (error) {
        throw new Error(error.message || "Unable to update password")
      }

      setStatus("success")
      form.reset({ newPassword: "", confirmPassword: "" })
      scheduleStatusReset()
    } catch (error) {
      console.error("[v0] Password update error:", error)
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.")
      scheduleStatusReset()
    }
  }

  return (
    <Card className="border-blue-100 shadow-md">
      <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
        <CardTitle className="text-2xl text-blue-900">Account security</CardTitle>
        <CardDescription>Update your password and review recent sign-in activity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-900">
          <p className="font-medium">{email}</p>
          <p className="mt-1 text-blue-700">Last sign-in: {formattedLastSignIn}</p>
        </div>

        {status === "success" && (
          <Alert className="border-green-200 bg-green-50 text-green-900">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Your password has been updated.</AlertDescription>
          </Alert>
        )}

        {status === "error" && errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Choose a unique password with a mix of letters, numbers, and symbols for stronger protection.
              </p>
              <Button type="submit" disabled={status === "saving"} className="w-full md:w-auto">
                {status === "saving" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

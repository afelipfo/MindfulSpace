import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

const VALID_PRIVACY_LEVELS = ["public", "encrypted", "anonymized"] as const
type PrivacyLevel = (typeof VALID_PRIVACY_LEVELS)[number]

const sanitizeTimezone = (value: unknown) => {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  // Basic guard to avoid excessively long or malformed identifiers
  return trimmed.length <= 64 ? trimmed : undefined
}

const sanitizePrivacyLevel = (value: unknown): PrivacyLevel | undefined => {
  if (typeof value !== "string") return undefined
  const normalized = value.trim().toLowerCase()
  return (VALID_PRIVACY_LEVELS as readonly string[]).includes(normalized) ? (normalized as PrivacyLevel) : undefined
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    const privacyLevel = sanitizePrivacyLevel(payload.privacyLevel)
    if (privacyLevel) {
      updates.privacy_level = privacyLevel
    }

    const timezone = sanitizeTimezone(payload.timezone)
    if (timezone) {
      updates.timezone = timezone
    }

    const booleanFields: Array<{ key: keyof typeof payload; column: string }> = [
      { key: "emailNotifications", column: "email_notifications" },
      { key: "smsNotifications", column: "sms_notifications" },
      { key: "productUpdates", column: "product_updates" },
      { key: "aiRecommendations", column: "ai_recommendations" },
      { key: "shareAnonymizedData", column: "share_anonymized_data" },
    ]

    for (const { key, column } of booleanFields) {
      if (typeof payload[key] === "boolean") {
        updates[column] = payload[key]
      }
    }

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)

    if (error) {
      console.error("[v0] Update settings error:", error)
      return NextResponse.json({ error: "Failed to update account settings" }, { status: 500 })
    }

    revalidatePath("/settings")
    revalidatePath("/profile")
    revalidatePath("/dashboard")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Settings API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

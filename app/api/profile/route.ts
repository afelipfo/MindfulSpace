import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"

const sanitizeString = (value: unknown) => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const sanitizeDate = (value: unknown) => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null
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

    const updates = {
      full_name: sanitizeString(payload.fullName),
      date_of_birth: sanitizeDate(payload.dateOfBirth),
      phone: sanitizeString(payload.phone),
      emergency_contact_name: sanitizeString(payload.emergencyContactName),
      emergency_contact_phone: sanitizeString(payload.emergencyContactPhone),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("profiles").update(updates).eq("id", user.id)

    if (error) {
      console.error("[v0] Update profile error:", error)
      return NextResponse.json({ error: "Failed to update profile information" }, { status: 500 })
    }

    revalidatePath("/profile")
    revalidatePath("/settings")
    revalidatePath("/dashboard")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Profile API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

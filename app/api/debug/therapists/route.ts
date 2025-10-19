import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: therapists, error } = await supabase
      .from("therapists")
      .select("id, full_name, email, user_id")
      .order("full_name")

    if (error) throw error

    return NextResponse.json({
      therapists: therapists?.map(t => ({
        id: t.id,
        name: t.full_name,
        email: t.email,
        user_id: t.user_id,
        has_user: !!t.user_id,
      })) || []
    })
  } catch (error) {
    console.error("Error fetching therapists:", error)
    return NextResponse.json({ error: "Failed to fetch therapists" }, { status: 500 })
  }
}

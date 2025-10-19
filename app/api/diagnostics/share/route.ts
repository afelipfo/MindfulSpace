import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { buildDiagnosticsSummary, fetchDiagnosticsReport } from "@/lib/diagnostics/user-report"

export async function POST() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const report = await fetchDiagnosticsReport(user.id)
    const summary = buildDiagnosticsSummary(report)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("[v0] Diagnostics share error:", error)
    return NextResponse.json({ error: "Unable to prepare diagnostics" }, { status: 500 })
  }
}


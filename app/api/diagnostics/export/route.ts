import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { buildDiagnosticsSummary, fetchDiagnosticsReport } from "@/lib/diagnostics/user-report"

export const dynamic = "force-dynamic"

export async function GET() {
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
    const body = `MindfulSpace Diagnostics\nGenerated: ${new Date().toLocaleString()}\n\n${summary}`

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="mindfulspace-diagnostics-${Date.now()}.txt"`,
      },
    })
  } catch (error) {
    console.error("[v0] Diagnostics export error:", error)
    return NextResponse.json({ error: "Failed to generate diagnostics" }, { status: 500 })
  }
}

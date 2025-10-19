import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mood_score, energy_level, stress_level, notes } = await request.json()

    // Generate AI analysis
    let aiAnalysis = null
    let aiMessage = null

    try {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        system: `You are a compassionate mental health AI assistant. Based on the user's mood data, provide a brief, empathetic message (2-3 sentences) that:
- Validates their feelings
- Offers gentle encouragement or coping suggestions
- Is warm and supportive`,
        prompt: `User mood data:
- Mood: ${mood_score}/10
- Energy: ${energy_level}/10
- Stress: ${stress_level}/10
${notes ? `- Notes: ${notes}` : ""}

Provide a supportive message.`,
        maxTokens: 150,
      })

      aiMessage = text
      aiAnalysis = {
        mood_score,
        energy_level,
        stress_level,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("[v0] AI analysis error:", error)
      // Continue without AI analysis if it fails
    }

    // Insert mood log
    const { error } = await supabase.from("mood_logs").insert({
      user_id: user.id,
      mood_score,
      energy_level,
      stress_level,
      notes: notes || null,
      ai_analysis: aiAnalysis,
      ai_message: aiMessage,
    })

    if (error) {
      console.error("[v0] Mood log save error:", error)
      return NextResponse.json({ error: "Failed to save mood log" }, { status: 500 })
    }

    return NextResponse.json({ success: true, ai_message: aiMessage })
  } catch (error) {
    console.error("[v0] Mood log API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const { therapistName, specializations, concerns, goals } = await request.json()

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are a mental health AI assistant helping users write introductory messages to therapists. Generate a warm, professional, and authentic message that:
- Introduces the user briefly
- Mentions relevant concerns and goals
- Expresses interest in the therapist's specializations
- Is 3-4 sentences long
- Sounds natural and personal, not robotic
- Maintains appropriate boundaries`,
      prompt: `Generate an introductory message to ${therapistName}.

Therapist specializations: ${specializations.join(", ")}
User's concerns: ${concerns.join(", ")}
User's goals: ${goals.join(", ")}

Write a warm, authentic message.`,
      maxTokens: 200,
    })

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error("[v0] Generate message API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

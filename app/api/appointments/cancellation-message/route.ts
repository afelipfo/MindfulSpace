import { NextResponse } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"

const openai = process.env.OPENAI_API_KEY ? createOpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

export async function POST(request: Request) {
  try {
    const { therapistName, appointmentDate, reason } = await request.json()

    if (!openai) {
      const fallback = `Hello${therapistName ? ` ${therapistName}` : ""}, I need to cancel our upcoming session scheduled for ${new Date(
        appointmentDate,
      ).toLocaleString()}. Thank you for understanding, and I’d like to reschedule when possible.`
      return NextResponse.json({ message: fallback })
    }

    const formattedDate = appointmentDate ? new Date(appointmentDate).toLocaleString() : "the upcoming session"

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a courteous mental health client composing a short, appreciative cancellation message to your therapist. Keep the tone respectful, acknowledge the cancellation, and express interest in rescheduling if appropriate. Return only the message text.",
      prompt: `Therapist name: ${therapistName ?? "Therapist"}
Session time: ${formattedDate}
Extra context: ${reason ?? "Not provided"}
Compose a concise message (2-3 sentences).`,
      maxTokens: 200,
    })

    return NextResponse.json({ message: text.trim() })
  } catch (error) {
    console.error("[v0] Cancellation message error:", error)
    return NextResponse.json(
      {
        message:
          "Hello, I need to cancel our upcoming session. Thank you for understanding and I look forward to finding another time that works.",
      },
      { status: 200 },
    )
  }
}


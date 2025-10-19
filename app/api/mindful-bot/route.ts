import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] OpenAI API Key exists:", !!process.env.OPENAI_API_KEY)
    console.log("[v0] OpenAI API Key length:", process.env.OPENAI_API_KEY?.length)

    const { message } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 })
    }

    console.log("[v0] Calling OpenAI with message:", message.substring(0, 50))

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Mindful Bot, a compassionate AI wellness companion designed to provide empathetic, supportive responses to people sharing their feelings and mental health concerns.

Your role:
- Listen actively and validate emotions without judgment
- Provide gentle, supportive guidance and coping strategies
- Encourage professional help when appropriate
- Use warm, empathetic language that feels human and caring
- Keep responses concise (2-4 sentences) but meaningful
- Never diagnose or provide medical advice
- If someone expresses crisis thoughts, gently encourage them to reach out to crisis resources

Tone: Warm, empathetic, supportive, non-judgmental, and encouraging.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 200,
      }),
    })

    console.log("[v0] OpenAI response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] OpenAI API error response:", errorText)
      return NextResponse.json(
        {
          error: "OpenAI API error",
          details: errorText,
          status: response.status,
        },
        { status: 500 },
      )
    }

    const data = await response.json()
    console.log("[v0] OpenAI response received successfully")

    const text = data.choices[0]?.message?.content || "I'm here to listen. How are you feeling?"

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error("[v0] Mindful Bot API error:", error)
    console.error("[v0] Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"

const openai = process.env.OPENAI_API_KEY ? createOpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const therapistId = request.nextUrl.searchParams.get("therapistId")

    if (!therapistId) {
      return NextResponse.json({ error: "Therapist ID required" }, { status: 400 })
    }

    const { data: therapist, error: therapistError } = await supabase
      .from("therapists")
      .select("user_id")
      .eq("id", therapistId)
      .single()

    if (therapistError) throw therapistError
    if (!therapist?.user_id) {
      return NextResponse.json({ error: "Therapist not found." }, { status: 404 })
    }

    const therapistUserId = therapist.user_id

    const { data: messages, error } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, content, created_at, is_encrypted, ai_generated")
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${therapistUserId}),and(sender_id.eq.${therapistUserId},recipient_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: true })

    if (error) throw error

    return NextResponse.json({ messages: messages || [] })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { therapistId, content, includeGreeting } = await request.json()

    if (!therapistId || !content) {
      return NextResponse.json({ error: "Therapist ID and content required" }, { status: 400 })
    }

    let finalContent = String(content)

    const therapistResponse = await supabase
      .from("therapists")
      .select("user_id, full_name, specializations, therapy_approaches")
      .eq("id", therapistId)
      .single()

    const therapist = therapistResponse.data

    if (!therapist?.user_id) {
      return NextResponse.json({ error: "Therapist account not configured." }, { status: 400 })
    }

    if (includeGreeting === true && openai) {
      try {
        const specialties = Array.isArray(therapist.specializations) ? therapist.specializations.join(", ") : ""
        const approaches = Array.isArray(therapist.therapy_approaches) ? therapist.therapy_approaches.join(", ") : ""

        const { text } = await generateText({
          model: openai("gpt-4o-mini"),
          system:
            "Write a brief, warm introduction from a new therapy client to their therapist. Mention the therapist's focus areas when helpful, keep it under 4 sentences, and include any additional message provided.",
          prompt: `Therapist name: ${therapist.full_name ?? "Therapist"}
Therapist specialties: ${specialties}
Therapy approaches: ${approaches}
Additional message:
"""
${finalContent}
"""

Compose the completed message ready to send.`,
          maxTokens: 200,
        })

        if (text.trim().length > 0) {
          finalContent = text.trim()
        }
      } catch (error) {
        console.error("[v0] Greeting generation error:", error)
      }
    }

    // Insert message
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_id: therapist.user_id,
        content: finalContent,
        is_encrypted: false,
        ai_generated: includeGreeting === true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

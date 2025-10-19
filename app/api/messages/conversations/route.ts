import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all conversations with last message
    const { data: messages, error } = await supabase
      .from("messages")
      .select("id, sender_id, recipient_id, content, created_at")
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false })

    if (error) throw error

    const conversationsMap = new Map<string, any>()
    const therapistUserIds = new Set<string>()

    messages?.forEach((message) => {
      const otherUserId = message.sender_id === user.id ? message.recipient_id : message.sender_id
      therapistUserIds.add(otherUserId)
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          therapistUserId: otherUserId,
          last_message: message.content,
          last_message_time: message.created_at,
          unread_count: 0,
        })
      }
    })

    const therapistIds = Array.from(therapistUserIds)
    const { data: therapists } = await supabase
      .from("therapists")
      .select("id, user_id, full_name, avatar_url")
      .in("user_id", therapistIds.length > 0 ? therapistIds : ["00000000-0000-0000-0000-000000000000"])

    const conversations = Array.from(conversationsMap.values())
      .map((conversation) => {
        const therapist = therapists?.find((t) => t.user_id === conversation.therapistUserId) ?? null
        if (!therapist) return null
        return {
          id: therapist.id,
          therapist_id: therapist.id,
          therapist_name: therapist.full_name,
          therapist_avatar: therapist.avatar_url,
          last_message: conversation.last_message,
          last_message_time: conversation.last_message_time,
          unread_count: conversation.unread_count,
        }
      })
      .filter(Boolean)

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

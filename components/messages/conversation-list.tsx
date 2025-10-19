"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { MessageCircle } from "lucide-react"

interface Conversation {
  id: string
  therapist_id: string
  therapist_name: string
  therapist_avatar: string | null
  last_message: string
  last_message_time: string
  unread_count: number
}

export function ConversationList({ userId }: { userId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  async function fetchConversations() {
    try {
      const response = await fetch("/api/messages/conversations")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading conversations...</div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <Card className="p-10">
        <div className="flex flex-col items-center text-center gap-3">
          <MessageCircle className="w-16 h-16 text-blue-200" />
          <h3 className="text-xl font-semibold text-blue-900">Start a conversation</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Reach out to a therapist to ask questions, coordinate scheduling, or share how you are feeling between sessions.
          </p>
          <div className="mt-4 flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <p className="text-blue-900 font-medium">Three easy ways to begin:</p>
            <p>• Browse therapists to introduce yourself.</p>
            <p>• Share your diagnostics summary once connected.</p>
            <p>• Keep your care team informed with quick check-ins.</p>
          </div>
          <Link
            href="/therapists"
            className="mt-4 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse therapists
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <Link key={conversation.id} href={`/messages/${conversation.id}`}>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={conversation.therapist_avatar || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {conversation.therapist_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">{conversation.therapist_name}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(conversation.last_message_time).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
              </div>

              {conversation.unread_count > 0 && (
                <Badge className="bg-blue-600 text-white">{conversation.unread_count}</Badge>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

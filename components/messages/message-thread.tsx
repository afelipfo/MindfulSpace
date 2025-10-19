"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  is_encrypted: boolean
}

interface MessageThreadProps {
  userId: string
  therapistId: string
  therapistName: string
  therapistAvatar: string | null
}

export function MessageThread({ userId, therapistId, therapistName, therapistAvatar }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sharingDiagnostics, setSharingDiagnostics] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMessages()
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [therapistId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  async function fetchMessages() {
    try {
      const response = await fetch(`/api/messages?therapistId=${therapistId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const includeGreeting = messages.length === 0
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId,
          content: newMessage,
          includeGreeting,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  async function shareDiagnostics() {
    if (sharingDiagnostics) return
    setSharingDiagnostics(true)
    try {
      const response = await fetch("/api/diagnostics/share", { method: "POST" })
      const data = await response.json()
      if (!response.ok || !data.summary) {
        throw new Error(data.error || "Unable to prepare diagnostics summary")
      }

      const sendResponse = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ therapistId, content: data.summary }),
      })

      if (!sendResponse.ok) throw new Error("Failed to share diagnostics")

      fetchMessages()
    } catch (error) {
      console.error("[v0] Share diagnostics error:", error)
      alert("Unable to share diagnostics right now. Please try again later.")
    } finally {
      setSharingDiagnostics(false)
    }
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="p-4 border-b flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <Link href="/messages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        <Avatar className="w-10 h-10">
          <AvatarImage src={therapistAvatar || undefined} />
          <AvatarFallback className="bg-blue-100 text-blue-700">
            {therapistName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-gray-900">{therapistName}</h3>
          <p className="text-sm text-gray-500">Licensed Therapist</p>
        </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
          onClick={() => void shareDiagnostics()}
          disabled={sharingDiagnostics}
        >
          <FileText className="mr-2 h-4 w-4" />
          {sharingDiagnostics ? "Sharing…" : "Share diagnostics"}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">Start the conversation by sending a message</p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.sender_id === userId
            return (
              <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isUser ? "text-blue-100" : "text-gray-500"}`}>
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {message.is_encrypted && (
                    <p className={`text-xs mt-1 ${isUser ? "text-blue-100" : "text-gray-500"}`}>🔒 Encrypted</p>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Type your message..."
            className="resize-none"
            rows={2}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">🔒 All messages are encrypted and HIPAA compliant</p>
      </div>
    </Card>
  )
}

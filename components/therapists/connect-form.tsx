"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2, Send } from "lucide-react"
import { useRouter } from "next/navigation"

interface ConnectFormProps {
  therapist: {
    id: string
    full_name: string
    specializations: string[]
  }
  userId: string
  onboarding: any
}

export function ConnectForm({ therapist, userId, onboarding }: ConnectFormProps) {
  const [message, setMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const router = useRouter()

  const handleGenerateMessage = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/therapists/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistName: therapist.full_name,
          specializations: therapist.specializations,
          concerns: onboarding?.concerns || [],
          goals: onboarding?.therapy_goals || [],
        }),
      })

      if (!response.ok) throw new Error("Failed to generate message")

      const data = await response.json()
      setMessage(data.message)
    } catch (error) {
      console.error("[v0] Generate message error:", error)
      alert("Failed to generate message. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setIsSending(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId: therapist.id,
          content: message,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      router.push(`/messages/${therapist.id}`)
    } catch (error) {
      console.error("[v0] Send message error:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="border-blue-100 shadow-lg">
        <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
          <CardTitle className="text-2xl text-blue-900">Connect with {therapist.full_name}</CardTitle>
          <CardDescription>Send an introductory message to start your therapeutic journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900 leading-relaxed">
              Your message will be sent securely with privacy protection. The therapist will review your message and
              respond within 24-48 hours.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Your Message</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateMessage}
                disabled={isGenerating}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-3 w-3" />
                    AI Generate
                  </>
                )}
              </Button>
            </div>
            <Textarea
              placeholder="Introduce yourself and explain what brings you to therapy..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-48 border-blue-200 focus:border-blue-400"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Share what you're hoping to work on and why you're interested in this therapist
            </p>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={isSending || !message.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

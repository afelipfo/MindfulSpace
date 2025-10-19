"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Bookmark, ExternalLink, Music, BookOpen, MapPin, Activity } from "lucide-react"
import { useRouter } from "next/navigation"

interface Recommendation {
  id: string
  type: string
  title: string
  description: string
  external_url?: string
  image_url?: string
  ai_reasoning: string
  relevance_score: number
  user_feedback?: string
}

export function RecommendationCard({ recommendation, userId }: { recommendation: Recommendation; userId: string }) {
  const [feedback, setFeedback] = useState(recommendation.user_feedback)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleFeedback = async (newFeedback: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/recommendations/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          feedback: newFeedback,
        }),
      })

      if (!response.ok) throw new Error("Failed to save feedback")

      setFeedback(newFeedback)
      router.refresh()
    } catch (error) {
      console.error("[v0] Feedback error:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getIcon = () => {
    switch (recommendation.type) {
      case "music":
        return <Music className="h-5 w-5 text-purple-600" />
      case "book":
        return <BookOpen className="h-5 w-5 text-blue-600" />
      case "place":
        return <MapPin className="h-5 w-5 text-green-600" />
      case "activity":
        return <Activity className="h-5 w-5 text-orange-600" />
      default:
        return null
    }
  }

  return (
    <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg text-blue-900">{recommendation.title}</CardTitle>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            {recommendation.relevance_score}
          </div>
        </div>
        <CardDescription className="line-clamp-2">{recommendation.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-900">Why we recommend this:</p>
          <p className="mt-1 text-xs text-blue-800 leading-relaxed">{recommendation.ai_reasoning}</p>
        </div>

        {recommendation.external_url && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full border-blue-200 hover:bg-blue-50 bg-transparent"
          >
            <a href={recommendation.external_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Learn More
            </a>
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFeedback("helpful")}
            disabled={isUpdating}
            className={`flex-1 ${feedback === "helpful" ? "border-green-500 bg-green-50 text-green-700" : "border-blue-200 bg-transparent"}`}
          >
            <ThumbsUp className="mr-1 h-3 w-3" />
            Helpful
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFeedback("not_helpful")}
            disabled={isUpdating}
            className={`flex-1 ${feedback === "not_helpful" ? "border-red-500 bg-red-50 text-red-700" : "border-blue-200 bg-transparent"}`}
          >
            <ThumbsDown className="mr-1 h-3 w-3" />
            Not Helpful
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFeedback("saved")}
            disabled={isUpdating}
            className={`${feedback === "saved" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-blue-200 bg-transparent"}`}
          >
            <Bookmark className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

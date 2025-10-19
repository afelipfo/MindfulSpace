"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Music, BookOpen, MapPin, Activity, Loader2, ArrowRight } from "lucide-react"
import { RecommendationCard } from "@/components/recommendations/recommendation-card"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
  created_at: string
}

interface RecommendationsViewProps {
  userId: string
  recentMoods: any[]
  onboarding: any
  existingRecommendations: Recommendation[]
}

export function RecommendationsView({
  userId,
  recentMoods,
  onboarding,
  existingRecommendations,
}: RecommendationsViewProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [recommendations, setRecommendations] = useState(existingRecommendations)
  const router = useRouter()

  const handleGenerateRecommendations = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/recommendations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recentMoods,
          onboarding,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate recommendations")

      const data = await response.json()
      if (Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations)
      } else {
        router.refresh()
      }
      setIsGenerating(false)
    } catch (error) {
      console.error("[v0] Generate recommendations error:", error)
      alert("Failed to generate recommendations. Please try again.")
      setIsGenerating(false)
    }
  }

  const filterByType = (type: string) => recommendations.filter((r) => r.type === type)

  const musicRecs = filterByType("music")
  const bookRecs = filterByType("book")
  const placeRecs = filterByType("place")
  const activityRecs = filterByType("activity")

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-blue-900">
            <Sparkles className="h-6 w-6" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription className="text-base">
            AI-powered suggestions tailored to your mood and wellness goals
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={handleGenerateRecommendations}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate New Recommendations
              </>
            )}
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recommendations Tabs */}
      <Tabs defaultValue="music" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white">
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Music
          </TabsTrigger>
          <TabsTrigger value="books" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Books
          </TabsTrigger>
          <TabsTrigger value="places" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Places
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="music" className="mt-6">
          {musicRecs.length === 0 ? (
            <Card className="border-blue-100">
              <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
                No music recommendations yet. Generate some above!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {musicRecs.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} userId={userId} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="books" className="mt-6">
          {bookRecs.length === 0 ? (
            <Card className="border-blue-100">
              <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
                No book recommendations yet. Generate some above!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bookRecs.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} userId={userId} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="places" className="mt-6">
          {placeRecs.length === 0 ? (
            <Card className="border-blue-100">
              <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
                No place recommendations yet. Generate some above!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {placeRecs.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} userId={userId} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          {activityRecs.length === 0 ? (
            <Card className="border-blue-100">
              <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
                No activity recommendations yet. Generate some above!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activityRecs.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} userId={userId} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

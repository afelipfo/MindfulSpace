"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Smile, Meh, Frown, Zap, Brain } from "lucide-react"
import { useRouter } from "next/navigation"

export function MoodLogger({ userId }: { userId: string }) {
  const [moodScore, setMoodScore] = useState([7])
  const [energyLevel, setEnergyLevel] = useState([7])
  const [stressLevel, setStressLevel] = useState([5])
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const getMoodIcon = (score: number) => {
    if (score >= 7) return <Smile className="h-6 w-6 text-green-600" />
    if (score >= 4) return <Meh className="h-6 w-6 text-yellow-600" />
    return <Frown className="h-6 w-6 text-red-600" />
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/mood-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood_score: moodScore[0],
          energy_level: energyLevel[0],
          stress_level: stressLevel[0],
          notes,
        }),
      })

      if (!response.ok) throw new Error("Failed to log mood")

      // Reset form
      setMoodScore([7])
      setEnergyLevel([7])
      setStressLevel([5])
      setNotes("")

      // Refresh the page to show new data
      router.refresh()
    } catch (error) {
      console.error("[v0] Mood log error:", error)
      alert("Failed to log your mood. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-blue-100 shadow-lg">
      <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          {getMoodIcon(moodScore[0])}
          How are you feeling today?
        </CardTitle>
        <CardDescription>Track your mood, energy, and stress levels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Mood</Label>
            <span className="text-2xl font-bold text-blue-600">{moodScore[0]}/10</span>
          </div>
          <Slider value={moodScore} onValueChange={setMoodScore} min={1} max={10} step={1} className="py-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Very Low</span>
            <span>Excellent</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Zap className="h-4 w-4 text-yellow-600" />
              Energy Level
            </Label>
            <span className="text-2xl font-bold text-yellow-600">{energyLevel[0]}/10</span>
          </div>
          <Slider value={energyLevel} onValueChange={setEnergyLevel} min={1} max={10} step={1} className="py-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Exhausted</span>
            <span>Energized</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Brain className="h-4 w-4 text-red-600" />
              Stress Level
            </Label>
            <span className="text-2xl font-bold text-red-600">{stressLevel[0]}/10</span>
          </div>
          <Slider value={stressLevel} onValueChange={setStressLevel} min={1} max={10} step={1} className="py-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Very Calm</span>
            <span>Very Stressed</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="What's on your mind? Any triggers or positive moments?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-24 border-blue-200 focus:border-blue-400"
          />
        </div>

        <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? "Logging..." : "Log Mood"}
        </Button>
      </CardContent>
    </Card>
  )
}

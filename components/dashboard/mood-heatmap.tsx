"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface MoodLog {
  id: string
  mood_score: number
  created_at: string
}

export function MoodHeatmap({ moodLogs }: { moodLogs: MoodLog[] }) {
  // Create a map of dates to mood scores
  const moodMap = new Map<string, number>()
  moodLogs.forEach((log) => {
    const date = new Date(log.created_at).toISOString().split("T")[0]
    moodMap.set(date, log.mood_score)
  })

  // Generate last 8 weeks of dates
  const weeks = []
  const today = new Date()
  for (let week = 7; week >= 0; week--) {
    const days = []
    for (let day = 6; day >= 0; day--) {
      const date = new Date(today)
      date.setDate(date.getDate() - week * 7 - day)
      const dateStr = date.toISOString().split("T")[0]
      const moodScore = moodMap.get(dateStr)
      days.push({
        date: dateStr,
        mood: moodScore,
        day: date.getDate(),
      })
    }
    weeks.push(days)
  }

  const getMoodColor = (mood?: number) => {
    if (!mood) return "bg-gray-100"
    if (mood >= 8) return "bg-green-500"
    if (mood >= 6) return "bg-green-300"
    if (mood >= 4) return "bg-yellow-300"
    if (mood >= 2) return "bg-orange-300"
    return "bg-red-300"
  }

  return (
    <Card className="border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Calendar className="h-5 w-5" />
          Mood Heatmap
        </CardTitle>
        <CardDescription>Your mood patterns over the last 8 weeks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`aspect-square rounded ${getMoodColor(day.mood)} transition-colors hover:ring-2 hover:ring-blue-400`}
                  title={`${day.date}: ${day.mood ? `Mood ${day.mood}/10` : "No data"}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-4 w-4 rounded bg-gray-100" />
            <div className="h-4 w-4 rounded bg-yellow-300" />
            <div className="h-4 w-4 rounded bg-green-300" />
            <div className="h-4 w-4 rounded bg-green-500" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

interface MoodLog {
  id: string
  mood_score: number
  energy_level: number
  stress_level: number
  created_at: string
}

export function MoodTrends({ moodLogs }: { moodLogs: MoodLog[] }) {
  // Prepare data for chart (last 14 days)
  const chartData = moodLogs
    .slice(0, 14)
    .reverse()
    .map((log) => ({
      date: new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mood: log.mood_score,
      energy: log.energy_level,
      stress: log.stress_level,
    }))

  if (chartData.length === 0) {
    return (
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="h-5 w-5" />
            Mood Trends
          </CardTitle>
          <CardDescription>Track your mood patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Start logging your mood to see trends
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <TrendingUp className="h-5 w-5" />
          Mood Trends (Last 14 Days)
        </CardTitle>
        <CardDescription>Visualize your emotional patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
            <YAxis domain={[0, 10]} stroke="#6b7280" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="mood" stroke="#3b82f6" strokeWidth={2} name="Mood" />
            <Line type="monotone" dataKey="energy" stroke="#eab308" strokeWidth={2} name="Energy" />
            <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} name="Stress" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

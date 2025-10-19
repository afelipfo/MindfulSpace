import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Smile, Meh, Frown } from "lucide-react"

interface MoodLog {
  id: string
  mood_score: number
  energy_level: number
  stress_level: number
  notes?: string
  created_at: string
}

export function RecentMoodLogs({ moodLogs }: { moodLogs: MoodLog[] }) {
  const getMoodIcon = (score: number) => {
    if (score >= 7) return <Smile className="h-5 w-5 text-green-600" />
    if (score >= 4) return <Meh className="h-5 w-5 text-yellow-600" />
    return <Frown className="h-5 w-5 text-red-600" />
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (moodLogs.length === 0) {
    return (
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Clock className="h-5 w-5" />
            Recent Mood Logs
          </CardTitle>
          <CardDescription>Your latest mood entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center text-muted-foreground">No mood logs yet</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Clock className="h-5 w-5" />
          Recent Mood Logs
        </CardTitle>
        <CardDescription>Your latest mood entries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {moodLogs.map((log) => (
            <div key={log.id} className="flex gap-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex shrink-0 items-center">{getMoodIcon(log.mood_score)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium text-blue-900">Mood: {log.mood_score}/10</span>
                  <span className="text-muted-foreground">Energy: {log.energy_level}/10</span>
                  <span className="text-muted-foreground">Stress: {log.stress_level}/10</span>
                </div>
                {log.notes && <p className="text-sm text-muted-foreground">{log.notes}</p>}
                <p className="text-xs text-muted-foreground">{formatDate(log.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

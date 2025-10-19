import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"

interface MoodLog {
  mood_score: number
  energy_level: number
  stress_level: number
  notes?: string | null
  created_at: string
}

export interface RecommendedGoal {
  title: string
  description: string
  category: string
  frequency: string
  ai_reasoning?: string | null
}

const openai = process.env.OPENAI_API_KEY
  ? createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export async function generateWellnessGoalRecommendations(moodLogs: MoodLog[]): Promise<RecommendedGoal[]> {
  if (!openai) return []
  if (!moodLogs || moodLogs.length === 0) return []

  const recent = moodLogs
    .slice(0, 7)
    .map((log) => {
      const date = new Date(log.created_at).toLocaleDateString()
      return `Date: ${date} | Mood: ${log.mood_score}/10 | Energy: ${log.energy_level}/10 | Stress: ${log.stress_level}/10${log.notes ? ` | Notes: ${log.notes}` : ""}`
    })
    .join("\n")

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are a mental wellness coach. Suggest three actionable wellness goals rooted in CBT/mindfulness best practices. Goals must be realistic, measurable, and supportive of the user's current mood trends. Return ONLY valid JSON array with objects:` +
        ` [{"title":"...","description":"...","category":"mindfulness|exercise|sleep|nutrition|social|therapy|medication|other","frequency":"Daily"|"Weekly"|...,"ai_reasoning":"..."}]`,
      prompt: `Recent mood entries:\n${recent}\nGenerate exactly 3 personalized goals. Ensure frequencies are concise (e.g., "Daily", "3x per week").`,
      maxTokens: 800,
    })

    const match = text.match(/\[.*\]/s)
    if (!match) return []
    const parsed = JSON.parse(match[0]) as any[]
    return parsed
      .filter((goal) => goal?.title && goal?.description)
      .slice(0, 3)
      .map((goal) => ({
        title: String(goal.title),
        description: String(goal.description),
        category: typeof goal.category === "string" ? goal.category.toLowerCase() : "other",
        frequency: typeof goal.frequency === "string" ? goal.frequency : "Weekly",
        ai_reasoning: typeof goal.ai_reasoning === "string" ? goal.ai_reasoning : undefined,
      }))
  } catch (error) {
    console.error("[v0] Goal recommendation error:", error)
    return []
  }
}


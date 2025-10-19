const fallbackByType = {
  music: {
    title: "Weightless by Marconi Union",
    description: "Ambient • Clinically shown to reduce stress and slow heart rate",
    ai_reasoning: "Helps you decompress when mood or energy feels low.",
    relevance_score: 8,
    external_url: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
  },
  book: {
    title: "The Mindful Way Through Depression by Mark Williams",
    description: "Mindfulness workbook • Practical CBT and meditation exercises",
    ai_reasoning: "Builds a steady routine for processing challenging emotions.",
    relevance_score: 8,
    external_url: "https://www.amazon.com/dp/1593851286",
  },
  place: {
    title: "Golden Gate Park",
    description: "Urban park • Open green spaces ideal for grounding walks",
    ai_reasoning: "Offers restorative nature exposure without leaving the city.",
    relevance_score: 7,
    external_url: "https://www.google.com/maps/search/?api=1&query=Golden+Gate+Park",
  },
  activity: {
    title: "10-minute guided breathwork",
    description: "Breathing practice • Calms the nervous system quickly",
    ai_reasoning: "Creates a quick reset ritual for high-stress moments.",
    relevance_score: 7,
    external_url: "https://www.youtube.com/results?search_query=10+minute+guided+breathwork",
  },
} as const

export type RecommendationType = keyof typeof fallbackByType

export interface RecommendationPayload {
  type: RecommendationType | string
  title: string
  description: string
  ai_reasoning: string
  relevance_score: number
  external_url?: string | null
  image_url?: string | null
}

interface EnsureCoverageOptions {
  fallbackOverrides?: Partial<Record<RecommendationType, Omit<RecommendationPayload, "type">>>
}

const requiredTypes: RecommendationType[] = ["music", "book", "place", "activity"]

function cloneFallback(type: RecommendationType, overrides?: EnsureCoverageOptions["fallbackOverrides"]) {
  const fallback = overrides?.[type] ?? fallbackByType[type]
  return { ...fallback, type }
}

export function ensureTypeCoverage(
  recommendations: RecommendationPayload[],
  options: EnsureCoverageOptions = {},
) {
  const result = [...recommendations]
  const presentTypes = new Set(
    recommendations.map((rec) => (requiredTypes.includes(rec.type as RecommendationType) ? rec.type : null)),
  )

  for (const type of requiredTypes) {
    if (!presentTypes.has(type)) {
      result.push(cloneFallback(type, options.fallbackOverrides))
    }
  }

  return result
}

export const fallbackRecommendations = fallbackByType

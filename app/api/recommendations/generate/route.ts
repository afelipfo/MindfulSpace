import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { ensureTypeCoverage } from "@/lib/recommendations/coverage"

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Get Spotify Access Token using Client Credentials Flow
async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured")
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] Spotify token error:", response.status, errorText)
    throw new Error("Failed to get Spotify token")
  }

  const data = await response.json()
  return data.access_token
}

// Fetch music recommendations from Spotify API
async function fetchSpotifyRecommendations(mood: string, energy: number) {
  try {
    const token = await getSpotifyToken()
    console.log("[v0] Got Spotify token successfully")

    // Use only valid Spotify genre seeds that are known to work
    // Limiting to 2 genres to avoid conflicts
    const genreSeeds = mood === "calm" || energy < 5 ? "ambient,chill" : "pop,happy"

    const params = new URLSearchParams({
      seed_genres: genreSeeds,
      target_valence: (energy / 10).toFixed(2), // 0-1 happiness
      target_energy: Math.max(0.3, energy / 10).toFixed(2), // 0-1 energy
      limit: "5",
    })

    const url = `https://api.spotify.com/v1/recommendations?${params.toString()}`
    console.log("[v0] Spotify request URL:", url)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Spotify API error:", response.status, errorText)
      console.error("[v0] Request params:", params.toString())
      return []
    }

    const data = await response.json()
    console.log("[v0] Spotify returned", data.tracks?.length || 0, "tracks")

    if (!data.tracks || data.tracks.length === 0) {
      console.log("[v0] No Spotify tracks in response")
      return []
    }

    // Return up to 5 tracks with Spotify URLs
    return data.tracks.slice(0, 5).map((track: any) => ({
      type: "music",
      title: `${track.name} by ${track.artists[0].name}`,
      description: `${track.album.name} • ${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, "0")}`,
      external_url: track.external_urls.spotify, // Real Spotify track URL
      image_url: track.album.images[0]?.url,
      ai_reasoning: energy < 5 ? "Calming music to help you relax" : "Uplifting music to boost your mood",
      relevance_score: 9,
    }))
  } catch (error) {
    console.error("[v0] Spotify fetch error:", error)
    return []
  }
}

// Fetch place recommendations from Foursquare API
async function fetchFoursquareRecommendations(concerns: string[]) {
  try {
    const apiKey = process.env.FOURSQUARE_API_KEY

    if (!apiKey) {
      throw new Error("Foursquare API key not configured")
    }

    console.log("[v0] Foursquare API key configured:", !!apiKey)

    // Search for wellness places
    const params = new URLSearchParams({
      query: "wellness meditation yoga spa park",
      near: "San Francisco, CA", // Default location
      limit: "5",
    })

    const url = `https://api.foursquare.com/v3/places/search?${params.toString()}`
    console.log("[v0] Foursquare request URL:", url)

    const response = await fetch(url, {
      headers: {
        Authorization: apiKey, // Foursquare v3 uses direct API key without "Bearer" prefix
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Foursquare API error:", response.status, errorText)
      console.error("[v0] Request params:", params.toString())
      return []
    }

    const data = await response.json()
    console.log("[v0] Foursquare returned", data.results?.length || 0, "places")

    if (!data.results || data.results.length === 0) {
      console.log("[v0] No Foursquare places in response")
      return []
    }

    // Return up to 5 places with Google Maps URLs (more reliable than Foursquare URLs)
    return data.results.slice(0, 5).map((place: any) => {
      const lat = place.geocodes?.main?.latitude
      const lng = place.geocodes?.main?.longitude
      const placeName = encodeURIComponent(place.name)

      return {
        type: "place",
        title: place.name,
        description: `${place.location?.address || place.location?.locality || "Location"} • ${place.categories?.[0]?.name || "Wellness spot"}`,
        external_url: lat && lng
          ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${placeName}`
          : `https://www.google.com/maps/search/?api=1&query=${placeName}`,
        ai_reasoning: "A peaceful place to visit for mental wellness",
        relevance_score: 8,
      }
    })
  } catch (error) {
    console.error("[v0] Foursquare fetch error:", error)
    return []
  }
}

// Generate AI music recommendations with Spotify search links (fallback when Spotify API fails)
async function generateAIMusicRecommendations(avgMood: number, avgEnergy: number, onboarding: any) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are a mental wellness AI assistant. Generate music recommendations for mental health.
Return ONLY a valid JSON array with this exact structure:
[
  {
    "type": "music",
    "title": "Song Name by Artist Name",
    "description": "Genre • Why this song helps",
    "ai_reasoning": "Why this helps (1 sentence)",
    "relevance_score": 1-10,
    "search_query": "artist name song name"
  }
]

Use REAL songs and artists that exist. Focus on calming, uplifting, or therapeutic music.`,
      prompt: `User Profile:
- Mood: ${avgMood.toFixed(1)}/10 (1=very low, 10=very high)
- Energy: ${avgEnergy.toFixed(1)}/10 (1=very low, 10=very high)
- Concerns: ${onboarding?.concerns?.join(", ") || "General wellness"}
- Goals: ${onboarding?.goals?.join(", ") || "Overall wellbeing"}

Generate 5 music recommendations personalized to their state.`,
      maxTokens: 800,
    })

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    return recommendations.map((rec: any) => ({
      ...rec,
      external_url: `https://open.spotify.com/search/${encodeURIComponent(rec.search_query)}`,
    }))
  } catch (error) {
    console.error("[v0] AI music generation error:", error)
    return []
  }
}

// Generate AI place recommendations with Google Maps links (fallback when Foursquare API fails)
async function generateAIPlaceRecommendations(onboarding: any) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are a mental wellness AI assistant. Generate place recommendations for mental health.
Return ONLY a valid JSON array with this exact structure:
[
  {
    "type": "place",
    "title": "Place Name",
    "description": "Type of place • Why it helps",
    "ai_reasoning": "Why this helps (1 sentence)",
    "relevance_score": 1-10,
    "search_query": "place name near me"
  }
]

Focus on real, accessible places like parks, gardens, meditation centers, yoga studios, wellness spas, nature trails, etc.`,
      prompt: `User Concerns: ${onboarding?.concerns?.join(", ") || "General wellness"}
User Goals: ${onboarding?.goals?.join(", ") || "Overall wellbeing"}

Generate 5 place recommendations for mental wellness.`,
      maxTokens: 800,
    })

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    return recommendations.map((rec: any) => ({
      ...rec,
      external_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rec.search_query)}`,
    }))
  } catch (error) {
    console.error("[v0] AI place generation error:", error)
    return []
  }
}

// Generate AI book and activity recommendations with Amazon links
async function generateAIBookAndActivityRecommendations(
  avgMood: number,
  avgStress: number,
  avgEnergy: number,
  onboarding: any,
) {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are a mental wellness AI assistant. Generate book and activity recommendations.
Return ONLY a valid JSON array with this exact structure:
[
  {
    "type": "book|activity",
    "title": "Name (include author for books)",
    "description": "Brief description (1-2 sentences)",
    "ai_reasoning": "Why this helps (1 sentence)",
    "relevance_score": 1-10,
    "search_query": "Exact book title and author OR activity name"
  }
]

For books: Use REAL book titles and authors (e.g., "The Anxiety and Phobia Workbook by Edmund Bourne")
For activities: Use specific activity names (e.g., "Guided meditation for anxiety")`,
      prompt: `User Profile:
- Mood: ${avgMood.toFixed(1)}/10 (1=very low, 10=very high)
- Energy: ${avgEnergy.toFixed(1)}/10 (1=very low, 10=very high)
- Stress: ${avgStress.toFixed(1)}/10 (1=very low, 10=very high)
- Concerns: ${onboarding?.concerns?.join(", ") || "General wellness"}
- Goals: ${onboarding?.goals?.join(", ") || "Overall wellbeing"}

Generate:
- 5 REAL mental health book recommendations with actual titles and authors
- 5 specific activity recommendations

Make them realistic and personalized to the user's state.`,
      maxTokens: 1500,
    })

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    // Add platform-specific URLs
    return recommendations.map((rec: any) => ({
      ...rec,
      external_url:
        rec.type === "book"
          ? `https://www.amazon.com/s?k=${encodeURIComponent(rec.search_query)}&i=stripbooks`
          : `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.search_query)}`,
    }))
  } catch (error) {
    console.error("[v0] AI book/activity error:", error)
    return []
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { recentMoods, onboarding } = await request.json()

    // Calculate average mood metrics
    const avgMood =
      recentMoods.length > 0
        ? recentMoods.reduce((sum: number, m: any) => sum + m.mood_score, 0) / recentMoods.length
        : 5
    const avgEnergy =
      recentMoods.length > 0
        ? recentMoods.reduce((sum: number, m: any) => sum + m.energy_level, 0) / recentMoods.length
        : 5
    const avgStress =
      recentMoods.length > 0
        ? recentMoods.reduce((sum: number, m: any) => sum + m.stress_level, 0) / recentMoods.length
        : 5

    // Fetch recommendations from all sources in parallel
    console.log("[v0] Fetching recommendations from Spotify, Foursquare, and AI...")
    const [spotifyRecs, foursquareRecs, aiRecs] = await Promise.all([
      fetchSpotifyRecommendations(avgMood < 5 ? "calm" : "uplifting", avgEnergy),
      fetchFoursquareRecommendations(onboarding?.concerns || []),
      generateAIBookAndActivityRecommendations(avgMood, avgStress, avgEnergy, onboarding),
    ])

    // If Spotify API failed, generate AI music recommendations with Spotify search links
    let musicRecs = spotifyRecs
    if (musicRecs.length === 0) {
      console.log("[v0] Spotify API failed, using AI-generated music recommendations...")
      musicRecs = await generateAIMusicRecommendations(avgMood, avgEnergy, onboarding)
    }

    // If Foursquare API failed, generate AI place recommendations with Google Maps links
    let placeRecs = foursquareRecs
    if (placeRecs.length === 0) {
      console.log("[v0] Foursquare API failed, using AI-generated place recommendations...")
      placeRecs = await generateAIPlaceRecommendations(onboarding)
    }

    // Combine all recommendations
    const allRecommendations = ensureTypeCoverage([...musicRecs, ...placeRecs, ...aiRecs])

    if (allRecommendations.length === 0) {
      console.error("[v0] No recommendations generated from any source")
      return NextResponse.json({ error: "No recommendations generated" }, { status: 500 })
    }

    console.log(`[v0] Generated ${allRecommendations.length} total recommendations:`)
    console.log(`  - Music: ${musicRecs.length} (${spotifyRecs.length > 0 ? "Spotify API" : "AI-generated"})`)
    console.log(`  - Places: ${placeRecs.length} (${foursquareRecs.length > 0 ? "Foursquare API" : "AI-generated"})`)
    console.log(`  - AI books/activities: ${aiRecs.length}`)

    // Delete old recommendations first
    await supabase.from("recommendations").delete().eq("user_id", user.id)

    // Insert new recommendations into database
    const recommendationsToInsert = allRecommendations.map((rec: any) => ({
      user_id: user.id,
      type: rec.type,
      title: rec.title,
      description: rec.description,
      ai_reasoning: rec.ai_reasoning,
      relevance_score: rec.relevance_score,
      external_url: rec.external_url || null,
      image_url: rec.image_url || null,
    }))

    const { data: storedRecommendations, error: insertError } = await supabase
      .from("recommendations")
      .insert(recommendationsToInsert)
      .select("*")

    if (insertError) {
      console.error("[v0] Recommendations save error:", insertError)
      return NextResponse.json({ error: "Failed to save recommendations" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: allRecommendations.length,
      recommendations: storedRecommendations ?? [],
    })
  } catch (error) {
    console.error("[v0] Generate recommendations API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

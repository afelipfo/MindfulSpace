import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { ensureTypeCoverage, fallbackRecommendations, type RecommendationPayload } from "@/lib/recommendations/coverage"

const baseItem = {
  title: "Example",
  description: "Example description",
  ai_reasoning: "Because it helps.",
  relevance_score: 5,
  external_url: "https://example.com",
} as const

describe("ensureTypeCoverage", () => {
  it("returns the original list when all required types are present", () => {
    const complete: RecommendationPayload[] = [
      { ...baseItem, type: "music" },
      { ...baseItem, type: "book" },
      { ...baseItem, type: "place" },
      { ...baseItem, type: "activity" },
    ]

    const result = ensureTypeCoverage(complete)

    assert.equal(result.length, 4)
    assert.deepEqual(result, complete)
  })

  it("appends fallback recommendations for missing types", () => {
    const missingTypes: RecommendationPayload[] = [{ ...baseItem, type: "music" }]

    const result = ensureTypeCoverage(missingTypes)

    const types = result.map((rec) => rec.type).sort()
    assert.deepEqual(types, ["activity", "book", "music", "place"])

    const fallbackTitles = ["book", "place", "activity"]
      .map((type) => fallbackRecommendations[type]?.title)
      .filter(Boolean)

    for (const title of fallbackTitles) {
      assert(result.some((rec) => rec.title === title))
    }
  })

  it("supports custom fallback overrides", () => {
    const missingTypes: RecommendationPayload[] = []

    const custom = ensureTypeCoverage(missingTypes, {
      fallbackOverrides: {
        music: {
          title: "Custom Track",
          description: "Tailored",
          ai_reasoning: "Because custom is requested.",
          relevance_score: 9,
          external_url: "https://example.com/custom-track",
        },
      },
    })

    assert(custom.some((rec) => rec.type === "music" && rec.title === "Custom Track"))
  })
})

"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step1Props {
  data: {
    concerns: string[]
    concerns_other?: string
  }
  updateData: (data: any) => void
}

const concernOptions = [
  "Anxiety",
  "Depression",
  "Stress",
  "Trauma/PTSD",
  "Relationship Issues",
  "Grief/Loss",
  "Self-Esteem",
  "Work/Career Stress",
  "Life Transitions",
  "Addiction",
  "Eating Disorders",
  "Sleep Issues",
]

export function OnboardingStep1({ data, updateData }: Step1Props) {
  const toggleConcern = (concern: string) => {
    const updated = data.concerns.includes(concern)
      ? data.concerns.filter((c) => c !== concern)
      : [...data.concerns, concern]
    updateData({ concerns: updated })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {concernOptions.map((concern) => (
          <div key={concern} className="flex items-center space-x-3">
            <Checkbox
              id={concern}
              checked={data.concerns.includes(concern)}
              onCheckedChange={() => toggleConcern(concern)}
              className="border-blue-300"
            />
            <Label htmlFor={concern} className="cursor-pointer text-sm font-normal">
              {concern}
            </Label>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="concerns_other">Other (please specify)</Label>
        <Input
          id="concerns_other"
          placeholder="Any other concerns..."
          value={data.concerns_other || ""}
          onChange={(e) => updateData({ concerns_other: e.target.value })}
          className="border-blue-200 focus:border-blue-400"
        />
      </div>
    </div>
  )
}

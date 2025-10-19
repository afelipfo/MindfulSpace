"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

interface Step3Props {
  data: {
    previous_treatment?: boolean
    current_medications?: string
    therapy_history?: string
  }
  updateData: (data: any) => void
}

export function OnboardingStep3({ data, updateData }: Step3Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Have you received mental health treatment before?</Label>
        <RadioGroup
          value={data.previous_treatment?.toString()}
          onValueChange={(value) => updateData({ previous_treatment: value === "true" })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="treatment-yes" className="border-blue-300" />
            <Label htmlFor="treatment-yes" className="cursor-pointer font-normal">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="treatment-no" className="border-blue-300" />
            <Label htmlFor="treatment-no" className="cursor-pointer font-normal">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="current_medications">Are you currently taking any medications? (Optional)</Label>
        <Textarea
          id="current_medications"
          placeholder="List any medications you're currently taking..."
          value={data.current_medications || ""}
          onChange={(e) => updateData({ current_medications: e.target.value })}
          className="min-h-24 border-blue-200 focus:border-blue-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="therapy_history">Tell us about your previous therapy experience (Optional)</Label>
        <Textarea
          id="therapy_history"
          placeholder="What types of therapy have you tried? What worked or didn't work for you?"
          value={data.therapy_history || ""}
          onChange={(e) => updateData({ therapy_history: e.target.value })}
          className="min-h-32 border-blue-200 focus:border-blue-400"
        />
      </div>
    </div>
  )
}

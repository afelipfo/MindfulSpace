"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Step6Props {
  data: {
    additional_notes?: string
  }
  updateData: (data: any) => void
}

export function OnboardingStep6({ data, updateData }: Step6Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-900 leading-relaxed">
          This is your space to share anything else that might help us support you better. This could include specific
          triggers, cultural considerations, accessibility needs, or any other information you feel is important.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional_notes">Additional information (Optional)</Label>
        <Textarea
          id="additional_notes"
          placeholder="Share anything else you'd like us to know..."
          value={data.additional_notes || ""}
          onChange={(e) => updateData({ additional_notes: e.target.value })}
          className="min-h-40 border-blue-200 focus:border-blue-400"
        />
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-900">You're almost done!</p>
        <p className="mt-1 text-sm text-green-800 leading-relaxed">
          After completing this step, you'll have access to your personalized dashboard with mood tracking, AI
          recommendations, and our therapist marketplace.
        </p>
      </div>
    </div>
  )
}

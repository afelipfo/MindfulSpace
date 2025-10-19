"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Step5Props {
  data: {
    therapist_gender_preference?: string
    therapy_type_preference: string[]
    session_frequency_preference?: string
  }
  updateData: (data: any) => void
}

const therapyTypes = [
  "Cognitive Behavioral Therapy (CBT)",
  "Dialectical Behavior Therapy (DBT)",
  "Psychodynamic Therapy",
  "EMDR",
  "Mindfulness-Based Therapy",
  "Solution-Focused Therapy",
  "Family/Couples Therapy",
  "Group Therapy",
]

export function OnboardingStep5({ data, updateData }: Step5Props) {
  const toggleTherapyType = (type: string) => {
    const updated = data.therapy_type_preference.includes(type)
      ? data.therapy_type_preference.filter((t) => t !== type)
      : [...data.therapy_type_preference, type]
    updateData({ therapy_type_preference: updated })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="therapist_gender">Therapist gender preference (Optional)</Label>
        <Select
          value={data.therapist_gender_preference}
          onValueChange={(value) => updateData({ therapist_gender_preference: value })}
        >
          <SelectTrigger id="therapist_gender" className="border-blue-200">
            <SelectValue placeholder="No preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no_preference">No preference</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="non_binary">Non-binary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Therapy approaches you're interested in (Optional)</Label>
        <div className="grid gap-3">
          {therapyTypes.map((type) => (
            <div key={type} className="flex items-center space-x-3">
              <Checkbox
                id={type}
                checked={data.therapy_type_preference.includes(type)}
                onCheckedChange={() => toggleTherapyType(type)}
                className="border-blue-300"
              />
              <Label htmlFor={type} className="cursor-pointer text-sm font-normal">
                {type}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="session_frequency">Preferred session frequency</Label>
        <Select
          value={data.session_frequency_preference}
          onValueChange={(value) => updateData({ session_frequency_preference: value })}
        >
          <SelectTrigger id="session_frequency" className="border-blue-200">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="biweekly">Every 2 weeks</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="as_needed">As needed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

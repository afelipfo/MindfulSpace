"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Step2Props {
  data: {
    symptoms: string[]
    symptoms_other?: string
    symptom_duration?: string
    symptom_frequency?: string
  }
  updateData: (data: any) => void
}

const symptomOptions = [
  "Persistent sadness",
  "Excessive worry",
  "Panic attacks",
  "Mood swings",
  "Difficulty concentrating",
  "Sleep problems",
  "Fatigue",
  "Loss of interest",
  "Irritability",
  "Physical symptoms (headaches, stomach issues)",
  "Social withdrawal",
  "Intrusive thoughts",
]

export function OnboardingStep2({ data, updateData }: Step2Props) {
  const toggleSymptom = (symptom: string) => {
    const updated = data.symptoms.includes(symptom)
      ? data.symptoms.filter((s) => s !== symptom)
      : [...data.symptoms, symptom]
    updateData({ symptoms: updated })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {symptomOptions.map((symptom) => (
          <div key={symptom} className="flex items-center space-x-3">
            <Checkbox
              id={symptom}
              checked={data.symptoms.includes(symptom)}
              onCheckedChange={() => toggleSymptom(symptom)}
              className="border-blue-300"
            />
            <Label htmlFor={symptom} className="cursor-pointer text-sm font-normal">
              {symptom}
            </Label>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="symptoms_other">Other symptoms</Label>
        <Input
          id="symptoms_other"
          placeholder="Any other symptoms..."
          value={data.symptoms_other || ""}
          onChange={(e) => updateData({ symptoms_other: e.target.value })}
          className="border-blue-200 focus:border-blue-400"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="symptom_duration">How long have you experienced these symptoms?</Label>
          <Select value={data.symptom_duration} onValueChange={(value) => updateData({ symptom_duration: value })}>
            <SelectTrigger id="symptom_duration" className="border-blue-200">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="less_than_month">Less than a month</SelectItem>
              <SelectItem value="1_3_months">1-3 months</SelectItem>
              <SelectItem value="3_6_months">3-6 months</SelectItem>
              <SelectItem value="6_12_months">6-12 months</SelectItem>
              <SelectItem value="over_year">Over a year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="symptom_frequency">How often do you experience these symptoms?</Label>
          <Select value={data.symptom_frequency} onValueChange={(value) => updateData({ symptom_frequency: value })}>
            <SelectTrigger id="symptom_frequency" className="border-blue-200">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rarely">Rarely</SelectItem>
              <SelectItem value="sometimes">Sometimes</SelectItem>
              <SelectItem value="often">Often</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="constantly">Constantly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

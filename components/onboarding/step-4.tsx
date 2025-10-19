"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step4Props {
  data: {
    therapy_goals: string[]
    goals_other?: string
  }
  updateData: (data: any) => void
}

const goalOptions = [
  "Reduce anxiety or stress",
  "Manage depression",
  "Improve relationships",
  "Process trauma",
  "Build self-esteem",
  "Develop coping skills",
  "Improve sleep",
  "Manage anger",
  "Navigate life transitions",
  "Overcome addiction",
  "Improve work-life balance",
  "Better understand myself",
]

export function OnboardingStep4({ data, updateData }: Step4Props) {
  const toggleGoal = (goal: string) => {
    const updated = data.therapy_goals.includes(goal)
      ? data.therapy_goals.filter((g) => g !== goal)
      : [...data.therapy_goals, goal]
    updateData({ therapy_goals: updated })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {goalOptions.map((goal) => (
          <div key={goal} className="flex items-center space-x-3">
            <Checkbox
              id={goal}
              checked={data.therapy_goals.includes(goal)}
              onCheckedChange={() => toggleGoal(goal)}
              className="border-blue-300"
            />
            <Label htmlFor={goal} className="cursor-pointer text-sm font-normal">
              {goal}
            </Label>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals_other">Other goals</Label>
        <Input
          id="goals_other"
          placeholder="Any other goals you'd like to achieve..."
          value={data.goals_other || ""}
          onChange={(e) => updateData({ goals_other: e.target.value })}
          className="border-blue-200 focus:border-blue-400"
        />
      </div>
    </div>
  )
}

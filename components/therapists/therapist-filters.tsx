"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter } from "lucide-react"

export function TherapistFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "any") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/therapists?${params.toString()}`)
  }

  const toggleInsurance = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    if (checked) {
      params.set("insurance", "true")
    } else {
      params.delete("insurance")
    }
    router.push(`/therapists?${params.toString()}`)
  }

  return (
    <Card className="border-blue-100 sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Specialization</Label>
          <Select
            value={searchParams.get("specialization") || "any"}
            onValueChange={(value) => updateFilter("specialization", value)}
          >
            <SelectTrigger className="border-blue-200">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="Anxiety">Anxiety</SelectItem>
              <SelectItem value="Depression">Depression</SelectItem>
              <SelectItem value="Trauma/PTSD">Trauma/PTSD</SelectItem>
              <SelectItem value="Relationship Issues">Relationship Issues</SelectItem>
              <SelectItem value="Grief/Loss">Grief/Loss</SelectItem>
              <SelectItem value="Self-Esteem">Self-Esteem</SelectItem>
              <SelectItem value="Work/Career Stress">Work/Career Stress</SelectItem>
              <SelectItem value="Life Transitions">Life Transitions</SelectItem>
              <SelectItem value="Addiction">Addiction</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Gender Preference</Label>
          <Select value={searchParams.get("gender") || "any"} onValueChange={(value) => updateFilter("gender", value)}>
            <SelectTrigger className="border-blue-200">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Non-binary">Non-binary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Therapy Approach</Label>
          <Select
            value={searchParams.get("approach") || "any"}
            onValueChange={(value) => updateFilter("approach", value)}
          >
            <SelectTrigger className="border-blue-200">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="Cognitive Behavioral Therapy (CBT)">CBT</SelectItem>
              <SelectItem value="Dialectical Behavior Therapy (DBT)">DBT</SelectItem>
              <SelectItem value="EMDR">EMDR</SelectItem>
              <SelectItem value="Psychodynamic Therapy">Psychodynamic</SelectItem>
              <SelectItem value="Mindfulness-Based Therapy">Mindfulness-Based</SelectItem>
              <SelectItem value="Solution-Focused Therapy">Solution-Focused</SelectItem>
              <SelectItem value="Family/Couples Therapy">Family/Couples</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="insurance"
            checked={searchParams.get("insurance") === "true"}
            onCheckedChange={toggleInsurance}
            className="border-blue-300"
          />
          <Label htmlFor="insurance" className="cursor-pointer font-normal">
            Accepts Insurance
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}

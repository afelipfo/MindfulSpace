"use client"

import { useMemo, useState } from "react"
import { Target, Plus, CheckCircle2, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

type GoalStatus = "active" | "completed" | "paused" | "archived"

interface WellnessGoal {
  id: string
  title: string
  description: string
  category: string
  progress: number | null
  target_frequency: string | null
  status: GoalStatus
  ai_reasoning?: string | null
}

export interface RecommendedGoalSuggestion {
  title: string
  description: string
  category: string
  frequency: string
  ai_reasoning?: string | null
}

interface WellnessGoalsProps {
  goals: WellnessGoal[]
  userId: string
  recommendedGoals: RecommendedGoalSuggestion[]
}

const CATEGORY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "mindfulness", label: "Mindfulness" },
  { value: "exercise", label: "Exercise" },
  { value: "sleep", label: "Sleep" },
  { value: "nutrition", label: "Nutrition" },
  { value: "social", label: "Social Connection" },
  { value: "therapy", label: "Therapy" },
  { value: "medication", label: "Medication" },
  { value: "other", label: "Other" },
]

const FREQUENCY_OPTIONS = ["Daily", "Every other day", "3x per week", "Weekly", "Monthly", "Flexible"]

const STATUS_STYLES: Record<GoalStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700" },
  paused: { label: "Paused", className: "bg-yellow-100 text-yellow-700" },
  archived: { label: "Archived", className: "bg-slate-200 text-slate-700" },
}

const CATEGORY_COLORS: Record<string, string> = {
  mindfulness: "text-purple-600",
  exercise: "text-green-600",
  sleep: "text-blue-600",
  nutrition: "text-orange-600",
  social: "text-pink-600",
  therapy: "text-indigo-600",
  medication: "text-amber-600",
}

export function WellnessGoals({ goals: initialGoals, userId: _userId, recommendedGoals }: WellnessGoalsProps) {
  void _userId
  const normalizeGoal = (goal: WellnessGoal): WellnessGoal => ({
    ...goal,
    progress: goal.progress ?? 0,
    status: (goal.status ?? "active") as GoalStatus,
  })

  const [goals, setGoals] = useState<WellnessGoal[]>(() => initialGoals?.map(normalizeGoal) ?? [])
  const [suggestions, setSuggestions] = useState<RecommendedGoalSuggestion[]>(() => recommendedGoals ?? [])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingGoalId, setPendingGoalId] = useState<string | null>(null)
  const [isSavingSuggestion, setIsSavingSuggestion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: CATEGORY_OPTIONS[0]?.value ?? "mindfulness",
    targetFrequency: FREQUENCY_OPTIONS[0],
  })

  const sortedGoals = useMemo(
    () =>
      goals.slice().sort((a, b) => {
        if (a.status === "active" && b.status !== "active") return -1
        if (a.status !== "active" && b.status === "active") return 1
        return (b.progress ?? 0) - (a.progress ?? 0)
      }),
    [goals],
  )

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: CATEGORY_OPTIONS[0]?.value ?? "mindfulness",
      targetFrequency: FREQUENCY_OPTIONS[0],
    })
  }

  const handleCreateGoal = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please add a title and description so your care team understands the goal.")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/wellness-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          targetFrequency: formData.targetFrequency,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || "Unable to save wellness goal.")
      }

      const data = await response.json()
      if (data.goal) {
        const created = normalizeGoal(data.goal as WellnessGoal)
        setGoals((prev) => [created, ...prev])
      }
      resetForm()
      setIsDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create goal right now.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateFromSuggestion = async (suggestion: RecommendedGoalSuggestion) => {
    setIsSavingSuggestion(suggestion.title)
    setError(null)
    try {
      const response = await fetch("/api/wellness-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: suggestion.title,
          description: suggestion.description,
          category: suggestion.category,
          targetFrequency: suggestion.frequency,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || "Unable to save goal.")
      }

      const data = await response.json()
      if (data.goal) {
        const created = normalizeGoal(data.goal as WellnessGoal)
        setGoals((prev) => [created, ...prev])
        setSuggestions((prev) => prev.filter((goal) => goal.title !== suggestion.title))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add recommended goal right now.")
    } finally {
      setIsSavingSuggestion(null)
    }
  }

  const persistGoalUpdate = async (goalId: string, updates: Partial<WellnessGoal>) => {
    try {
      setPendingGoalId(goalId)
      const response = await fetch(`/api/wellness-goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || "Unable to update goal.")
      }

      const data = await response.json()
      if (data.goal) {
        const updated = normalizeGoal(data.goal as WellnessGoal)
        setGoals((prev) => prev.map((goal) => (goal.id === goalId ? updated : goal)))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update goal right now.")
      throw err instanceof Error ? err : new Error("Unable to update goal right now.")
    } finally {
      setPendingGoalId(null)
    }
  }

  const handleProgressChange = (goalId: string, progress: number) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id !== goalId) return goal
        const clamped = Math.max(0, Math.min(100, Math.round(progress)))
        const nextStatus: GoalStatus =
          clamped >= 100 ? "completed" : goal.status === "completed" ? "active" : goal.status
        return { ...goal, progress: clamped, status: nextStatus }
      }),
    )
  }

  const handleProgressCommit = async (goalId: string, value: number[]) => {
    const target = goals.find((goal) => goal.id === goalId)
    if (!target) return

    const progress = value[0]
    const previousGoal = { ...target }
    handleProgressChange(goalId, progress)

    const payload: Partial<WellnessGoal> = {
      progress: Math.round(progress),
    }
    if (progress >= 100) {
      payload.status = "completed"
    }

    await persistGoalUpdate(goalId, payload).catch(() => {
      setGoals((prev) => prev.map((goal) => (goal.id === goalId ? previousGoal : goal)))
    })
  }

  const handleMarkComplete = async (goalId: string) => {
    const previousGoal = goals.find((goal) => goal.id === goalId)
    if (!previousGoal) return
    setGoals((prev) =>
      prev.map((goal) => (goal.id === goalId ? { ...goal, progress: 100, status: "completed" } : goal)),
    )
    await persistGoalUpdate(goalId, { progress: 100, status: "completed" } as Partial<WellnessGoal>).catch(() => {
      setGoals((prev) => prev.map((goal) => (goal.id === goalId ? previousGoal : goal)))
    })
  }

  const handleDeleteGoal = async (goalId: string) => {
    const goal = goals.find((item) => item.id === goalId)
    if (!goal) return
    if (!window.confirm(`Remove "${goal.title}" from your wellness plan?`)) return

    const previous = goals
    setGoals((prev) => prev.filter((item) => item.id !== goalId))

    try {
      const response = await fetch(`/api/wellness-goals/${goalId}`, { method: "DELETE" })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error || "Unable to remove goal.")
      }
    } catch (err) {
      setGoals(previous)
      setError(err instanceof Error ? err.message : "Unable to remove goal right now.")
    }
  }

  const renderGoal = (goal: WellnessGoal) => {
    const categoryClass = CATEGORY_COLORS[goal.category] || "text-gray-600"
    const statusStyle = STATUS_STYLES[goal.status] ?? STATUS_STYLES.active
    const sliderValue = [goal.progress ?? 0]

    return (
      <div key={goal.id} className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-blue-900">{goal.title}</p>
              <Badge variant="secondary" className={statusStyle.className}>
                {statusStyle.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{goal.description}</p>
            {goal.ai_reasoning && (
              <p className="text-xs text-blue-700 bg-blue-50/80 rounded-md px-3 py-2">{goal.ai_reasoning}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className={categoryClass}>Category: {goal.category}</span>
              {goal.target_frequency && <span>Frequency: {goal.target_frequency}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {goal.status !== "completed" && (
              <Button
                size="sm"
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => void handleMarkComplete(goal.id)}
                disabled={pendingGoalId === goal.id}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark complete
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={() => void handleDeleteGoal(goal.id)}
              disabled={pendingGoalId === goal.id}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{goal.progress ?? 0}%</span>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              value={sliderValue}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => handleProgressChange(goal.id, value[0])}
              onValueCommit={(value) => {
                void handleProgressCommit(goal.id, value)
              }}
              disabled={pendingGoalId === goal.id}
              className="flex-1"
            />
            {pendingGoalId === goal.id && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
          </div>
          <Progress value={goal.progress ?? 0} className="h-2" />
        </div>
      </div>
    )
  }

  return (
    <Card className="border-blue-100">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Target className="h-5 w-5" />
            Wellness Goals
          </CardTitle>
          <CardDescription>Track your progress</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setError(null)
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a wellness goal</DialogTitle>
              <DialogDescription>
                Break large intentions into small, measurable steps so you and your care team can celebrate progress together.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="goal-title" className="text-sm font-medium text-blue-900">
                  Goal title
                </label>
                <Input
                  id="goal-title"
                  value={formData.title}
                  onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Ex: Practice a 10-minute mindfulness session"
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="goal-description" className="text-sm font-medium text-blue-900">
                  Description
                </label>
                <Textarea
                  id="goal-description"
                  value={formData.description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Add context or specifics that will help you stay accountable."
                  disabled={isSaving}
                  className="min-h-24"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-900">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-900">Target frequency</label>
                  <Select
                    value={formData.targetFrequency}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, targetFrequency: value }))}
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={() => void handleCreateGoal()} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Save goal"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && !isDialogOpen && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900">AI-recommended goals</p>
                <p className="text-xs text-muted-foreground">Suggested based on your recent mood entries</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {suggestions.map((suggestion) => (
                <div key={suggestion.title} className="rounded-md border border-blue-100 bg-white p-4 shadow-xs">
                  <p className="text-sm font-semibold text-blue-900">{suggestion.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{suggestion.description}</p>
                  {suggestion.ai_reasoning && (
                    <p className="mt-2 text-xs text-blue-700 bg-blue-50/70 rounded px-2 py-1">{suggestion.ai_reasoning}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {suggestion.category}
                    </Badge>
                    <span>Frequency: {suggestion.frequency}</span>
                  </div>
                  <Button
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                    size="sm"
                    onClick={() => void handleCreateFromSuggestion(suggestion)}
                    disabled={isSavingSuggestion === suggestion.title}
                  >
                    {isSavingSuggestion === suggestion.title ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding…
                      </>
                    ) : (
                      "Add to my goals"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-blue-200 bg-blue-50/60 p-6 text-center text-sm text-muted-foreground">
            <p className="font-medium text-blue-900">No active goals yet</p>
            <p className="max-w-sm text-xs">
              Set a simple intention to receive accountability nudges and celebrate your progress over time.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">{sortedGoals.map((goal) => renderGoal(goal))}</div>
        )}
      </CardContent>
    </Card>
  )
}

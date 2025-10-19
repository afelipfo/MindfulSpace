"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { OnboardingStep1 } from "@/components/onboarding/step-1"
import { OnboardingStep2 } from "@/components/onboarding/step-2"
import { OnboardingStep3 } from "@/components/onboarding/step-3"
import { OnboardingStep4 } from "@/components/onboarding/step-4"
import { OnboardingStep5 } from "@/components/onboarding/step-5"
import { OnboardingStep6 } from "@/components/onboarding/step-6"
import { Heart } from "lucide-react"

interface OnboardingData {
  // Step 1
  concerns: string[]
  concerns_other?: string
  // Step 2
  symptoms: string[]
  symptoms_other?: string
  symptom_duration?: string
  symptom_frequency?: string
  // Step 3
  previous_treatment?: boolean
  current_medications?: string
  therapy_history?: string
  // Step 4
  therapy_goals: string[]
  goals_other?: string
  // Step 5
  therapist_gender_preference?: string
  therapy_type_preference: string[]
  session_frequency_preference?: string
  // Step 6
  additional_notes?: string
}

interface OnboardingFlowProps {
  userId: string
  mode?: "review" | "new"
  initialData?: Partial<OnboardingData> | null
}

const DEFAULT_DATA: OnboardingData = {
  concerns: [],
  symptoms: [],
  therapy_goals: [],
  therapy_type_preference: [],
}

export function OnboardingFlow({ userId, mode = "new", initialData }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const isReview = mode === "review"

  const [formData, setFormData] = useState<OnboardingData>(() => ({
    ...DEFAULT_DATA,
    ...initialData,
    concerns: initialData?.concerns ?? [],
    symptoms: initialData?.symptoms ?? [],
    therapy_goals: initialData?.therapy_goals ?? [],
    therapy_type_preference: initialData?.therapy_type_preference ?? [],
  }))

  const totalSteps = 6
  const progress = (currentStep / totalSteps) * 100

  const updateFormData = (data: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...formData }),
      })

      if (!response.ok) throw new Error("Failed to save onboarding data")

      router.push(mode === "review" ? "/dashboard" : "/recommendations")
    } catch (error) {
      console.error("[v0] Onboarding submission error:", error)
      alert("Failed to save your information. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-500">
            <Heart className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-blue-900">MindfulSpace</span>
        </div>
        <h1 className="mb-2 text-3xl font-bold text-blue-900">
          {isReview ? "Refresh your care preferences" : "Welcome to Your Wellness Journey"}
        </h1>
        <p className="text-muted-foreground">
          {isReview
            ? "Update your goals and preferences so your care team always has the latest context."
            : "Help us understand your needs so we can provide personalized support"}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-blue-900">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card className="border-blue-100 shadow-lg">
        <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-green-50">
          <CardTitle className="text-blue-900">
            {currentStep === 1 && "Mental Health Concerns"}
            {currentStep === 2 && "Symptoms & Experiences"}
            {currentStep === 3 && "Treatment History"}
            {currentStep === 4 && "Your Goals"}
            {currentStep === 5 && "Preferences"}
            {currentStep === 6 && "Additional Information"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "What brings you here today? Select all that apply."}
            {currentStep === 2 && "Tell us about the symptoms you've been experiencing."}
            {currentStep === 3 && "Have you received mental health treatment before?"}
            {currentStep === 4 && "What would you like to achieve through therapy?"}
            {currentStep === 5 && "Help us match you with the right therapist."}
            {currentStep === 6 && "Is there anything else you'd like us to know?"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {currentStep === 1 && <OnboardingStep1 data={formData} updateData={updateFormData} />}
          {currentStep === 2 && <OnboardingStep2 data={formData} updateData={updateFormData} />}
          {currentStep === 3 && <OnboardingStep3 data={formData} updateData={updateFormData} />}
          {currentStep === 4 && <OnboardingStep4 data={formData} updateData={updateFormData} />}
          {currentStep === 5 && <OnboardingStep5 data={formData} updateData={updateFormData} />}
          {currentStep === 6 && <OnboardingStep6 data={formData} updateData={updateFormData} />}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
            >
              Back
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                {isSubmitting ? "Saving..." : "Complete Onboarding"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
